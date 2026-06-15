"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import { ErrorState, LoadingState } from "@/components/member/member-orders";
import { fetchMemberWarranties } from "@/lib/member-repository";
import type { MemberWarrantyRow } from "@/types/member";

export function MemberWarranties() {
  const { user, session } = useMemberAuth();
  const [items, setItems] = useState<MemberWarrantyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !session) return;
    let active = true;
    fetchMemberWarranties(user.id, session.access_token)
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch(() => {
        if (active) {
          setError("保固資料暫時無法讀取，請稍後再試。");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, session]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-black/15 bg-white p-9 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-olive-100 text-olive-700">
          <ShieldCheck size={23} />
        </span>
        <h2 className="mt-6 text-xl font-black">目前尚無保固資料</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink/50">
          完成交車與保固登錄後，相關資訊會顯示在這裡。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-3xl bg-white p-6">
          <p className="text-xs font-black tracking-[0.16em] text-olive-600">
            WARRANTY
          </p>
          <h2 className="mt-3 text-xl font-black">{item.product_name}</h2>
          <p className="mt-3 text-sm text-ink/45">
            車身序號：{item.serial_number || "待登錄"}
          </p>
        </article>
      ))}
    </div>
  );
}
