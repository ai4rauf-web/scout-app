/**
 * Interface strings per reply language. Listing names and AED prices are never
 * translated — they are identifiers; everything around them is.
 */
export type Lang = "en" | "zh" | "ar";

export const isRtl = (l: Lang) => l === "ar";
export const chipLabel: Record<Lang, string> = { en: "EN", zh: "中文", ar: "AR" };
export const langName: Record<Lang, string> = { en: "English", zh: "中文", ar: "العربية" };

export function langOf(text: string): Lang {
  if (/[؀-ۿ]/.test(text)) return "ar";
  if (/[一-鿿]/.test(text)) return "zh";
  return "en";
}

type Strings = {
  listings: string; map: string; sources: string;
  youSaid: string; assumed: string;
  compare: string; listen: string; copy: string;
  refine: string; followUp: string;
  provFrom: string; keep: string; without: string;
  quote: (s: string) => string;
  unsay: (s: string) => string;
  dropTitle: (s: string) => string;
  refined: (label: string, from: number, to: number, noun: string) => string;
  resorted: (label: string, n: number, noun: string) => string;
  unsaid: (t: string, n: number, noun: string, change: string) => string;
  same: string;
  thinkingRefine: (n: number, noun: string) => string[];
  thinkingUnsay: (n: number, noun: string) => string[];
  switched: string;
};

export const STR: Record<Lang, Strings> = {
  en: {
    listings: "Listings", map: "Map", sources: "Sources",
    youSaid: "you said", assumed: "Scout assumed · hold to check",
    compare: "Compare", listen: "Listen", copy: "Copy",
    refine: "Refine", followUp: "Ask a follow-up…",
    provFrom: "Scout assumed this from", keep: "Keep it", without: "Without it:",
    quote: (s) => `“${s}”`,
    unsay: (s) => `Unsay “${s}”`,
    dropTitle: (s) => `Drop “${s}”`,
    refined: (label, from, to, noun) => `. That takes you from ${from} to ${to} ${noun}. Top of the list now `,
    resorted: (label, n, noun) => `. Same ${n} ${noun}, now sorted by the lightest payment plan. Top of the list now `,
    unsaid: (t, n, noun, change) => ` — it wasn’t in your words. That leaves ${n} ${noun} (${change}). Top of the list now `,
    same: "the same number",
    thinkingRefine: (n, noun) => ["Applying your change", `Re-ranking ${n} ${noun}`],
    thinkingUnsay: (n, noun) => ["Removing that assumption", `Re-ranking ${n} ${noun}`],
    switched: "Switched to English",
  },
  zh: {
    listings: "房源", map: "地图", sources: "来源",
    youSaid: "你说的", assumed: "Scout 的推测 · 长按查看",
    compare: "对比", listen: "朗读", copy: "复制",
    refine: "继续筛选", followUp: "继续提问…",
    provFrom: "Scout 的推测来自", keep: "保留", without: "去掉后：",
    quote: (s) => `“${s}”`,
    unsay: (s) => `去掉“${s}”`,
    dropTitle: (s) => `去掉“${s}”`,
    refined: (label, from, to, noun) => `。${noun}从 ${from} 套变为 ${to} 套。目前排在前面的是 `,
    resorted: (label, n, noun) => `。仍是 ${n} 套${noun}，已按付款方式重新排序。目前排在前面的是 `,
    unsaid: (t, n, noun, change) => `——这不是你说的。现在有 ${n} 套${noun}（${change}）。目前排在前面的是 `,
    same: "数量不变",
    thinkingRefine: (n, noun) => ["正在应用你的修改", `正在重新排序 ${n} 套${noun}`],
    thinkingUnsay: (n, noun) => ["正在去掉这个推测", `正在重新排序 ${n} 套${noun}`],
    switched: "已切换到中文",
  },
  ar: {
    listings: "العقارات", map: "الخريطة", sources: "المصادر",
    youSaid: "ما قلتَه", assumed: "ما افترضه سكاوت · اضغط مطولاً للتحقق",
    compare: "قارن", listen: "استمع", copy: "انسخ",
    refine: "حسّن البحث", followUp: "اسأل سؤالاً آخر…",
    provFrom: "افترض سكاوت هذا من", keep: "أبقِه", without: "بدونه:",
    quote: (s) => `«${s}»`,
    unsay: (s) => `إلغاء «${s}»`,
    dropTitle: (s) => `إلغاء «${s}»`,
    refined: (label, from, to, noun) => `. أصبح العدد ${to} ${noun} بدلاً من ${from}. في أعلى القائمة الآن `,
    resorted: (label, n, noun) => `. العدد نفسه: ${n} ${noun}، مرتّبة حسب خطة الدفع. في أعلى القائمة الآن `,
    unsaid: (t, n, noun, change) => ` — لم تقل ذلك. يتبقى ${n} ${noun} (${change}). في أعلى القائمة الآن `,
    same: "العدد نفسه",
    thinkingRefine: (n, noun) => ["أطبّق تعديلك", `أعيد ترتيب ${n} ${noun}`],
    thinkingUnsay: (n, noun) => ["أزيل هذا الافتراض", `أعيد ترتيب ${n} ${noun}`],
    switched: "تم التبديل إلى العربية",
  },
};
