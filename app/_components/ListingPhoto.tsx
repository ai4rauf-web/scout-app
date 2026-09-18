/**
 * A listing's photo. The tinted ground shows while it loads, and a soft top
 * shade keeps badges legible over bright skies.
 */
export default function ListingPhoto({ src, alt, eager }: { src: string; alt: string; /** For photos that are on screen the moment they mount */ eager?: boolean }) {
  return (
    <span className="relative block h-full w-full bg-accent-tint">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} className="h-full w-full object-cover" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/25 to-transparent" aria-hidden />
    </span>
  );
}
