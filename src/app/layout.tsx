import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaroInitializer } from "@/components/FaroInitializer";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
});

const defaultUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? process.env.NEXT_PUBLIC_BASE_URL
  : "https://fruits-drill.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "ふるーつドリル | 小学生向け無料学習ドリル",
    template: "%s | ふるーつドリル",
  },
  description:
    "「ふるーつドリル」は、かわいくて楽しい、小学生向けの無料学習プリントサイトです。国語、算数などの問題を、かわいいフルーツのキャラクターと一緒に楽しく学べます。",
  keywords: ["学習ドリル", "小学生", "無料プリント", "国語", "算数", "ふるーつドリル"],
  authors: [{ name: "Fruits Drill Team" }],
  openGraph: {
    title: "ふるーつドリル | 小学生向け無料学習ドリル",
    description: "「ふるーつドリル」は、かわいくて楽しい、小学生向けの無料学習プリントサイトです。",
    url: defaultUrl,
    siteName: "ふるーつドリル",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ふるーつドリル | 小学生向け無料学習ドリル",
    description: "「ふるーつドリル」は、かわいくて楽しい、小学生向けの無料学習プリントサイトです。",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} antialiased font-sans min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">{children}</main>
        {modal}
        <Footer />
        <SpeedInsights />
        <FaroInitializer />
      </body>
    </html>
  );
}
