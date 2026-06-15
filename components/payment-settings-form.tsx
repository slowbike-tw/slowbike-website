"use client";

import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import type { PaymentSettings } from "@/types/commerce";

const empty: PaymentSettings = { bank_name: "", bank_code: "", account_name: "", account_number: "" };

export function PaymentSettingsForm() {
  const { session, ready } = useMemberAuth();
  const [value, setValue] = useState(empty);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/settings/payment").then((response) => response.json()).then((data) => data && setValue(data));
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    setMessage("");
    const response = await fetch("/api/settings/payment", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(value),
    });
    setMessage(response.ok ? "付款設定已儲存" : "付款設定儲存失敗或沒有權限");
  }
  if (!ready) return <p className="mt-8 font-bold">讀取中...</p>;
  if (!session) return <p className="mt-8 rounded-2xl bg-white p-6 font-bold">請先至會員中心登入後台管理帳號。</p>;
  return <form onSubmit={save} className="mt-8 grid max-w-2xl gap-4 rounded-3xl bg-white p-6 sm:grid-cols-2 sm:p-8">
    {([["bank_name", "銀行名稱"], ["bank_code", "銀行代碼"], ["account_name", "戶名"], ["account_number", "帳號"]] as const).map(([key, label]) => <label key={key} className="grid gap-2 text-sm font-black">{label}<input required value={value[key]} onChange={(event) => setValue((current) => ({ ...current, [key]: event.target.value }))} className="min-h-12 rounded-xl border border-black/10 px-4 text-base" /></label>)}
    <button className="min-h-12 rounded-full bg-olive-700 px-6 font-black text-white sm:col-span-2">儲存付款設定</button>
    {message && <p className="text-sm font-bold text-olive-700 sm:col-span-2">{message}</p>}
  </form>;
}
