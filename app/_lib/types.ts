export type Screen =
  | "landing"
  | "history"
  | "text"
  | "voice"
  | "confirm"
  | "answer"
  | "provenance"
  | "multi";

export const SCREENS: { id: Screen; label: string; hint: string }[] = [
  { id: "landing", label: "Landing", hint: "Logged in" },
  { id: "history", label: "History", hint: "From the avatar" },
  { id: "text", label: "Text input", hint: "Sheet rises" },
  { id: "voice", label: "Voice", hint: "Listening" },
  { id: "confirm", label: "Voice", hint: "Confirm & send" },
  { id: "answer", label: "Answer", hint: "With provenance" },
  { id: "provenance", label: "Provenance", hint: "Long-press card" },
  { id: "multi", label: "Three languages", hint: "EN → 中文 → العربية" },
];

export type Go = (s: Screen) => void;
