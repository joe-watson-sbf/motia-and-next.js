import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Motia - Ticketing System Demo",
  description: "This project demonstrates the power and simplicity of building full-stack applications with Motia and Next.js.",
  authors: [
    {
      name: "VAKAKS",
      url: "https://vakaks.com"
    }
  ],
  keywords: [
    "motia",
    "motia-next",
    "motia-react",
    "motia-js",
    "ticketing",
    "demo"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

