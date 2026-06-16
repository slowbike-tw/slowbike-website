"use client";

import { CreditCard, Landmark, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useMemberAuth } from "@/components/member/auth-provider";
import { fetchOrderDraftByToken } from "@/lib/order-draft-repository";
import type {
  CheckoutPaymentMethod,
  CommerceOrder,
  PaymentSettings,
} from "@/types/commerce";
import type { OrderDraft } from "@/types/order-draft";

const inputClass =
  "min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none focus:border-olive-600";

function toCheckoutDeliveryMethod(method?: string) {
  if (!method) return "恆春店自取";
  if (method.includes("宅配")) return "宅配到府";
  if (method.includes("龜山")) return "龜山店自取";
  return "恆春店自取";
}

function formatPrice(value: number) {
  return `NT$${value.toLocaleString("zh-TW")}`;
}

export function CheckoutPage() {
  const router = useRouter();
  const search = useSearchParams();
  const draftToken = search.get("draft") ?? "";
  const { user, session, ready } = useMemberAuth();
  const { items, clearCart } = useCart();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lineId, setLineId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("恆春店自取");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("credit");
  const [bank, setBank] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!draftToken && user) {
      setName(user.user_metadata?.display_name ?? "");
      setPhone(user.user_metadata?.phone ?? user.phone ?? "");
      setEmail(user.email ?? "");
    }
  }, [draftToken, user]);

  useEffect(() => {
    if (!draftToken) return;
    setDraftLoading(true);
    setDraftError("");
    fetchOrderDraftByToken(draftToken)
      .then((rows) => {
        const nextDraft = rows[0] ?? null;
        setDraft(nextDraft);
        if (!nextDraft) {
          setDraftError("找不到這筆付款連結，請聯繫 SlowBike 協助確認。");
          return;
        }
        setName(nextDraft.customer_name ?? "");
        setPhone(nextDraft.customer_phone ?? "");
        setEmail(nextDraft.customer_email ?? "");
        setLineId(nextDraft.line_id ?? "");
        setDeliveryMethod(toCheckoutDeliveryMethod(nextDraft.delivery_method));
        setAddress(nextDraft.shipping_address ?? "");
        setNote(nextDraft.notes ?? "");
      })
      .catch(() => {
        setDraftError("付款連結讀取失敗，請稍後再試或聯繫 SlowBike。");
      })
      .finally(() => setDraftLoading(false));
  }, [draftToken]);

  useEffect(() => {
    fetch("/api/settings/payment")
      .then((response) => response.json())
      .then(setBank)
      .catch(() => {});
  }, []);

  const cartQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const draftSubtotal = draft?.total ?? 0;
  const deliveryFee = deliveryMethod === "宅配到府" ? 800 : 0;
  const displayTotal = draftToken ? draftSubtotal + deliveryFee : undefined;

  const paymentMethods: Array<[CheckoutPaymentMethod, string]> = [
    ["credit", "信用卡一次付清"],
    ["credit-3", "信用卡 3 期零利率"],
    ["credit-6", "信用卡 6 期零利率"],
    ["credit-12", "信用卡 12 期零利率"],
    ["atm", "ATM 轉帳"],
  ];

  const orderSummary = useMemo(() => {
    if (draftToken && draft) return draft.items;
    return [];
  }, [draft, draftToken]);

  if (!ready || draftLoading) {
    return (
      <div className="grid min-h-72 place-items-center">
        <LoaderCircle className="animate-spin text-olive-700" />
      </div>
    );
  }

  if (!draftToken && (!user || !session)) {
    router.replace(`/account?next=${encodeURIComponent("/checkout")}`);
    return (
      <div className="grid min-h-72 place-items-center font-bold">
        正在前往會員登入...
      </div>
    );
  }

  if (!draftToken && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-3xl font-black">購物車目前是空的</h1>
      </div>
    );
  }

  if (draftToken && draftError) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-3xl font-black">付款連結無法使用</h1>
        <p className="mt-4 text-sm leading-7 text-ink/55">{draftError}</p>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draftToken && !session) return;
    if (deliveryMethod === "宅配到府" && !address.trim()) {
      setError("宅配到府請填寫收件地址。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const authHeaders: Record<string, string> = session
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          cartItems: items,
          draftToken: draftToken || undefined,
          customer: { name, phone, email, lineId, address },
          deliveryMethod,
          note,
          paymentMethod,
        }),
      });
      const order = (await response.json()) as CommerceOrder & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(order.error || "建立訂單失敗，請稍後再試。");
      }

      if (!draftToken) clearCart();
      if (paymentMethod === "atm") {
        router.push(
          `/checkout/payment/atm?order=${encodeURIComponent(order.order_no)}`,
        );
        return;
      }

      const paymentResponse = await fetch("/api/payments/newebpay", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          orderId: order.id,
          checkoutToken: order.checkout_token,
        }),
      });
      const payment = (await paymentResponse.json()) as {
        action?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!paymentResponse.ok || !payment.action || !payment.fields) {
        throw new Error(payment.error || "建立付款請求失敗，請稍後再試。");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = payment.action;
      for (const [key, value] of Object.entries(payment.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "送出訂單時發生錯誤。",
      );
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
      <p className="text-xs font-black tracking-[0.2em] text-olive-600">
        SECURE CHECKOUT
      </p>
      <h1 className="mt-3 text-4xl font-black">確認訂單與付款</h1>
      {draftToken && (
        <p className="mt-3 text-sm font-bold text-ink/50">
          此付款連結可直接完成付款；首次登入會員中心時，再用 Email OTP
          驗證即可查看訂單與物流。
        </p>
      )}

      <form
        onSubmit={submit}
        className="mt-9 grid gap-7 lg:grid-cols-[1fr_380px]"
      >
        <div className="grid gap-6">
          <Panel title="收件資料">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="收件人姓名" value={name} setValue={setName} required />
              <Field label="收件人電話" value={phone} setValue={setPhone} required />
              <Field
                label="Email"
                value={email}
                setValue={setEmail}
                type="email"
                required
              />
              <Field label="LINE ID（選填）" value={lineId} setValue={setLineId} />
            </div>
          </Panel>

          <Panel title="交車方式">
            <div className="grid gap-3 sm:grid-cols-3">
              {["恆春店自取", "龜山店自取", "宅配到府"].map((method) => (
                <Choice
                  key={method}
                  selected={deliveryMethod === method}
                  onClick={() => setDeliveryMethod(method)}
                >
                  {method}
                  {method === "宅配到府" ? " + NT$800" : ""}
                </Choice>
              ))}
            </div>
            {deliveryMethod === "宅配到府" && (
              <div className="mt-4">
                <Field label="收件地址" value={address} setValue={setAddress} required />
              </div>
            )}
            <label className="mt-4 grid gap-2 text-sm font-bold">
              備註
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={`${inputClass} min-h-28 py-3`}
              />
            </label>
          </Panel>

          <Panel title="付款方式">
            <div className="grid gap-3">
              {paymentMethods.map(([value, label]) => (
                <Choice
                  key={value}
                  selected={paymentMethod === value}
                  onClick={() => setPaymentMethod(value)}
                >
                  <span className="flex items-center gap-3">
                    {value === "atm" ? (
                      <Landmark size={18} />
                    ) : (
                      <CreditCard size={18} />
                    )}
                    {label}
                  </span>
                </Choice>
              ))}
            </div>
            {paymentMethod === "atm" && (
              <div className="mt-4 rounded-2xl bg-sand p-4 text-sm leading-7">
                {bank?.account_number
                  ? `${bank.bank_name}（${bank.bank_code}）｜戶名：${bank.account_name}｜帳號：${bank.account_number}`
                  : "ATM 收款帳戶尚未設定，請先聯繫 SlowBike。"}
              </div>
            )}
          </Panel>
        </div>

        <aside className="h-fit rounded-[2rem] bg-ink p-7 text-white lg:sticky lg:top-28">
          <h2 className="text-2xl font-black">訂單摘要</h2>
          {draftToken && draft ? (
            <div className="mt-5 grid gap-3">
              {orderSummary.map((item, index) => (
                <div key={`${item.productName}-${index}`} className="text-sm">
                  <div className="flex justify-between gap-3 font-black">
                    <span>{item.productName}</span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    {[item.specification, item.color].filter(Boolean).join(" / ")}
                    {`｜數量 ${item.quantity}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-white/55">
              購物車共有 {cartQuantity} 件商品。
            </p>
          )}
          <p className="mt-4 text-sm text-white/55">
            宅配到府加收 NT$800。
          </p>
          {draftToken && displayTotal !== undefined && (
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm text-white/55">應付金額</span>
              <strong className="text-2xl">{formatPrice(displayTotal)}</strong>
            </div>
          )}
          <button
            disabled={loading || (paymentMethod === "atm" && !bank?.account_number)}
            className="mt-7 flex min-h-14 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-black text-ink disabled:opacity-40"
          >
            {loading
              ? "處理中..."
              : paymentMethod === "atm"
                ? "建立 ATM 轉帳訂單"
                : "前往信用卡付款"}
          </button>
          {error && <p className="mt-4 text-sm font-bold text-red-300">{error}</p>}
        </aside>
      </form>
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  setValue,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-14 rounded-2xl border px-4 text-left text-sm font-black ${
        selected
          ? "border-olive-700 bg-olive-700 text-white"
          : "border-black/10 bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}
