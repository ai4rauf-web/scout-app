import type { Metadata, Viewport } from "next";
import { Open_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scout — conversational property search",
  description:
    "A Property Finder Scout prototype. Talk to Scout in natural language, see what it understood, and steer mid-conversation.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${notoArabic.variable}`}
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
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
