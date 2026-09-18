/**
 * The listing pools. Every building is defined once and formats itself for the
 * reply language, so a card never falls back to English by accident.
 * Names, sizes and prices of the Marina and villa pools are illustrative;
 * the Emaar South pool mirrors what the live Scout returned (Sep 2026).
 */

import type { Lang } from "./i18n";
import type { Listing } from "./scripts";

type Local = Record<Exclude<Lang, "en">, string>;
type Unit = { sqft: number; price: number };
type Tower = { name: string; local: Local; img: string; two: Unit; three: Unit };

const nf = (n: number) => n.toLocaleString("en-US");
const trim = (n: number) => String(Number(n.toFixed(2)));

/** "2 BR · 1,474 sqft · Ready" in each language. `when` replaces the ready label, e.g. a handover year. */
function meta(lang: Lang, beds: number, sqft: number, when?: string): string {
  const s = nf(sqft);
  switch (lang) {
    case "zh": return `${beds} 室 · ${s} 平方英尺 · ${when ?? "现房"}`;
    case "ar": return `${beds === 2 ? "غرفتان" : `${beds} غرف`} · ${s} قدم² · ${when ?? "جاهزة"}`;
    case "ja": return `${beds}ベッドルーム · ${s}平方フィート · ${when ?? "即入居可"}`;
    case "ru": return `${beds} спальни · ${s.replace(",", " ")} кв. фт · ${when ?? "Готово"}`;
    case "hi": return `${beds} बेडरूम · ${s} वर्ग फुट · ${when ?? "तैयार"}`;
    default: return `${beds} BR · ${s} sqft · ${when ?? "Ready"}`;
  }
}

/** Prices read the way each market writes them: 万 in Chinese and Japanese, लाख in Hindi, млн in Russian. */
function price(lang: Lang, m: number): string {
  switch (lang) {
    case "zh": return `${trim(m * 100)} 万迪拉姆`;
    case "ar": return `${trim(m)} مليون درهم`;
    case "ja": return `${trim(m * 100)}万ディルハム`;
    case "ru": return `${trim(m).replace(".", ",")} млн дирхамов`;
    case "hi": return `${trim(m * 10)} लाख दिरहम`;
    default: return `AED ${trim(m)}M`;
  }
}

const MARINA: Tower[] = [
  { name: "The Zen Tower", img: "/listings/zen-tower.jpg", two: { sqft: 1474, price: 1.7 }, three: { sqft: 1905, price: 2.4 },
    local: { zh: "禅意大厦", ar: "ذا زين تاور", ja: "ザ・ゼン・タワー", ru: "Зен Тауэр", hi: "द ज़ेन टावर" } },
  { name: "Marina Crown", img: "/listings/marina-crown.jpg", two: { sqft: 1494, price: 1.9 }, three: { sqft: 1980, price: 2.65 },
    local: { zh: "码头皇冠大厦", ar: "مارينا كراون", ja: "マリーナ・クラウン", ru: "Марина Краун", hi: "मरीना क्राउन" } },
  { name: "Marina Diamond 2", img: "/listings/marina-diamond.jpg", two: { sqft: 1355, price: 1.6 }, three: { sqft: 1710, price: 2.3 },
    local: { zh: "码头钻石 2 号", ar: "مارينا دايموند 2", ja: "マリーナ・ダイヤモンド2", ru: "Марина Даймонд 2", hi: "मरीना डायमंड 2" } },
  { name: "Marina Gate 1", img: "/listings/marina-gate.jpg", two: { sqft: 1290, price: 1.98 }, three: { sqft: 1890, price: 2.7 },
    local: { zh: "码头之门 1 号", ar: "مارينا جيت 1", ja: "マリーナ・ゲート1", ru: "Марина Гейт 1", hi: "मरीना गेट 1" } },
  { name: "Damac Heights", img: "/listings/damac-heights.jpg", two: { sqft: 1240, price: 1.95 }, three: { sqft: 1760, price: 2.6 },
    local: { zh: "达马克高地", ar: "داماك هايتس", ja: "ダマック・ハイツ", ru: "Дамак Хайтс", hi: "दमाक हाइट्स" } },
  { name: "Marina Promenade", img: "/listings/marina-promenade.jpg", two: { sqft: 1310, price: 1.85 }, three: { sqft: 1820, price: 2.8 },
    local: { zh: "码头长廊", ar: "مارينا بروميناد", ja: "マリーナ・プロムナード", ru: "Марина Променад", hi: "मरीना प्रोमेनेड" } },
  { name: "Cayan Tower", img: "/listings/cayan-tower.jpg", two: { sqft: 1265, price: 1.99 }, three: { sqft: 1745, price: 2.75 },
    local: { zh: "卡延塔", ar: "برج كيان", ja: "カヤン・タワー", ru: "Каян Тауэр", hi: "कायन टावर" } },
  { name: "Bay Central", img: "/listings/bay-central.jpg", two: { sqft: 1330, price: 1.75 }, three: { sqft: 1690, price: 2.5 },
    local: { zh: "海湾中心", ar: "باي سنترال", ja: "ベイ・セントラル", ru: "Бэй Сентрал", hi: "बे सेंट्रल" } },
];

function towers(lang: Lang, beds: 2 | 3, order: number[], when?: string): Listing[] {
  return order.map((i) => {
    const t = MARINA[i];
    const u = beds === 2 ? t.two : t.three;
    return {
      name: t.name,
      local: lang === "en" ? undefined : t.local[lang],
      meta: meta(lang, beds, u.sqft, when),
      price: price(lang, u.price),
      img: t.img,
    };
  });
}

/** Two-bedroom Marina homes under 2M, best match first. */
export const marinaTwoBed = (lang: Lang, when?: string) => towers(lang, 2, [0, 1, 2, 5, 7, 4, 3, 6], when);
/** Three-bedroom Marina homes, best match first. */
export const marinaThreeBed = (lang: Lang) => towers(lang, 3, [3, 4, 5, 7, 1, 6, 0, 2]);

export const VILLAS: Listing[] = [
  { name: "Joy · Arabian Ranches III", meta: "3 BR · 2,100 sqft · Ready", price: "AED 3.2M", img: "/listings/joy-ranches.jpg" },
  { name: "Maple · Dubai Hills", meta: "3 BR · 2,240 sqft · Ready", price: "AED 3.6M", img: "/listings/maple-hills.jpg" },
  { name: "Mira Oasis", meta: "3 BR · 2,020 sqft · Ready", price: "AED 2.9M", img: "/listings/mira-oasis.jpg" },
  { name: "Caya · Arabian Ranches III", meta: "4 BR · 2,960 sqft · Ready", price: "AED 4.4M", img: "/listings/villa-caya.jpg" },
  { name: "Club Villas · Dubai Hills", meta: "4 BR · 3,100 sqft · Ready", price: "AED 4.9M", img: "/listings/villa-club.jpg" },
  { name: "Mira 3", meta: "3 BR · 2,180 sqft · Ready", price: "AED 3.1M", img: "/listings/villa-mira.jpg" },
];

// ── Emaar South: what the live Scout returned ──────────────────────────────

const EMAAR = "Emaar Properties · 10% down";
/** The project name is prepended as a stated phrase, so the sentence starts at the verb. */
const building = (when: string, rest: string) =>
  ` is under construction by Emaar Properties in Emaar South, completing ${when}. ${rest}`;

/** Still under construction and still open for sale: the five Scout keeps by default. */
export const EMAAR_OPEN: Listing[] = [
  {
    name: "Golf Trails · Emaar South", meta: "1–3 BR · Q4 2030", price: "From AED 1.06M", img: "/listings/golf-views.jpg",
    status: "Under construction", terms: EMAAR,
    detail: building("Q4 2030", "It has 1 to 3 bedroom homes with 10% down, and the launch price starts at AED 1,060,000"),
  },
  {
    name: "Golf Vale · Emaar South", meta: "1–3 BR · 672–2,796 sqft · Q2 2030", price: "From AED 1.10M", img: "/listings/greenway.jpg",
    status: "Under construction", terms: EMAAR,
    detail: building("Q2 2030", "Homes run from 672 to 2,796 sqft across 1 to 3 bedrooms with 10% down, and the launch price starts at AED 1,099,888"),
  },
  {
    name: "Vista Ridge · Emaar South", meta: "1–3 BR · 788–1,752 sqft · Q3 2029", price: "From AED 1.30M", img: "/listings/golf-lane.jpg",
    status: "Under construction", terms: EMAAR,
    detail: building("Q3 2029, the earliest of the five", "Homes run from 788 to 1,752 sqft across 1 to 3 bedrooms with 10% down, and the launch price starts at AED 1,297,888"),
  },
  {
    name: "Golf Hills · Emaar South", meta: "1–3 BR · 671–3,081 sqft · Q3 2029", price: "From AED 1.06M", img: "/listings/golf-hills.jpg",
    status: "Under construction", terms: EMAAR,
    detail: building("Q3 2029", "Homes run from 671 to 3,081 sqft, the widest range of the five, across 1 to 3 bedrooms with 10% down. The launch price starts at AED 1,060,000"),
  },
  {
    name: "Golf Fields · Emaar South", meta: "1–3 BR · Q1 2030", price: "From AED 1.26M", img: "/listings/golf-fields.jpg",
    status: "Under construction", terms: EMAAR,
    detail: building("Q1 2030", "It has 1 to 3 bedroom homes with 10% down, and the launch price starts at AED 1,260,000"),
  },
];

/** Left out because Scout read "new launches" as not yet built. */
export const EMAAR_READY: Listing[] = [
  { name: "Expo Golf Villas · Emaar South", meta: "3–4 BR · 2,052–2,401 sqft · Q4 2025", price: "From AED 1.47M", img: "/listings/expo-golf-villas.jpg", status: "Ready", terms: EMAAR },
  { name: "Greenviews 2 · Emaar South", meta: "3–4 BR · 1,882–2,264 sqft · Q1 2024", price: "From AED 1.40M", img: "/listings/greenviews.jpg", status: "Ready", terms: "Emaar Properties · 1 payment plan" },
];

/** Left out because they are sold out. */
export const EMAAR_SOLD: Listing[] = [
  { name: "Golf Acres · Emaar South", meta: "1–3 BR · 738–2,564 sqft · Q4 2028", price: "From AED 0.95M", img: "/listings/golf-acres.jpg", status: "Sold out", terms: EMAAR },
  { name: "Golf Edge · Emaar South", meta: "1–3 BR · 795–2,987 sqft · Q1 2029", price: "From AED 1.17M", img: "/listings/golf-edge.jpg", status: "Sold out", terms: EMAAR },
  { name: "Grove Ridge · Emaar South", meta: "1–3 BR · 789 sqft · Q3 2029", price: "From AED 1.28M", img: "/listings/grove-ridge.jpg", status: "Sold out", terms: EMAAR },
];
