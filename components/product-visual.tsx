import Image from "next/image";

export function ProductVisual({
  name,
  series,
  image,
  tone,
  priority = false,
  compact = false,
}: {
  name: string;
  series: string;
  image: string | null;
  tone: string;
  priority?: boolean;
  compact?: boolean;
}) {
  if (image) {
    return (
      <div className="relative h-full min-h-64 overflow-hidden">
        <Image
          src={image}
          alt={`${name} ${series}電動腳踏車`}
          fill
          priority={priority}
          className="object-cover"
          sizes={compact ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 60vw"}
        />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-64 items-center justify-center overflow-hidden"
      style={{ backgroundImage: tone }}
    >
      <div className="absolute -right-10 -top-10 size-52 rounded-full border border-white/10" />
      <div className="absolute -bottom-20 -left-14 size-64 rounded-full border border-white/10" />
      <div className="absolute h-px w-[85%] -rotate-12 bg-white/10" />
      <div className="absolute size-44 rounded-full border border-white/15 sm:size-56" />
      <div className="relative px-6 text-center text-white">
        <span className="block text-[9px] font-black tracking-[0.42em] text-white/45">SLOWBIKE</span>
        <span className={`mt-3 block font-black tracking-[-0.07em] ${compact ? "text-4xl" : "text-5xl sm:text-7xl"}`}>
          {name}
        </span>
        <span className="mt-4 block text-[10px] font-bold tracking-[0.26em] text-white/55">{series}</span>
      </div>
      <span className="absolute bottom-5 right-5 text-[9px] font-bold tracking-[0.18em] text-white/30">
        IMAGE PREVIEW
      </span>
    </div>
  );
}
