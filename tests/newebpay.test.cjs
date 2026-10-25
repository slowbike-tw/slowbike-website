const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../lib/newebpay.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(require, loaded, loaded.exports);

for (const env of ["test", "production"]) {
  test(`${env}: encrypted request allows once and 3/6/12 installments`, () => {
    const values = {
      NEWEBPAY_ENV: env,
      NEWEBPAY_MERCHANT_ID: "TEST_MERCHANT",
      NEWEBPAY_HASH_KEY: "12345678901234567890123456789012",
      NEWEBPAY_HASH_IV: "1234567890123456",
      NEXT_PUBLIC_SITE_URL: "https://example.test",
    };
    const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
    Object.assign(process.env, values);
    try {
      const payload = loaded.exports.buildMpgPayload({
        merchantOrderNo: "SB_INSTALLMENT_TEST", amount: 66800,
        itemDesc: "Test product", email: "buyer@example.test",
      });
      const decipher = crypto.createDecipheriv("aes-256-cbc", values.NEWEBPAY_HASH_KEY, values.NEWEBPAY_HASH_IV);
      decipher.setAutoPadding(false);
      const plaintext = Buffer.concat([decipher.update(Buffer.from(payload.TradeInfo, "hex")), decipher.final()]);
      const params = new URLSearchParams(plaintext.subarray(0, plaintext.length - plaintext.at(-1)).toString());
      assert.equal(params.get("CREDIT"), "1");
      assert.equal(params.get("InstFlag"), "3,6,12");
      assert.equal(params.get("Amt"), "66800");
      assert.equal(params.get("MerchantOrderNo"), "SB_INSTALLMENT_TEST");
      assert.equal(params.get("NotifyURL"), "https://example.test/api/newebpay/notify");
      assert.equal(params.get("ReturnURL"), "https://example.test/api/newebpay/return");
      assert.equal(params.get("VACC"), null);
      assert.equal(payload.endpoint, `https://${env === "test" ? "ccore" : "core"}.newebpay.com/MPG/mpg_gateway`);
      const signature = crypto.createHash("sha256")
        .update(`HashKey=${values.NEWEBPAY_HASH_KEY}&${payload.TradeInfo}&HashIV=${values.NEWEBPAY_HASH_IV}`)
        .digest("hex").toUpperCase();
      assert.equal(payload.TradeSha, signature);
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
}
