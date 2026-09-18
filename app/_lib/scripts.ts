/**
 * Scripted answers. The prototype streams these as if they came from the model,
 * because provenance needs structure: every phrase knows whether the user
 * stated it or Scout inferred it, and from which words.
 */

import { STR, langOf, type Lang } from "./i18n";

export type Seg =
  | { t: string }
  | { t: string; kind: "stated" }
  | { t: string; kind: "inferred"; from: string; why: string; without: number }
  | { t: string; kind: "cite" };

export type Inferred = Extract<Seg, { kind: "inferred" }>;
export const isInferred = (s: Seg | null | undefined): s is Inferred =>
  !!s && "kind" in s && s.kind === "inferred";

export type Listing = {
  /** Canonical Latin name — what is on the building, the contract and the map. Never translated away. */
  name: string;
  /** The name in the reply language, shown first; the Latin name stays beneath it. */
  local?: string;
  meta: string;
  price: string;
  img: string;
};
export type Refine = { label: string; delta: number };

export type Script = {
  id: string;
  /** Language Scout replies in. Interface strings and direction follow it. */
  lang: Lang;
  /** The same answer in the thread's starting language, for "Reply in English instead". */
  alt?: Script;
  count: number;
  noun: string;
  /** Arabic counts 3-10 take the plural (٤ شقق); 11 and up take the singular (٢٣ شقة). */
  nounFew?: string;
  segs: Seg[];
  listings: Listing[];
  refine: Refine[];
  thinking: string[];
};

/** The right noun form for a count. Only Arabic changes form here. */
export function nounFor(s: Pick<Script, "lang" | "noun" | "nounFew">, n: number): string {
  if (s.lang !== "ar" || !s.nounFew) return s.noun;
  const m = n % 100;
  return m >= 3 && m <= 10 ? s.nounFew : s.noun;
}

const cite = (n: number): Seg => ({ t: String(n), kind: "cite" });

const LAUNCH: Script = {
  id: "launch",
  lang: "en",
  count: 12,
  noun: "launches",
  thinking: ["Reading your question", "Searching Property Finder", "Comparing 12 launches"],
  segs: [
    { t: "I found 12 off-plan launches by " },
    { t: "Emaar", kind: "stated" },
    { t: " in " },
    { t: "Dubai South", kind: "stated" },
    { t: ", all " },
    { t: "under 2M", kind: "stated" },
    { t: ". Most come with a " },
    {
      t: "20% down payment", kind: "inferred", from: "new … launches",
      why: "Scout read “launches” as off-plan with a 20% payment plan. You didn’t say 20%.",
      without: 31,
    },
    { t: " and a " },
    {
      t: "2027 handover", kind: "inferred", from: "new … launches",
      why: "New launches usually hand over in two to three years, so Scout kept 2027. You didn’t give a date.",
      without: 19,
    },
    { t: ". Three worth a look " },
    cite(1), cite(2), cite(3),
    { t: "." },
  ],
  listings: [
    { name: "Golf Views · Emaar South", meta: "2 BR · 1,474 sqft · 2027", price: "AED 1.7M", img: "/listings/golf-views.jpg" },
    { name: "Greenway · Emaar South", meta: "2 BR · 1,210 sqft · 2027", price: "AED 1.4M", img: "/listings/greenway.jpg" },
    { name: "Golf Lane · Emaar South", meta: "3 BR · 1,620 sqft · 2027", price: "AED 1.9M", img: "/listings/golf-lane.jpg" },
  ],
  refine: [
    { label: "Widen budget to 2.2M", delta: 9 },
    { label: "Handover by 2026 only", delta: -8 },
    { label: "Compare payment plans", delta: 0 },
  ],
};

const READY: Script = {
  id: "ready",
  lang: "en",
  count: 176,
  noun: "apartments",
  thinking: ["Reading your question", "Searching Property Finder", "Ranking 176 apartments"],
  segs: [
    { t: "I found 176 apartments " },
    { t: "under 2M", kind: "stated" },
    { t: " that are " },
    { t: "ready this year", kind: "stated" },
    { t: ". I looked in " },
    {
      t: "Dubai Marina and JBR", kind: "inferred", from: "your last search",
      why: "You didn’t name an area, so Scout started where you searched last time.",
      without: 640,
    },
    { t: " and leaned towards " },
    {
      t: "furnished", kind: "inferred", from: "ready this year",
      why: "Scout stretched “ready” to mean furnished and move-in ready. The furnishing part wasn’t in your words.",
      without: 214,
    },
    { t: " homes. Three to start with " },
    cite(1), cite(2), cite(3),
    { t: "." },
  ],
  listings: [
    { name: "The Zen Tower", meta: "2 BR · 1,474 sqft · Ready", price: "AED 1.7M", img: "/listings/zen-tower.jpg" },
    { name: "Marina Crown", meta: "2 BR · 1,494 sqft · Ready", price: "AED 1.9M", img: "/listings/marina-crown.jpg" },
    { name: "Marina Diamond 2", meta: "2 BR · 1,355 sqft · Ready", price: "AED 1.6M", img: "/listings/marina-diamond.jpg" },
  ],
  refine: [
    { label: "Widen budget to 2.2M", delta: 38 },
    { label: "Add sea view", delta: -112 },
    { label: "Avoid ground & podium floors", delta: -27 },
  ],
};

const VILLA: Script = {
  id: "villa",
  lang: "en",
  count: 84,
  noun: "villas",
  thinking: ["Reading your question", "Searching Property Finder", "Weighing 9 communities"],
  segs: [
    { t: "For a " },
    { t: "family villa", kind: "stated" },
    { t: ", three communities stand out: Arabian Ranches III, Dubai Hills and Mira. I assumed " },
    {
      t: "3–4 bedrooms", kind: "inferred", from: "family",
      why: "Scout read “family” as three to four bedrooms. You didn’t give a number.",
      without: 131,
    },
    { t: " and " },
    {
      t: "a school within 10 minutes", kind: "inferred", from: "family",
      why: "Scout added school distance because you said “family”. It wasn’t in your words.",
      without: 109,
    },
    { t: ". 84 villas fit " },
    cite(1), cite(2), cite(3),
    { t: "." },
  ],
  listings: [
    { name: "Joy · Arabian Ranches III", meta: "3 BR · 2,100 sqft · Ready", price: "AED 3.2M", img: "/listings/joy-ranches.jpg" },
    { name: "Maple · Dubai Hills", meta: "3 BR · 2,240 sqft · Ready", price: "AED 3.6M", img: "/listings/maple-hills.jpg" },
    { name: "Mira Oasis", meta: "3 BR · 2,020 sqft · Ready", price: "AED 2.9M", img: "/listings/mira-oasis.jpg" },
  ],
  refine: [
    { label: "Only gated communities", delta: -22 },
    { label: "Closer to Downtown", delta: -41 },
    { label: "Show 4-bedroom only", delta: -37 },
  ],
};

// ── A thread that changes language ─────────────────────────────────────────
// What the user said earlier stays "stated" in every later language, and the
// provenance card quotes their words in the script they were written in.

const SEA_LISTINGS_EN: Listing[] = [
  { name: "The Zen Tower", meta: "2 BR · 1,474 sqft · Ready", price: "AED 1.7M", img: "/listings/zen-tower.jpg" },
  { name: "Marina Crown", meta: "2 BR · 1,494 sqft · Ready", price: "AED 1.9M", img: "/listings/marina-crown.jpg" },
  { name: "Marina Diamond 2", meta: "2 BR · 1,355 sqft · Ready", price: "AED 1.6M", img: "/listings/marina-diamond.jpg" },
];

const SEA_EN: Script = {
  id: "sea-en", lang: "en", count: 64, noun: "apartments",
  thinking: ["Reading your question", "Searching Property Finder", "Filtering 64 apartments"],
  segs: [
    { t: "Done — added " }, { t: "sea view", kind: "stated" },
    { t: ". There are 64 sea-view apartments in " }, { t: "Dubai Marina", kind: "stated" },
    { t: ", " }, { t: "under 2M", kind: "stated" }, { t: " and " }, { t: "ready this year", kind: "stated" },
    { t: ". I favoured " },
    { t: "high floors", kind: "inferred", from: "海景", why: "Scout took “海景” (sea view) to mean high floors. You didn’t mention floors.", without: 97 },
    { t: ". Three to start with " }, cite(1), cite(2), cite(3), { t: "." },
  ],
  listings: SEA_LISTINGS_EN,
  refine: [{ label: "Widen budget to 2.2M", delta: 21 }, { label: "Furnished only", delta: -30 }, { label: "Avoid low floors", delta: -12 }],
};

const SEA_ZH: Script = {
  id: "sea-zh", lang: "zh", count: 64, noun: "公寓",
  thinking: ["正在理解你的问题", "正在搜索 Property Finder", "正在筛选 64 套公寓"],
  segs: [
    { t: "好的，已加上" }, { t: "海景", kind: "stated" },
    { t: "。在" }, { t: "迪拜码头", kind: "stated" },
    { t: "，" }, { t: "200万以下", kind: "stated" }, { t: "、" }, { t: "今年可入住", kind: "stated" },
    { t: "的海景公寓共有 64 套。我优先选了" },
    { t: "高楼层", kind: "inferred", from: "海景", why: "Scout 认为“海景”意味着高楼层。你并没有提到楼层。", without: 97 },
    { t: "的房源。先看这三套 " }, cite(1), cite(2), cite(3), { t: "。" },
  ],
  listings: [
    { name: "The Zen Tower", local: "禅意大厦", meta: "2 室 · 1,474 平方英尺 · 现房", price: "170 万迪拉姆", img: "/listings/zen-tower.jpg" },
    { name: "Marina Crown", local: "码头皇冠大厦", meta: "2 室 · 1,494 平方英尺 · 现房", price: "190 万迪拉姆", img: "/listings/marina-crown.jpg" },
    { name: "Marina Diamond 2", local: "码头钻石 2 号", meta: "2 室 · 1,355 平方英尺 · 现房", price: "160 万迪拉姆", img: "/listings/marina-diamond.jpg" },
  ],
  refine: [{ label: "预算放宽到 220 万", delta: 21 }, { label: "只看带家具的", delta: -30 }, { label: "避开低楼层", delta: -12 }],
};
SEA_ZH.alt = SEA_EN;
SEA_EN.alt = SEA_ZH;

const THREE_EN: Script = {
  id: "three-en", lang: "en", count: 23, noun: "apartments",
  thinking: ["Reading your question", "Searching Property Finder", "Ranking 23 apartments"],
  segs: [
    { t: "I found 23 " }, { t: "three-bedroom", kind: "stated" },
    { t: " apartments in " }, { t: "Dubai Marina", kind: "stated" },
    { t: " with a " }, { t: "sea view", kind: "stated" }, { t: ", " }, { t: "ready this year", kind: "stated" },
    { t: ". " },
    { t: "I raised the budget to 2.8M", kind: "inferred", from: "ثلاث غرف", why: "Earlier you said “under 2M”. Scout raised the budget on its own to find three-bedrooms. You didn’t ask for that.", without: 4 },
    { t: ", because three-bedrooms are rare under 2M. Three of them " }, cite(1), cite(2), cite(3), { t: "." },
  ],
  listings: [
    { name: "Marina Gate 1", meta: "3 BR · 1,890 sqft · Ready", price: "AED 2.7M", img: "/listings/marina-crown.jpg" },
    { name: "Damac Heights", meta: "3 BR · 1,760 sqft · Ready", price: "AED 2.6M", img: "/listings/zen-tower.jpg" },
    { name: "Marina Promenade", meta: "3 BR · 1,820 sqft · Ready", price: "AED 2.8M", img: "/listings/marina-diamond.jpg" },
  ],
  refine: [{ label: "Go back to under 2M", delta: -19 }, { label: "Two parking spaces", delta: -9 }, { label: "High floor only", delta: -11 }],
};

const THREE_AR: Script = {
  id: "three-ar", lang: "ar", count: 23, noun: "شقة", nounFew: "شقق",
  thinking: ["أقرأ سؤالك", "أبحث في بروبرتي فايندر", "أرتّب 23 شقة"],
  segs: [
    { t: "وجدت 23 شقة مكوّنة من " }, { t: "ثلاث غرف", kind: "stated" },
    { t: " في " }, { t: "دبي مارينا", kind: "stated" },
    { t: " مع " }, { t: "إطلالة بحرية", kind: "stated" }, { t: "، و" }, { t: "جاهزة هذا العام", kind: "stated" },
    { t: ". " },
    { t: "رفعتُ الميزانية إلى 2.8 مليون", kind: "inferred", from: "ثلاث غرف", why: "قلتَ سابقاً «under 2M». رفع سكاوت الميزانية من تلقاء نفسه ليجد شققاً بثلاث غرف. أنت لم تطلب ذلك.", without: 4 },
    { t: " لأن الشقق ذات الثلاث غرف نادرة بأقل من 2 مليون. إليك ثلاثاً منها " }, cite(1), cite(2), cite(3), { t: "." },
  ],
  listings: [
    { name: "Marina Gate 1", local: "مارينا جيت 1", meta: "3 غرف · 1,890 قدم² · جاهزة", price: "2.7 مليون درهم", img: "/listings/marina-crown.jpg" },
    { name: "Damac Heights", local: "داماك هايتس", meta: "3 غرف · 1,760 قدم² · جاهزة", price: "2.6 مليون درهم", img: "/listings/zen-tower.jpg" },
    { name: "Marina Promenade", local: "مارينا بروميناد", meta: "3 غرف · 1,820 قدم² · جاهزة", price: "2.8 مليون درهم", img: "/listings/marina-diamond.jpg" },
  ],
  refine: [{ label: "العودة إلى أقل من 2 مليون", delta: -19 }, { label: "موقفان للسيارات", delta: -9 }, { label: "طابق مرتفع فقط", delta: -11 }],
};
THREE_AR.alt = THREE_EN;
THREE_EN.alt = THREE_AR;

/** The three questions of the demo thread, in the order a person might ask them. */
export const MULTI_THREAD = [
  "Apartments in Dubai Marina under 2M, ready this year",
  "要有海景的",
  "وماذا عن شقق بثلاث غرف؟",
];

export const SCRIPTS: Record<string, Script> = { launch: LAUNCH, ready: READY, villa: VILLA };

export function pickScript(q: string): Script {
  const lang = langOf(q);
  if (lang === "zh") return SEA_ZH;
  if (lang === "ar") return THREE_AR;
  const s = q.toLowerCase();
  if (/villa|family|communit|school|فيلا/.test(s)) return VILLA;
  if (/ready|apartment|marina|jbr|furnish|شقة|公寓/.test(s)) {
    // If the user named the area, it is stated — never present it as an assumption.
    const area = /marina/.test(s) ? "Dubai Marina" : /jbr/.test(s) ? "JBR" : null;
    if (!area) return READY;
    return {
      ...READY,
      segs: READY.segs.map((seg) =>
        "kind" in seg && seg.kind === "inferred" && seg.t === "Dubai Marina and JBR"
          ? { t: area, kind: "stated" as const }
          : seg,
      ),
    };
  }
  return LAUNCH;
}

const DONE: Record<Lang, string> = { en: "Done — ", zh: "好的——", ar: "تم — " };
const STOPPED: Record<Lang, string> = { en: "Done. I’ve stopped assuming ", zh: "好的，我不再假设", ar: "تم. لن أفترض " };
const lowerFirst = (t: string, lang: Lang) => (lang === "en" ? t.charAt(0).toLowerCase() + t.slice(1) : t);

/** A refinement re-answers in place, in the language of the turn it refines. */
export function refineScript(base: Script, r: Refine): Script {
  const L = STR[base.lang];
  const next = Math.max(3, base.count + r.delta);
  const tail = r.delta === 0
    ? L.resorted(r.label, base.count, nounFor(base, base.count))
    : L.refined(r.label, base.count, next, nounFor(base, next));
  return {
    ...base,
    alt: undefined,
    count: next,
    thinking: L.thinkingRefine(next, nounFor(base, next)),
    segs: [
      { t: DONE[base.lang] },
      { t: lowerFirst(r.label, base.lang), kind: "stated" },
      { t: tail },
      cite(1), cite(2), cite(3),
      { t: base.lang === "zh" ? "。" : "." },
    ],
    listings: [base.listings[1], base.listings[2], base.listings[0]],
    refine: base.refine.filter((x) => x.label !== r.label),
  };
}

/** Unsay drops one assumption and re-answers without it. */
export function unsayScript(base: Script, segIndex: number): { q: string; script: Script } | null {
  const seg = base.segs[segIndex];
  if (!isInferred(seg)) return null;
  const L = STR[base.lang];
  const diff = seg.without - base.count;
  const change = diff === 0 ? L.same : `${diff > 0 ? "+" : "−"}${Math.abs(diff)}`;
  return {
    q: L.dropTitle(seg.t),
    script: {
      ...base,
      alt: undefined,
      count: seg.without,
      thinking: L.thinkingUnsay(seg.without, nounFor(base, seg.without)),
      segs: [
        { t: STOPPED[base.lang] },
        { t: L.quote(seg.t) },
        { t: L.unsaid(seg.t, seg.without, nounFor(base, seg.without), change) },
        cite(1), cite(2), cite(3),
        { t: base.lang === "zh" ? "。" : "." },
      ],
      listings: [base.listings[2], base.listings[0], base.listings[1]],
    },
  };
}

export const SUGGESTIONS = [
  "New Emaar launches in Dubai South under 2M",
  "Apartments under 2M, ready this year",
  "Best communities for a family villa",
  "New off-plan launches with 20% down",
  "Compare Marina vs JBR for a 2BR",
  "Rental yield in Business Bay",
];

/** Offered in the follow-up sheet, so the language switch is one tap away in a demo. */
export const FOLLOW_UPS = ["要有海景的", "وماذا عن شقق بثلاث غرف؟", "Compare Marina vs JBR for a 2BR"];

export function detectLang(text: string): string {
  if (/[؀-ۿ]/.test(text)) return "AR";
  if (/[一-鿿]/.test(text)) return "中文";
  if (/[ऀ-ॿ]/.test(text)) return "हि";
  return "EN";
}
