import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/env";
import "./globals.css";

function metadataBaseUrl(): URL {
  try {
    return new URL(getSiteBaseUrl());
  } catch {
    return new URL("http://localhost:8000");
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
