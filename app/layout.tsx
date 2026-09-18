import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

// Inter carries Latin and Cyrillic. Arabic, Chinese, Japanese and Hindi fall through
// to Noto per glyph, so each script gets a real face instead of a system fallback.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSC = Noto_Sans_SC({
  variable: "--font-sc",
  weight: ["400", "500"],
  preload: false,
  display: "swap",
});

const notoJP = Noto_Sans_JP({
  variable: "--font-jp",
  weight: ["400", "500"],
  preload: false,
  display: "swap",
});

const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scout — conversational property search",
  description:
    "A Property Finder Scout prototype. Talk to Scout, see what it understood, and steer mid-conversation.",
  appleWebApp: { capable: true, title: "Scout", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E14" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoArabic.variable} ${notoSC.variable} ${notoJP.variable} ${notoDeva.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Restore theme choice before paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('scout-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
