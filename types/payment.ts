export type PaymentProvider = "newebpay";

export type PaymentTransactionStatus =
  | "created"
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentTransaction = {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  merchantOrderNo: string;
  amount: number;
  currency: "TWD";
  status: PaymentTransactionStatus;
  providerTradeNo: string | null;
  responseCode: string | null;
  responseMessage: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};
