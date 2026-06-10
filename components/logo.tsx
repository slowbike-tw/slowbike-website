import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label="SlowBike 即行首頁">
      <span
        className={`grid size-9 place-items-center rounded-full border text-xs font-black tracking-tighter transition-transform group-hover:-rotate-6 ${
          light ? "border-white/40 text-white" : "border-ink/30 text-ink"
        }`}
      >
        SB
      </span>
      <span className={light ? "text-white" : "text-ink"}>
        <span className="block text-lg font-black leading-none tracking-[-0.04em]">SlowBike</span>
        <span className="mt-1 block text-[10px] font-bold tracking-[0.34em] opacity-60">即行</span>
      </span>
    </Link>
  );
}
