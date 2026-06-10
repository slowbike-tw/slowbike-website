import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className={`text-xs font-black tracking-[0.26em] ${light ? "text-olive-300" : "text-olive-600"}`}>
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-5 leading-8 ${light ? "text-white/60" : "text-ink/60"}`}>{description}</p>
      )}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "outline";
}) {
  const styles = {
    dark: "bg-ink text-white hover:bg-olive-700",
    light: "bg-white text-ink hover:bg-sand",
    outline: "border border-current bg-transparent hover:bg-white/10",
  };

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition ${styles[variant]}`}
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden bg-ink text-white">
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="absolute -right-20 top-1/2 size-80 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute -right-5 top-1/2 size-52 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black tracking-[0.28em] text-olive-300">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">{description}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function CheckList({ items, light = false }: { items: string[]; light?: boolean }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className={`flex items-center gap-3 text-sm font-bold ${light ? "text-white/75" : "text-ink/75"}`}>
          <span
            className={`grid size-6 shrink-0 place-items-center rounded-full ${
              light ? "bg-white/10 text-olive-300" : "bg-olive-100 text-olive-700"
            }`}
          >
            <Check size={14} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function BikePlaceholder({ name, mark }: { name: string; mark: string }) {
  return (
    <div className="relative flex h-full min-h-64 items-center justify-center overflow-hidden">
      <span className="absolute left-5 top-4 text-xs font-black tracking-[0.24em] text-white/45">{mark}</span>
      <div className="absolute size-48 rounded-full border border-white/15 sm:size-56" />
      <div className="absolute h-px w-4/5 rotate-[-18deg] bg-white/10" />
      <div className="relative text-center">
        <span className="block text-[10px] font-black tracking-[0.4em] text-white/45">SLOWBIKE SERIES</span>
        <span className="mt-3 block text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">{name}</span>
        <span className="mx-auto mt-5 block h-1 w-12 rounded-full bg-olive-300" />
      </div>
    </div>
  );
}
