/**
 * Original, generated product illustrations.
 *
 * The mock catalog ships without photography, so every product gets a drawn
 * pack shot derived from its dosage form / product type, tinted with a colour
 * picked deterministically from the brand (products of one brand share a
 * colour, like a real brand identity). The output is a plain SVG string so it
 * can be inlined by server components, client components and route handlers.
 * When a real product photo exists, ProductImage renders that instead.
 */

export interface ArtInput {
  id: number;
  name: string;
  strength?: string;
  form?: string;
  type?: string;
  brandName?: string;
}

type Kind =
  | "strip" | "capsule" | "bottle" | "dropper" | "tube" | "pump" | "jar" | "vial" | "inhaler"
  | "spray" | "tub" | "softpack" | "device" | "petbag" | "pillbottle" | "carton";

/** [main, dark, tint] */
const PALETTE: [string, string, string][] = [
  ["#4f46e5", "#312e81", "#e0e7ff"],
  ["#0d9488", "#134e4a", "#ccfbf1"],
  ["#e11d48", "#881337", "#ffe4e6"],
  ["#2563eb", "#1e3a8a", "#dbeafe"],
  ["#d97706", "#78350f", "#fef3c7"],
  ["#059669", "#064e3b", "#d1fae5"],
  ["#7c3aed", "#4c1d95", "#ede9fe"],
  ["#0891b2", "#164e63", "#cffafe"],
  ["#db2777", "#831843", "#fce7f3"],
  ["#65a30d", "#365314", "#ecfccb"],
  ["#ea580c", "#7c2d12", "#ffedd5"],
  ["#475569", "#0f172a", "#e2e8f0"],
];

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

export function artKind(form = "", type = "", seed = 0): Kind {
  const f = form.toLowerCase();
  if (/tablet|caplet|lozenge/.test(f)) return "strip";
  if (/capsule/.test(f)) return "capsule";
  if (/drop/.test(f)) return "dropper";
  if (/inject|vial|ampoule/.test(f)) return "vial";
  if (/inhaler|rotacap/.test(f)) return "inhaler";
  if (/syrup|suspension|solution|elixir|mouthwash|nebuli/.test(f)) return "bottle";
  if (/cream|gel|ointment|paste/.test(f)) return "tube";
  if (/lotion|shampoo|rub|oil|wash/.test(f)) return "pump";
  if (/spray/.test(f)) return "spray";
  if (/powder|granule/.test(f)) return "tub";
  if (/suppositor|sachet/.test(f)) return "carton";
  switch (type) {
    case "beauty": return pick<Kind>(["pump", "tube", "jar", "pump", "tube"], seed);
    case "baby": return pick<Kind>(["softpack", "tube", "pump", "softpack"], seed);
    case "supplement": return pick<Kind>(["pillbottle", "tub", "pillbottle"], seed);
    case "food": return pick<Kind>(["tub", "softpack", "carton"], seed);
    case "healthcare": return pick<Kind>(["device", "device", "carton"], seed);
    case "herbal": return pick<Kind>(["pillbottle", "dropper", "bottle"], seed);
    case "homeopathy": return pick<Kind>(["dropper", "pillbottle"], seed);
    case "homecare": return pick<Kind>(["spray", "pump", "carton"], seed);
    case "pet": return pick<Kind>(["petbag", "tub", "pump"], seed);
    case "veterinary": return pick<Kind>(["vial", "pillbottle", "petbag", "carton"], seed);
    default: return "carton";
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Break a name into at most `lines` lines of roughly `max` characters. */
function wrap(text: string, max: number, lines = 2): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const fit = (w: string) => (w.length > max ? `${w.slice(0, max - 1)}…` : w);
  const out: string[] = [];
  let line = "";
  let i = 0;
  for (; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (next.length <= max) {
      line = next;
      continue;
    }
    if (line) out.push(line);
    if (out.length === lines) break;
    line = fit(words[i]);
  }
  if (out.length < lines && line) out.push(line);
  // Words left over: mark the last line as truncated.
  if (i < words.length && out.length) {
    const last = out[out.length - 1];
    if (!last.endsWith("…")) out[out.length - 1] = `${last.length >= max ? last.slice(0, max - 1) : last}…`;
  }
  return out;
}

interface Ctx {
  main: string;
  dark: string;
  tint: string;
  name: string[];
  strength: string;
}

/** Name + strength block, centred on `cx`, starting at baseline `y`. */
function label(c: Ctx, cx: number, y: number, size: number, color = "#fff", sub = "rgba(255,255,255,.85)") {
  const lh = size * 1.18;
  let s = c.name.map((l, i) => `<text x="${cx}" y="${y + i * lh}" font-size="${size}" font-weight="800" fill="${color}" text-anchor="middle">${esc(l)}</text>`).join("");
  if (c.strength) s += `<text x="${cx}" y="${y + c.name.length * lh + 1}" font-size="${size * 0.72}" font-weight="600" fill="${sub}" text-anchor="middle">${esc(c.strength)}</text>`;
  return s;
}

/** An isometric carton: front face with a brand band, plus top and side faces. */
function carton(c: Ctx, x: number, y: number, w: number, h: number) {
  const d = 14;
  return (
    `<path d="M${x} ${y}l${d} -${d * 0.7}h${w}l-${d} ${d * 0.7}z" fill="${c.tint}" stroke="${c.dark}" stroke-opacity=".15"/>` +
    `<path d="M${x + w} ${y}l${d} -${d * 0.7}v${h}l-${d} ${d * 0.7}z" fill="${c.dark}"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.56}" fill="${c.main}"/>` +
    `<rect x="${x}" y="${y + h * 0.56}" width="${w}" height="4" fill="${c.dark}" opacity=".35"/>` +
    `<circle cx="${x + w - 16}" cy="${y + h - 16}" r="7" fill="${c.main}" opacity=".18"/>` +
    label(c, x + w / 2, y + h * 0.22, Math.min(16, w / 7.5))
  );
}

function blister(c: Ctx, capsule: boolean) {
  let pills = "";
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < 4; k++) {
      const cx = 120 + k * 24;
      const cy = 170 + r * 26;
      pills += `<circle cx="${cx}" cy="${cy}" r="10" fill="#fff" stroke="#cbd5e1"/>`;
      pills += capsule
        ? `<g transform="rotate(35 ${cx} ${cy})"><rect x="${cx - 4}" y="${cy - 8}" width="8" height="8" rx="4" fill="${c.main}"/><rect x="${cx - 4}" y="${cy}" width="8" height="8" rx="4" fill="${c.tint}" stroke="${c.main}" stroke-width=".8"/></g>`
        : `<circle cx="${cx}" cy="${cy}" r="6" fill="${c.tint}" stroke="${c.main}" stroke-width="1"/>`;
    }
  }
  return `<g transform="rotate(-8 160 185)"><rect x="104" y="154" width="112" height="60" rx="8" fill="#e8edf3" stroke="#94a3b8" stroke-opacity=".6"/><rect x="108" y="158" width="104" height="10" rx="4" fill="#fff" opacity=".6"/>${pills}</g>`;
}

const shapes: Record<Kind, (c: Ctx) => string> = {
  strip: (c) => carton(c, 36, 58, 132, 104) + blister(c, false),
  capsule: (c) => carton(c, 36, 58, 132, 104) + blister(c, true),
  carton: (c) => carton(c, 52, 70, 124, 124),
  device: (c) =>
    carton(c, 50, 64, 130, 128) +
    `<path d="M70 168h22l8-16 12 30 10-22h36" fill="none" stroke="${c.main}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  bottle: (c) =>
    `<rect x="94" y="28" width="52" height="24" rx="5" fill="${c.dark}"/>` +
    `<rect x="98" y="52" width="44" height="10" fill="#7c2d12"/>` +
    `<path d="M98 62h44q26 10 26 40v92q0 16-16 16H88q-16 0-16-16v-92q0-30 26-40z" fill="#b45309"/>` +
    `<path d="M84 96q4-14 16-22" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    `<rect x="78" y="112" width="84" height="74" rx="6" fill="#fff"/>` +
    `<rect x="78" y="112" width="84" height="52" rx="6" fill="${c.main}"/><rect x="78" y="156" width="84" height="8" fill="${c.main}"/>` +
    `<path d="M90 176h60" stroke="${c.main}" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>` +
    label(c, 120, 128, 11),
  dropper: (c) =>
    `<path d="M112 20h16l4 30h-24z" fill="${c.dark}"/>` +
    `<rect x="100" y="48" width="40" height="22" rx="5" fill="${c.main}"/>` +
    `<path d="M104 70h32q18 8 18 30v84q0 14-14 14h-40q-14 0-14-14v-84q0-22 18-30z" fill="#92400e" opacity=".92"/>` +
    `<rect x="92" y="112" width="56" height="64" rx="5" fill="#fff"/>` +
    `<rect x="92" y="112" width="56" height="34" rx="5" fill="${c.main}"/>` +
    label({ ...c, name: c.name.map((l) => (l.length > 9 ? `${l.slice(0, 8)}…` : l)) }, 120, 126, 9),
  tube: (c) =>
    `<rect x="62" y="30" width="116" height="14" rx="3" fill="${c.dark}"/>` +
    `<path d="M66 44h108l-16 138H82z" fill="#fff" stroke="${c.main}" stroke-opacity=".25"/>` +
    `<path d="M66 44h108l-7 60H73z" fill="${c.main}"/>` +
    `<rect x="98" y="182" width="44" height="30" rx="6" fill="${c.dark}"/>` +
    label(c, 120, 66, 13) +
    `<path d="M92 150h56M98 162h44" stroke="${c.main}" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>`,
  pump: (c) =>
    `<path d="M104 26h40v10h-26v12h-14z" fill="${c.dark}"/>` +
    `<rect x="112" y="46" width="16" height="22" fill="${c.dark}"/>` +
    `<rect x="102" y="66" width="36" height="16" rx="4" fill="${c.dark}"/>` +
    `<rect x="74" y="80" width="92" height="134" rx="22" fill="${c.main}"/>` +
    `<rect x="84" y="110" width="72" height="76" rx="8" fill="#fff" opacity=".95"/>` +
    `<path d="M86 96q2-8 10-10" stroke="#fff" stroke-opacity=".4" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    label(c, 120, 138, 11, c.dark, c.main),
  jar: (c) =>
    `<rect x="58" y="92" width="124" height="34" rx="10" fill="${c.dark}"/>` +
    `<rect x="62" y="122" width="116" height="84" rx="14" fill="#fff" stroke="${c.main}" stroke-opacity=".25"/>` +
    `<rect x="62" y="134" width="116" height="52" fill="${c.main}"/>` +
    label(c, 120, 151, 12),
  vial: (c) =>
    `<rect x="72" y="60" width="44" height="18" rx="3" fill="${c.main}"/>` +
    `<rect x="78" y="78" width="32" height="10" fill="#cbd5e1"/>` +
    `<rect x="66" y="88" width="56" height="112" rx="10" fill="#e2e8f0" stroke="#94a3b8" stroke-opacity=".6"/>` +
    `<rect x="66" y="120" width="56" height="52" fill="#fff"/><rect x="66" y="120" width="56" height="18" fill="${c.main}"/>` +
    `<text x="94" y="159" font-size="9" font-weight="800" fill="${c.dark}" text-anchor="middle">${esc((c.name[0] ?? "").slice(0, 10))}</text>` +
    `<g transform="rotate(-35 170 140)"><rect x="160" y="70" width="20" height="100" rx="4" fill="#fff" stroke="#94a3b8"/>` +
    `<rect x="162" y="110" width="16" height="58" fill="${c.tint}"/><rect x="167" y="170" width="6" height="16" fill="#94a3b8"/>` +
    `<rect x="168.5" y="186" width="3" height="22" fill="#64748b"/><rect x="156" y="62" width="28" height="8" rx="2" fill="${c.dark}"/></g>`,
  inhaler: (c) =>
    `<rect x="104" y="30" width="40" height="92" rx="12" fill="#cbd5e1" stroke="#94a3b8"/>` +
    `<path d="M92 104h64q10 0 10 10v72q0 10-10 10H92q-10 0-10-10v-72q0-10 10-10z" fill="${c.main}"/>` +
    `<path d="M82 170h-18q-8 0-8 8v12q0 8 8 8h28z" fill="${c.dark}"/>` +
    label({ ...c, name: c.name.slice(0, 1) }, 124, 138, 11),
  spray: (c) =>
    `<path d="M92 34h52l10 18h-24v18h-30z" fill="${c.dark}"/>` +
    `<path d="M144 40l26 6" stroke="${c.dark}" stroke-width="6" stroke-linecap="round"/>` +
    `<rect x="94" y="70" width="44" height="14" fill="${c.dark}"/>` +
    `<path d="M88 84h56q14 0 14 14v100q0 14-14 14H88q-14 0-14-14V98q0-14 14-14z" fill="${c.main}"/>` +
    `<rect x="82" y="118" width="68" height="62" rx="6" fill="#fff"/>` +
    label(c, 116, 140, 10, c.dark, c.main),
  tub: (c) =>
    `<rect x="54" y="56" width="132" height="30" rx="10" fill="${c.dark}"/>` +
    `<path d="M58 84h124l-8 118q-1 12-13 12H79q-12 0-13-12z" fill="${c.main}"/>` +
    `<rect x="70" y="114" width="100" height="62" rx="8" fill="#fff"/>` +
    label(c, 120, 136, 12, c.dark, c.main),
  softpack: (c) =>
    `<path d="M58 54h124l6 16v124q0 14-14 14H66q-14 0-14-14V70z" fill="${c.main}"/>` +
    `<rect x="58" y="46" width="124" height="14" rx="3" fill="${c.dark}"/>` +
    `<path d="M70 62v130M170 62v130" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="4 5"/>` +
    `<circle cx="120" cy="164" r="22" fill="#fff" opacity=".9"/>` +
    `<path d="M120 176l-12-12a8 8 0 0 1 12-10 8 8 0 0 1 12 10z" fill="${c.main}"/>` +
    label(c, 120, 92, 14),
  petbag: (c) =>
    `<path d="M66 50h108l12 158H54z" fill="${c.main}"/>` +
    `<rect x="62" y="40" width="116" height="16" rx="3" fill="${c.dark}"/>` +
    `<g fill="#fff" opacity=".92"><circle cx="120" cy="170" r="14"/><circle cx="100" cy="150" r="6"/><circle cx="113" cy="143" r="6"/><circle cx="127" cy="143" r="6"/><circle cx="140" cy="150" r="6"/></g>` +
    label(c, 120, 86, 14),
  pillbottle: (c) =>
    `<rect x="80" y="40" width="80" height="34" rx="8" fill="${c.dark}"/>` +
    `<path d="M80 50h80M80 58h80M80 66h80" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>` +
    `<rect x="72" y="74" width="96" height="136" rx="16" fill="#fff" stroke="${c.main}" stroke-opacity=".25"/>` +
    `<rect x="72" y="104" width="96" height="70" fill="${c.main}"/>` +
    label(c, 120, 128, 12),
};

export interface ArtOptions {
  /** Include width/height and a font stack; needed when served as a standalone file. */
  standalone?: boolean;
  /** Accessible title. */
  title?: string;
}

export function productArtSvg(p: ArtInput, opts: ArtOptions = {}): string {
  const brandSeed = hash(p.brandName || p.name);
  const [main, dark, tint] = PALETTE[brandSeed % PALETTE.length];
  const kind = artKind(p.form, p.type, hash(String(p.id)));
  const maxChars = kind === "strip" || kind === "capsule" || kind === "carton" || kind === "device" ? 14 : 12;
  const ctx: Ctx = { main, dark, tint, name: wrap(p.name, maxChars), strength: (p.strength ?? "").slice(0, 18) };
  const title = esc(opts.title ?? [p.name, p.strength].filter(Boolean).join(" "));
  const size = opts.standalone ? ` width="480" height="480" font-family="Segoe UI, Helvetica, Arial, sans-serif"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"${size} role="img" aria-label="${title}">` +
    `<rect width="240" height="240" fill="${tint}"/>` +
    `<circle cx="196" cy="42" r="74" fill="#fff" opacity=".45"/><circle cx="30" cy="214" r="46" fill="#fff" opacity=".3"/>` +
    `<ellipse cx="120" cy="218" rx="84" ry="7" fill="#0f172a" opacity=".08"/>` +
    shapes[kind](ctx) +
    `</svg>`
  );
}
