import { PaymentSettingsForm } from "@/components/payment-settings-form";

export default function PaymentSettingsPage() {
  return <main className="min-h-screen bg-sand px-5 py-12 lg:px-10"><p className="text-xs font-black tracking-[0.2em] text-olive-600">ADMIN SETTINGS</p><h1 className="mt-3 text-4xl font-black">付款設定</h1><p className="mt-3 text-sm text-ink/50">ATM 結帳頁將讀取此處設定，帳戶資料不寫死在程式碼。</p><PaymentSettingsForm /></main>;
}
