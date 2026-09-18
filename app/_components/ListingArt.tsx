/** Duotone skyline in the Scout purple family — stands in until real listing photos arrive. */
export default function ListingArt({ variant, uid }: { variant: number; uid: string }) {
  const skylines = [
    [[8, 58, 22], [34, 40, 18], [56, 66, 26], [86, 30, 20], [110, 52, 24], [138, 44, 18], [160, 62, 28], [192, 48, 20]],
    [[4, 46, 20], [28, 24, 16], [48, 56, 22], [74, 16, 18], [96, 38, 22], [122, 60, 26], [152, 28, 18], [174, 50, 24], [200, 40, 14]],
    [[10, 70, 40], [56, 62, 36], [98, 74, 44], [148, 64, 34], [186, 72, 30]],
  ][variant % 3];
  const id = `sky-${uid}`;
  return (
    <svg viewBox="0 0 212 104" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D1CFED" />
          <stop offset="1" stopColor="#E7E5F4" />
        </linearGradient>
      </defs>
      <rect width="212" height="104" fill={`url(#${id})`} />
      <circle cx={variant === 1 ? 168 : 44} cy="30" r="14" fill="#F7F7FC" opacity="0.9" />
      {skylines.map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={104 - y} fill={i % 2 ? "#6459B2" : "#3A307F"} opacity={i % 2 ? 0.75 : 0.9} />
          {Array.from({ length: Math.floor((104 - y - 8) / 9) }).map((_, r) => (
            <rect key={r} x={x + 3} y={y + 5 + r * 9} width={w - 6} height="2" fill="#F7F7FC" opacity="0.28" />
          ))}
        </g>
      ))}
      <rect y="96" width="212" height="8" fill="#2C255E" opacity="0.9" />
    </svg>
  );
}
