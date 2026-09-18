/**
 * Choosing Scout's speaking voice. Left alone, a browser takes the first voice
 * for the language, which on a Mac is "Albert": a croaky novelty voice.
 * Scout should sound like a clear, composed man, so the voice is picked by name,
 * best first, and the novelty voices are never used even as a last resort.
 */

import type { Lang } from "./i18n";

/** Clear male voices per language, best first. Matched from the start of the name, so "Daniel (Enhanced)" counts. */
const PREFERRED: Record<Lang, string[]> = {
  en: ["Google UK English Male", "Daniel", "Arthur", "Aaron", "Microsoft Ryan", "Microsoft Guy", "Microsoft George", "Oliver", "Evan", "Nathan", "Reed", "Alex", "Tom", "Gordon", "Eddy", "Rishi"],
  ar: ["Majed", "Maged", "Microsoft Hamed", "Microsoft Naayf", "Microsoft Shakir", "Tarik"],
  zh: ["Microsoft Yunxi", "Microsoft Yunyang", "Microsoft Yunjian", "Microsoft Kangkang", "Reed", "Eddy", "Li-mu", "Han"],
  ja: ["Otoya", "Hattori", "Microsoft Keita", "Microsoft Ichiro", "Reed", "Eddy"],
  ru: ["Yuri", "Microsoft Dmitry", "Microsoft Pavel", "Reed", "Eddy"],
  hi: ["Microsoft Madhur", "Microsoft Hemant", "Reed", "Eddy"],
};

/** Joke and character voices that ship with macOS and iOS. Never Scout. */
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Fred|Good News|Grandma|Grandpa|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Ralph|Rocko|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;

const PREFIX: Record<Lang, string[]> = {
  en: ["en-gb", "en-us", "en"], ar: ["ar"], zh: ["zh-cn", "zh"], ja: ["ja"], ru: ["ru"], hi: ["hi"],
};

const tag = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();

/** Voices arrive late in most browsers, so wait for them once, briefly. */
export async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return now;
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 700);
  });
}

export function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): { voice: SpeechSynthesisVoice | null; male: boolean } {
  const pool = voices.filter((v) => PREFIX[lang].some((p) => tag(v).startsWith(p)) && !NOVELTY.test(v.name));
  // Within a name, the first language prefix wins: British before American for English, mainland before Taiwan for Chinese
  const rank = (v: SpeechSynthesisVoice) => PREFIX[lang].findIndex((p) => tag(v).startsWith(p));
  for (const name of PREFERRED[lang]) {
    const hit = pool.filter((v) => v.name.startsWith(name)).sort((a, b) => rank(a) - rank(b))[0];
    if (hit) return { voice: hit, male: true };
  }
  // No male voice on this device for this language: take the clearest ordinary one rather than a wrong-language man
  const rest = [...pool].sort((a, b) => rank(a) - rank(b));
  return { voice: rest[0] ?? null, male: false };
}

/** A touch brighter and a touch slower than default: easier to follow, and further from a gravelly read. */
export function tune(u: SpeechSynthesisUtterance, male: boolean) {
  u.pitch = male ? 1.12 : 1;
  u.rate = 0.96;
  u.volume = 1;
}
