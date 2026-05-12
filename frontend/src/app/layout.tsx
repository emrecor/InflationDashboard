import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inflation Monitor — Gerçek Zamanlı Piyasa Analizi",
  description: "Türkiye gıda enflasyonu ve piyasa fiyatlarını gerçek zamanlı izle, trend analizi yap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
