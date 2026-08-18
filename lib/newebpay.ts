import crypto from "crypto";

const NEWEBPAY_ENDPOINTS = {
  production: "https://core.newebpay.com/MPG/mpg_gateway",
  test: "https://ccore.newebpay.com/MPG/mpg_gateway",
};

export function getNewebpayConfig() {
  const env = process.env.NEWEBPAY_ENV === "test" ? "test" : "production";
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID ?? "";
  const hashKey = process.env.NEWEBPAY_HASH_KEY ?? "";
  const hashIv = process.env.NEWEBPAY_HASH_IV ?? "";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.slowbike.com.tw";

  return {
    env,
    endpoint: NEWEBPAY_ENDPOINTS[env],
    merchantId,
    hashKey,
    hashIv,
    siteUrl,
    isConfigured: Boolean(merchantId && hashKey && hashIv),
  };
}

function addPadding(value: string) {
  const blockSize = 32;
  const pad = blockSize - (Buffer.byteLength(value) % blockSize);
  return value + String.fromCharCode(pad).repeat(pad);
}

function removePadding(value: string) {
  const pad = value.charCodeAt(value.length - 1);
  return value.slice(0, -pad);
}

export function createTradeInfo(params: Record<string, string | number>) {
  const { hashKey, hashIv } = getNewebpayConfig();
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.set(key, String(value));
  });
  const cipher = crypto.createCipheriv("aes-256-cbc", hashKey, hashIv);
  cipher.setAutoPadding(false);
  const encrypted =
    cipher.update(addPadding(query.toString()), "utf8", "hex") + cipher.final("hex");
  return encrypted;
}

export function createTradeSha(tradeInfo: string) {
  const { hashKey, hashIv } = getNewebpayConfig();
  return crypto
    .createHash("sha256")
    .update(`HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIv}`)
    .digest("hex")
    .toUpperCase();
}

export function decryptTradeInfo(tradeInfo: string) {
  const { hashKey, hashIv } = getNewebpayConfig();
  const decipher = crypto.createDecipheriv("aes-256-cbc", hashKey, hashIv);
  decipher.setAutoPadding(false);
  const decrypted = decipher.update(tradeInfo, "hex", "utf8") + decipher.final("utf8");
  return JSON.parse(removePadding(decrypted));
}

export function buildMpgPayload(input: {
  merchantOrderNo: string;
  amount: number;
  itemDesc: string;
  email: string;
}) {
  const config = getNewebpayConfig();
  if (!config.isConfigured) throw new Error("藍新金流尚未設定。");

  const params = {
    MerchantID: config.merchantId,
    RespondType: "JSON",
    TimeStamp: Math.floor(Date.now() / 1000),
    Version: "2.0",
    MerchantOrderNo: input.merchantOrderNo,
    Amt: input.amount,
    ItemDesc: input.itemDesc,
    Email: input.email || "support@slowbike.com.tw",
    LoginType: 0,
    CREDIT: 1,
    ReturnURL: `${config.siteUrl}/api/newebpay/return`,
    NotifyURL: `${config.siteUrl}/api/newebpay/notify`,
    ClientBackURL: `${config.siteUrl}/payment/result/${input.merchantOrderNo}`,
  };
  const tradeInfo = createTradeInfo(params);
  return {
    MerchantID: config.merchantId,
    TradeInfo: tradeInfo,
    TradeSha: createTradeSha(tradeInfo),
    Version: "2.0",
    endpoint: config.endpoint,
  };
}

export function normalizeNewebpayResult(body: Record<string, unknown>) {
  const encrypted = String(body.TradeInfo ?? "");
  if (!encrypted) return body;
  return decryptTradeInfo(encrypted) as Record<string, unknown>;
}
