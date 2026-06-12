import { MemberGate } from "@/components/member/member-gate";
import { MemberNav } from "@/components/member/member-nav";

export function MemberPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <MemberGate>
          <MemberNav />
          <div className="mt-9">
            <p className="text-xs font-black tracking-[0.22em] text-olive-600">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/50">
              {description}
            </p>
          </div>
          <div className="mt-9">{children}</div>
        </MemberGate>
      </div>
    </section>
  );
}
