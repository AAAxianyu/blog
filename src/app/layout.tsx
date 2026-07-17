import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReadingProgress from "@/components/features/ReadingProgress";
import BackToTop from "@/components/features/BackToTop";
import NoiseTexture from "@/components/ui/NoiseTexture";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "x1anyu的小屋 — 记录思考与成长",
    template: "%s — x1anyu的小屋",
  },
  description: "x1anyu的个人博客。记录技术、设计、生活的思考和感悟。",
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "x1anyu的小屋",
    description: "记录技术、设计、生活的思考和感悟。",
    type: "website",
    locale: "zh_CN",
    siteName: "x1anyu的小屋",
  },
  twitter: {
    card: "summary_large_image",
    title: "x1anyu的小屋",
    description: "记录技术、设计、生活的思考和感悟。",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() { try { var t = localStorage.getItem('theme');
          if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches))
          document.documentElement.classList.add('dark'); } catch(_){} })();` }} />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <ThemeProvider>
          <NoiseTexture />
          <ReadingProgress />
          <Header />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
