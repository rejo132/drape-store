import type { Metadata } from "next";
import localFont from "next/font/local";

import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DRAPE – Modern Clothing",
  description:
    "Shop curated modern clothing at DRAPE. Browse essentials, save cards securely with Stripe, and checkout in one click.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "DRAPE – Modern Clothing",
    description:
      "Shop curated modern clothing at DRAPE. Browse essentials, save cards securely with Stripe, and checkout in one click.",
    url: "/",
    siteName: "DRAPE",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRAPE – Modern Clothing",
    description:
      "Shop curated modern clothing at DRAPE. Browse essentials, save cards securely with Stripe, and checkout in one click.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
