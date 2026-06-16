"use client";

import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Package,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import { MemberNav } from "@/components/member/member-nav";

export function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, sendEmailOtp, confirmEmailOtp } = useMemberAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendEmailOtp(email.trim(), {
        displayName: displayName.trim(),
        phone: phone.trim(),
      });
      setSent(true);
      setMessage("驗證碼已寄出，請至 Email 收信。");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "驗證信寄送失敗，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmEmailOtp(email.trim(), otp.trim());
      setMessage("登入成功。");
      router.push(searchParams.get("next") || "/account");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "驗證碼不正確或已失效。",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid min-h-80 place-items-center">
        <LoaderCircle className="animate-spin text-olive-700" />
      </div>
    );
  }

  if (user) {
    const name = user.user_metadata?.display_name || user.email || "SlowBike 會員";
    return (
      <div>
        <MemberNav />
        <div className="mt-8 rounded-[2rem] bg-ink p-7 text-white sm:p-10">
          <p className="text-xs font-black tracking-[0.22em] text-olive-300">
            MEMBER PROFILE
          </p>
          <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em]">
                {name}，歡迎回來
              </h1>
              <p className="mt-3 text-sm text-white/55">{user.email}</p>
              {user.user_metadata?.phone && (
                <p className="mt-1 text-sm text-white/55">
                  {user.user_metadata.phone}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white/70">
              SlowBike 會員
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MemberCard
            href="/account/orders"
            icon={Package}
            title="我的訂單"
            description="查看已建立的訂單、付款狀態與金額。"
          />
          <MemberCard
            href="/account/warranty"
            icon={ShieldCheck}
            title="我的保固"
            description="電子保固資料預留中，正式開放後會顯示於此。"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-[2rem] border border-black/10 bg-white p-7 sm:p-9">
        <span className="grid size-12 place-items-center rounded-full bg-olive-100 text-olive-700">
          <Mail size={22} />
        </span>
        <h1 className="mt-7 text-3xl font-black tracking-[-0.04em]">
          Email 一次性驗證登入
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink/50">
          不需要設定密碼。登入後可查看你的 SlowBike 訂單與保固資料。
        </p>

        {!sent ? (
          <form onSubmit={handleSendOtp} className="mt-7 grid gap-4">
            <Input
              label="姓名"
              value={displayName}
              onChange={setDisplayName}
              required
              autoComplete="name"
            />
            <Input
              label="手機"
              value={phone}
              onChange={setPhone}
              type="tel"
              autoComplete="tel"
            />
            <Input
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              required
              autoComplete="email"
            />
            <SubmitButton loading={loading}>寄出 Email 驗證碼</SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-7 grid gap-4">
            <div className="rounded-2xl bg-olive-50 p-4 text-sm font-bold text-olive-800">
              驗證碼已寄至 {email}
            </div>
            <Input
              label="Email 驗證碼"
              value={otp}
              onChange={setOtp}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
            <SubmitButton loading={loading}>完成登入</SubmitButton>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setOtp("");
                setMessage("");
              }}
              className="text-sm font-black text-olive-700"
            >
              更換 Email
            </button>
          </form>
        )}

        {message && (
          <p className="mt-5 flex items-start gap-2 text-sm font-bold text-olive-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
            {message}
          </p>
        )}
        {error && <p className="mt-5 text-sm font-bold text-red-700">{error}</p>}
      </div>

      <div className="rounded-[2rem] bg-sand p-7 sm:p-9">
        <Smartphone className="text-olive-700" />
        <h2 className="mt-7 text-2xl font-black">手機 OTP 架構預留</h2>
        <p className="mt-3 text-sm leading-7 text-ink/50">
          V0 先使用 Email OTP。手機登入、LINE Login 與更完整會員功能會在後續階段開放。
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="grid gap-2 text-xs font-black text-ink/55">
      {label}
      <input
        {...props}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-2xl border border-black/10 bg-sand px-4 text-base text-ink outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-100"
      />
    </label>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white disabled:opacity-50"
    >
      {loading ? <LoaderCircle className="animate-spin" size={18} /> : children}
    </button>
  );
}

function MemberCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft"
    >
      <Icon className="text-olive-700" />
      <h2 className="mt-8 text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-ink/50">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-olive-700">
        查看內容 <ArrowRight size={16} />
      </span>
    </Link>
  );
}
