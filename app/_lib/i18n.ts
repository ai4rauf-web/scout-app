/**
 * Interface strings per reply language. Listing names and AED prices are never
 * translated — they are identifiers; everything around them is.
 */
export type Lang = "en" | "zh" | "ar" | "ja" | "ru" | "hi";

export const isRtl = (l: Lang) => l === "ar";
/** Two-letter codes, all in one script, so the chip keeps its width and reads at a glance. */
export const chipLabel: Record<Lang, string> = { en: "EN", zh: "CN", ar: "AR", ja: "JA", ru: "RU", hi: "HI" };
export const langName: Record<Lang, string> = { en: "English", zh: "中文", ar: "العربية", ja: "日本語", ru: "Русский", hi: "हिन्दी" };

export function langOf(text: string): Lang {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  // Kana first: Japanese shares its kanji with Chinese, so kana is what tells them apart
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
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
  stop: string; copied: string; speech: string;
  ranked: (n: number, total: number) => string;
  seeAll: (total: number) => string;
  allNote: (n: number, total: number) => string;
  close: string;
  whatsapp: string; digDeeper: string; market: string; disclaimer: string; scoutAsks: string;
  digTitle: (name: string) => string;
  digBody: (meta: string, price: string) => string;
  waToast: (name: string) => string;
  thinkingDig: (name: string) => string[];
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
    stop: "Stop", copied: "Copied", speech: "en-US",
    ranked: (n, total) => (n < total ? `Top ${n} of ${total} · best match first` : `All ${total} · best match first`),
    seeAll: (total) => `See all ${total}`,
    allNote: (n, total) => `Showing the top ${n} of ${total}. Refine, or ask Scout, to narrow it down.`,
    close: "Close",
    whatsapp: "WhatsApp", digDeeper: "Dig deeper", market: "Market data & analysis",
    disclaimer: "Scout is AI and can make mistakes.", scoutAsks: "Scout asks",
    digTitle: (name) => `Tell me more about ${name}`,
    digBody: (meta, price) => ` — ${meta}. ${price}. Ask me about payment plans, unit mix or the area `,
    waToast: (name) => `Opening WhatsApp with the agent for ${name}…`,
    thinkingDig: (name) => ["Opening the project", `Reading ${name}`],
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
    stop: "停止", copied: "已复制", speech: "zh-CN",
    ranked: (n, total) => (n < total ? `${total} 套中的前 ${n} 套 · 按匹配度排序` : `全部 ${total} 套 · 按匹配度排序`),
    seeAll: (total) => `查看全部 ${total} 套`,
    allNote: (n, total) => `正在显示 ${total} 套中的前 ${n} 套。可继续筛选，或直接问 Scout。`,
    close: "关闭",
    whatsapp: "WhatsApp", digDeeper: "深入了解", market: "市场数据与分析",
    disclaimer: "Scout 是 AI，可能会出错。", scoutAsks: "Scout 想问",
    digTitle: (name) => `详细介绍一下 ${name}`,
    digBody: (meta, price) => `——${meta}，${price}。你可以继续问我付款计划、户型或周边 `,
    waToast: (name) => `正在打开 WhatsApp，联系 ${name} 的经纪人…`,
    thinkingDig: (name) => ["正在打开项目", `正在查看 ${name}`],
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
    stop: "إيقاف", copied: "تم النسخ", speech: "ar-SA",
    ranked: (n, total) => (n < total ? `أفضل ${n} من ${total} · الأنسب أولاً` : `الكل: ${total} · الأنسب أولاً`),
    seeAll: (total) => `عرض الكل (${total})`,
    allNote: (n, total) => `تُعرض أفضل ${n} من أصل ${total}. حسّن البحث أو اسأل سكاوت لتضييق النتائج.`,
    close: "إغلاق",
    whatsapp: "واتساب", digDeeper: "تفاصيل أكثر", market: "بيانات السوق والتحليل",
    disclaimer: "سكاوت ذكاء اصطناعي وقد يخطئ.", scoutAsks: "سكاوت يسأل",
    digTitle: (name) => `أخبرني المزيد عن ${name}`,
    digBody: (meta, price) => ` — ${meta}. ${price}. اسألني عن خطط الدفع أو أنواع الوحدات أو المنطقة `,
    waToast: (name) => `جارٍ فتح واتساب للتواصل مع وكيل ${name}…`,
    thinkingDig: (name) => ["أفتح المشروع", `أقرأ ${name}`],
  },
  ja: {
    listings: "物件", map: "地図", sources: "情報源",
    youSaid: "あなたの言葉", assumed: "Scout の推測 · 長押しで確認",
    compare: "比較", listen: "読み上げ", copy: "コピー",
    refine: "絞り込む", followUp: "続けて質問する…",
    provFrom: "Scout がこう推測した理由", keep: "そのままにする", without: "外した場合：",
    quote: (s) => `「${s}」`,
    unsay: (s) => `「${s}」を取り消す`,
    dropTitle: (s) => `「${s}」を取り消す`,
    refined: (label, from, to, noun) => `。${noun}は${from}件から${to}件になりました。いま上位にあるのは `,
    resorted: (label, n, noun) => `。同じ${n}件の${noun}を、支払いプランの軽い順に並べ替えました。いま上位にあるのは `,
    unsaid: (t, n, noun, change) => `——これはあなたの言葉ではありませんでした。${noun}は${n}件になります（${change}）。いま上位にあるのは `,
    same: "件数は同じ",
    thinkingRefine: (n, noun) => ["変更を反映しています", `${n}件の${noun}を並べ替えています`],
    thinkingUnsay: (n, noun) => ["その推測を外しています", `${n}件の${noun}を並べ替えています`],
    switched: "日本語に切り替えました",
    stop: "停止", copied: "コピーしました", speech: "ja-JP",
    ranked: (n, total) => (n < total ? `${total}件中の上位${n}件 · おすすめ順` : `全${total}件 · おすすめ順`),
    seeAll: (total) => `全${total}件を見る`,
    allNote: (n, total) => `${total}件中、上位${n}件を表示しています。絞り込むか、Scout に聞いてください。`,
    close: "閉じる",
    whatsapp: "WhatsApp", digDeeper: "詳しく見る", market: "市場データと分析",
    disclaimer: "Scout は AI のため、間違えることがあります。", scoutAsks: "Scout からの質問",
    digTitle: (name) => `${name}について詳しく教えて`,
    digBody: (meta, price) => `——${meta}、${price}。支払いプラン、間取り、周辺エリアについて続けて聞いてください `,
    waToast: (name) => `WhatsApp を開いて${name}の担当者に連絡します…`,
    thinkingDig: (name) => ["物件を開いています", `${name}を確認しています`],
  },
  ru: {
    listings: "Объекты", map: "Карта", sources: "Источники",
    youSaid: "вы сказали", assumed: "Scout предположил · удерживайте, чтобы проверить",
    compare: "Сравнить", listen: "Слушать", copy: "Копировать",
    refine: "Уточнить", followUp: "Задайте ещё вопрос…",
    provFrom: "Scout предположил это из слов", keep: "Оставить", without: "Без этого:",
    quote: (s) => `«${s}»`,
    unsay: (s) => `Убрать «${s}»`,
    dropTitle: (s) => `Убрать «${s}»`,
    refined: (label, from, to, noun) => `. Было ${from}, стало ${to} ${noun}. Сейчас в начале списка `,
    resorted: (label, n, noun) => `. Те же ${n} ${noun}, теперь отсортированы по самой лёгкой рассрочке. Сейчас в начале списка `,
    unsaid: (t, n, noun, change) => ` — вы этого не говорили. Осталось ${n} ${noun} (${change}). Сейчас в начале списка `,
    same: "столько же",
    thinkingRefine: (n, noun) => ["Применяю ваше изменение", `Пересортировываю: ${n} ${noun}`],
    thinkingUnsay: (n, noun) => ["Убираю это предположение", `Пересортировываю: ${n} ${noun}`],
    switched: "Переключено на русский",
    stop: "Стоп", copied: "Скопировано", speech: "ru-RU",
    ranked: (n, total) => (n < total ? `Топ-${n} из ${total} · сначала лучшие` : `Все ${total} · сначала лучшие`),
    seeAll: (total) => `Показать все ${total}`,
    allNote: (n, total) => `Показаны первые ${n} из ${total}. Уточните запрос или спросите Scout, чтобы сузить список.`,
    close: "Закрыть",
    whatsapp: "WhatsApp", digDeeper: "Подробнее", market: "Данные рынка и анализ",
    disclaimer: "Scout — это ИИ, и он может ошибаться.", scoutAsks: "Scout спрашивает",
    digTitle: (name) => `Расскажи подробнее про ${name}`,
    digBody: (meta, price) => ` — ${meta}. ${price}. Спросите меня о рассрочке, планировках или районе `,
    waToast: (name) => `Открываю WhatsApp для связи с агентом по ${name}…`,
    thinkingDig: (name) => ["Открываю объект", `Изучаю ${name}`],
  },
  hi: {
    listings: "प्रॉपर्टी", map: "नक्शा", sources: "स्रोत",
    youSaid: "आपने कहा", assumed: "Scout ने माना · जाँचने के लिए दबाए रखें",
    compare: "तुलना", listen: "सुनें", copy: "कॉपी",
    refine: "और छाँटें", followUp: "एक और सवाल पूछें…",
    provFrom: "Scout ने यह इन शब्दों से माना", keep: "रहने दें", without: "इसके बिना:",
    quote: (s) => `“${s}”`,
    unsay: (s) => `“${s}” हटाएँ`,
    dropTitle: (s) => `“${s}” हटाएँ`,
    refined: (label, from, to, noun) => `। अब ${from} की जगह ${to} ${noun} हैं। सूची में सबसे ऊपर `,
    resorted: (label, n, noun) => `। वही ${n} ${noun}, अब सबसे आसान पेमेंट प्लान के क्रम में। सूची में सबसे ऊपर `,
    unsaid: (t, n, noun, change) => ` — यह आपने नहीं कहा था। अब ${n} ${noun} बचते हैं (${change})। सूची में सबसे ऊपर `,
    same: "संख्या वही",
    thinkingRefine: (n, noun) => ["आपका बदलाव लागू कर रहा हूँ", `${n} ${noun} दोबारा क्रम में लगा रहा हूँ`],
    thinkingUnsay: (n, noun) => ["वह अनुमान हटा रहा हूँ", `${n} ${noun} दोबारा क्रम में लगा रहा हूँ`],
    switched: "हिन्दी में बदल दिया",
    stop: "रोकें", copied: "कॉपी हो गया", speech: "hi-IN",
    ranked: (n, total) => (n < total ? `${total} में से शीर्ष ${n} · सबसे उपयुक्त पहले` : `सभी ${total} · सबसे उपयुक्त पहले`),
    seeAll: (total) => `सभी ${total} देखें`,
    allNote: (n, total) => `${total} में से शीर्ष ${n} दिख रहे हैं। सूची छोटी करने के लिए और छाँटें या Scout से पूछें।`,
    close: "बंद करें",
    whatsapp: "WhatsApp", digDeeper: "और जानें", market: "बाज़ार के आँकड़े और विश्लेषण",
    disclaimer: "Scout एक AI है और गलती कर सकता है।", scoutAsks: "Scout पूछ रहा है",
    digTitle: (name) => `${name} के बारे में और बताइए`,
    digBody: (meta, price) => ` — ${meta}। ${price}। पेमेंट प्लान, यूनिट के प्रकार या इलाके के बारे में पूछिए `,
    waToast: (name) => `${name} के एजेंट से बात करने के लिए WhatsApp खोल रहा हूँ…`,
    thinkingDig: (name) => ["प्रोजेक्ट खोल रहा हूँ", `${name} देख रहा हूँ`],
  },
};
