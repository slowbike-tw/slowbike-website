import Image from "next/image";
import Link from "next/link";

type LogoSize = "header" | "footer" | "brand";

const sizeClasses: Record<LogoSize, string> = {
  header: "w-[142px] sm:w-[154px]",
  footer: "w-[210px]",
  brand: "w-[260px] sm:w-[310px]",
};

export function Logo({
  light = false,
  size = "header",
}: {
  light?: boolean;
  size?: LogoSize;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${light ? "rounded-xl bg-white px-3 py-2" : ""}`}
      aria-label="SlowBike 官方網站首頁"
    >
      <Image
        src="/brand/slowbike-logo.png"
        alt="SlowBike 官方 Logo"
        width={1800}
        height={517}
        priority={size === "header"}
        className={`h-auto ${sizeClasses[size]}`}
        sizes={size === "brand" ? "(max-width: 640px) 260px, 310px" : `${size === "footer" ? 210 : 154}px`}
      />
    </Link>
  );
}
