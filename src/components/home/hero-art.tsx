import type { HeroArt as Art } from "@/config/home.config";

/**
 * Simple original illustrations for hero slides and promo cards, drawn in
 * translucent white so they sit on any gradient from the config.
 */
export function HeroArt({ art, className }: { art: Art; className?: string }) {
  const common = { viewBox: "0 0 320 240", className, "aria-hidden": true, fill: "none" } as const;
  const w = "rgba(255,255,255,.95)";
  const w2 = "rgba(255,255,255,.55)";
  const w3 = "rgba(255,255,255,.22)";
  switch (art) {
    case "pills":
      return (
        <svg {...common}>
          <circle cx="220" cy="120" r="96" fill={w3} />
          <g transform="rotate(-32 170 110)">
            <rect x="96" y="84" width="150" height="56" rx="28" fill={w} />
            <path d="M171 84h47a28 28 0 0 1 0 56h-47z" fill={w2} />
          </g>
          <circle cx="92" cy="176" r="26" fill={w} />
          <path d="M72 176h40" stroke={w2} strokeWidth="5" strokeLinecap="round" />
          <circle cx="262" cy="190" r="18" fill={w2} />
          <rect x="226" y="40" width="70" height="40" rx="10" fill={w3} />
          <g fill={w}>
            <circle cx="242" cy="60" r="7" /><circle cx="261" cy="60" r="7" /><circle cx="280" cy="60" r="7" />
          </g>
        </svg>
      );
    case "skincare":
      return (
        <svg {...common}>
          <circle cx="200" cy="120" r="100" fill={w3} />
          <rect x="150" y="22" width="34" height="12" rx="3" fill={w2} />
          <rect x="160" y="34" width="14" height="22" fill={w2} />
          <rect x="130" y="56" width="74" height="150" rx="24" fill={w} />
          <rect x="144" y="100" width="46" height="60" rx="8" fill={w3} />
          <path d="M226 206h70l-10-120h-50z" fill={w2} />
          <rect x="232" y="70" width="48" height="18" rx="4" fill={w} />
          <path d="M84 70c10 14 16 24 16 32a16 16 0 0 1-32 0c0-8 6-18 16-32z" fill={w} />
          <path d="M60 150c7 10 11 17 11 22a11 11 0 0 1-22 0c0-5 4-12 11-22z" fill={w2} />
        </svg>
      );
    case "baby":
      return (
        <svg {...common}>
          <circle cx="200" cy="120" r="98" fill={w3} />
          <path d="M168 30h28l6 26h-40z" fill={w2} />
          <rect x="152" y="56" width="60" height="16" rx="5" fill={w} />
          <rect x="146" y="72" width="72" height="140" rx="26" fill={w} />
          <path d="M146 120h72M146 150h72M146 180h72" stroke={w3} strokeWidth="4" />
          <path d="M258 90l-14-14a10 10 0 0 1 14-14 10 10 0 0 1 14 14z" fill={w} />
          <path d="M80 60l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill={w2} />
          <circle cx="90" cy="180" r="30" fill={w2} />
          <circle cx="80" cy="175" r="4" fill="rgba(0,0,0,.25)" /><circle cx="100" cy="175" r="4" fill="rgba(0,0,0,.25)" />
          <path d="M80 190q10 8 20 0" stroke="rgba(0,0,0,.25)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "devices":
      return (
        <svg {...common}>
          <circle cx="200" cy="120" r="98" fill={w3} />
          <rect x="120" y="60" width="150" height="120" rx="20" fill={w} />
          <rect x="138" y="78" width="114" height="54" rx="8" fill={w3} />
          <path d="M146 106h22l8-16 12 30 10-22h46" stroke="rgba(0,0,0,.35)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="160" cy="154" r="10" fill={w2} /><circle cx="195" cy="154" r="10" fill={w2} /><circle cx="230" cy="154" r="10" fill={w2} />
          <rect x="52" y="70" width="20" height="120" rx="10" fill={w} />
          <circle cx="62" cy="190" r="16" fill={w} />
          <rect x="58" y="110" width="8" height="70" rx="4" fill="rgba(0,0,0,.25)" />
        </svg>
      );
    case "vitamins":
      return (
        <svg {...common}>
          <circle cx="200" cy="120" r="98" fill={w3} />
          <rect x="140" y="40" width="96" height="36" rx="10" fill={w2} />
          <rect x="130" y="76" width="116" height="140" rx="20" fill={w} />
          <rect x="130" y="110" width="116" height="66" fill={w3} />
          <g transform="rotate(35 80 90)">
            <rect x="56" y="76" width="56" height="26" rx="13" fill={w} />
            <path d="M84 76h15a13 13 0 0 1 0 26H84z" fill={w2} />
          </g>
          <path d="M270 160c30-4 38-36 30-56-24 2-40 22-30 56z" fill={w2} />
          <path d="M270 160c8-20 16-32 26-46" stroke={w} strokeWidth="3" />
          <circle cx="76" cy="176" r="16" fill={w2} />
        </svg>
      );
    case "delivery":
      return (
        <svg {...common}>
          <circle cx="210" cy="120" r="96" fill={w3} />
          <rect x="120" y="80" width="120" height="84" rx="10" fill={w} />
          <path d="M240 104h36l22 28v32h-58z" fill={w2} />
          <rect x="252" y="112" width="26" height="18" rx="3" fill={w} />
          <circle cx="160" cy="176" r="18" fill={w} /><circle cx="160" cy="176" r="7" fill={w3} />
          <circle cx="268" cy="176" r="18" fill={w} /><circle cx="268" cy="176" r="7" fill={w3} />
          <path d="M40 100h60M60 124h40M30 148h70" stroke={w2} strokeWidth="6" strokeLinecap="round" />
          <path d="M168 108v32M152 124h32" stroke="rgba(0,0,0,.25)" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );
  }
}
