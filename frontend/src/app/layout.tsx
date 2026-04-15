import { Instrument_Sans } from "next/font/google";
import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/env";
import "./globals.css";

const siteBaseUrl = getSiteBaseUrl();

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-next",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "NST Campus Operations",
    template: "%s | NST Campus Operations",
  },
  description:
    "Secure campus service management platform for requests, analytics, facilities operations, and student support.",
  keywords: [
    "campus operations",
    "service request management",
    "facilities monitoring",
    "campus analytics",
    "technical operations dashboard",
  ],
  applicationName: "NST Campus Operations",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "NST Campus Operations",
    description:
      "Real-time operations platform for campus service workflows, student support, and facilities visibility.",
    type: "website",
    siteName: "NST Campus Operations",
  },
  twitter: {
    card: "summary_large_image",
    title: "NST Campus Operations",
    description:
      "Real-time operations platform for campus service workflows, student support, and facilities visibility.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
