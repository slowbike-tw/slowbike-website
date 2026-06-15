import crypto from "node:crypto";

function credentials() {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
  const hashKey = process.env.NEWEBPAY_HASH_KEY;
  const hashIv = process.env.NEWEBPAY_HASH_IV;
  if (!merchantId || !hashKey || !hashIv) {
    throw new Error("藍新金流環境變數尚未設定");
  }
  return { merchantId, hashKey, hashIv };
}

export function newebpayGateway() {
  return process.env.NEWEBPAY_ENV === "production"
    ? "https://core.newebpay.com/MPG/mpg_gateway"
    : "https://ccore.newebpay.com/MPG/mpg_gateway";
}

export function encryptTradeInfo(params: Record<string, string | number>) {
  const { hashKey, hashIv } = credentials();
  const payload = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  const cipher = crypto.createCipheriv("aes-256-cbc", hashKey, hashIv);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]).toString("hex");
}

export function tradeSha(tradeInfo: string) {
  const { hashKey, hashIv } = credentials();
  return crypto
    .createHash("sha256")
    .update(`HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIv}`)
    .digest("hex")
    .toUpperCase();
}

export function verifyTradeSha(tradeInfo: string, receivedSha: string) {
  const expected = tradeSha(tradeInfo);
  const received = receivedSha.toUpperCase();
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function decryptTradeInfo(tradeInfo: string) {
  const { hashKey, hashIv } = credentials();
  const decipher = crypto.createDecipheriv("aes-256-cbc", hashKey, hashIv);
  decipher.setAutoPadding(true);
  const text = Buffer.concat([
    decipher.update(Buffer.from(tradeInfo, "hex")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(text) as {
    Status: string;
    Message: string;
    Result?: {
      MerchantOrderNo?: string;
      TradeNo?: string;
      Amt?: number;
      PaymentType?: string;
      PayTime?: string;
    };
  };
}

export function createNewebpayFields(params: Record<string, string | number>) {
  const { merchantId } = credentials();
  const tradeInfo = encryptTradeInfo(params);
  return {
    MerchantID: merchantId,
    TradeInfo: tradeInfo,
    TradeSha: tradeSha(tradeInfo),
    Version: "2.0",
  };
}
