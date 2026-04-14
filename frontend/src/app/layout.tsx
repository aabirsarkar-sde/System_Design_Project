import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getSiteBaseUrl } from "@/lib/env";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const siteBaseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "Vanguard Campus Operations",
    template: "%s | Vanguard Campus Operations",
  },
  description: "Secure campus service management platform for requests, analytics, and facilities operations.",
  keywords: [
    "campus operations",
    "service request management",
    "facilities monitoring",
    "campus analytics",
    "technical operations dashboard",
  ],
  applicationName: "Vanguard Campus Operations",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Vanguard Campus Operations",
    description: "Real-time operations platform for campus service workflows and infrastructure visibility.",
    type: "website",
    siteName: "Vanguard Campus Operations",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanguard Campus Operations",
    description: "Real-time operations platform for campus service workflows and infrastructure visibility.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${manrope.variable} ${spaceGrotesk.variable}`}>
        <div className="ambient-backdrop" aria-hidden="true">
          <div className="ambient-blob ambient-blob-one" />
          <div className="ambient-blob ambient-blob-two" />
          <div className="ambient-blob ambient-blob-three" />
          <div className="ambient-grid" />
        </div>
        <div className="app-container animate-fade-in">
          <Sidebar />
          <div className="main-content">
            <Header />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
