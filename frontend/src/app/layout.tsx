import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inflation Monitor",
  description: "Gerçek zamanlı fiyat trendleri ve analiz dashboard'u",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}
