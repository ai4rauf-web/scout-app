/**
 * Scripted answers. The prototype streams these as if they came from the model,
 * because provenance needs structure: every phrase knows whether the user
 * stated it or Scout inferred it, and from which words.
 */

export type Seg =
  | { t: string }
  | { t: string; kind: "stated" }
  | { t: string; kind: "inferred"; from: string; why: string; without: number }
  | { t: string; kind: "cite" };

export type Listing = { name: string; meta: string; price: string; art: number };
export type Refine = { label: string; delta: number };

export type Script = {
  id: string;
  count: number;
  noun: string;
  segs: Seg[];
  listings: Listing[];
  refine: Refine[];
  thinking: string[];
};

const cite = (n: number): Seg => ({ t: String(n), kind: "cite" });

const LAUNCH: Script = {
  id: "launch",
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
    { name: "Golf Views · Emaar South", meta: "2 BR · 1,474 sqft · 2027", price: "AED 1.7M", art: 0 },
    { name: "Greenway · Emaar South", meta: "2 BR · 1,210 sqft · 2027", price: "AED 1.4M", art: 2 },
    { name: "Golf Lane · Emaar South", meta: "3 BR · 1,620 sqft · 2027", price: "AED 1.9M", art: 1 },
  ],
  refine: [
    { label: "Widen budget to 2.2M", delta: 9 },
    { label: "Handover by 2026 only", delta: -8 },
    { label: "Compare payment plans", delta: 0 },
  ],
};

const READY: Script = {
  id: "ready",
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
    { name: "The Zen Tower", meta: "2 BR · 1,474 sqft · Ready", price: "AED 1.7M", art: 1 },
    { name: "Marina Crown", meta: "2 BR · 1,494 sqft · Ready", price: "AED 1.9M", art: 0 },
    { name: "Marina Diamond 2", meta: "2 BR · 1,355 sqft · Ready", price: "AED 1.6M", art: 2 },
  ],
  refine: [
    { label: "Widen budget to 2.2M", delta: 38 },
    { label: "Add sea view", delta: -112 },
    { label: "Avoid ground & podium floors", delta: -27 },
  ],
};

const VILLA: Script = {
  id: "villa",
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
    { name: "Joy · Arabian Ranches III", meta: "3 BR · 2,100 sqft · Ready", price: "AED 3.2M", art: 2 },
    { name: "Maple · Dubai Hills", meta: "3 BR · 2,240 sqft · Ready", price: "AED 3.6M", art: 0 },
    { name: "Mira Oasis", meta: "3 BR · 2,020 sqft · Ready", price: "AED 2.9M", art: 1 },
  ],
  refine: [
    { label: "Only gated communities", delta: -22 },
    { label: "Closer to Downtown", delta: -41 },
    { label: "Show 4-bedroom only", delta: -37 },
  ],
};

export const SCRIPTS: Record<string, Script> = { launch: LAUNCH, ready: READY, villa: VILLA };

export function pickScript(q: string): Script {
  const s = q.toLowerCase();
  if (/villa|family|communit|school|فيلا/.test(s)) return VILLA;
  if (/ready|apartment|marina|jbr|furnish|شقة|公寓/.test(s)) return READY;
  return LAUNCH;
}

/** A refinement re-answers in place: same script, new count, reshuffled shortlist. */
export function refineScript(base: Script, r: Refine): Script {
  const next = Math.max(3, base.count + r.delta);
  const moved = r.delta === 0
    ? `Same ${base.count} ${base.noun}, now sorted by the lightest payment plan`
    : `That takes you from ${base.count} to ${next} ${base.noun}`;
  return {
    ...base,
    count: next,
    thinking: ["Applying your change", `Re-ranking ${next} ${base.noun}`],
    segs: [
      { t: "Done — " },
      { t: r.label.charAt(0).toLowerCase() + r.label.slice(1), kind: "stated" },
      { t: `. ${moved}. Top of the list now ` },
      cite(1), cite(2), cite(3),
      { t: "." },
    ],
    listings: [base.listings[1], base.listings[2], base.listings[0]],
    refine: base.refine.filter((x) => x.label !== r.label),
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

export function detectLang(text: string): string {
  if (/[؀-ۿ]/.test(text)) return "AR";
  if (/[一-鿿]/.test(text)) return "中文";
  if (/[ऀ-ॿ]/.test(text)) return "हि";
  return "EN";
}
