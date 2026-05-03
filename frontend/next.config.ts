import path from "path";
import type { NextConfig } from "next";

// Next.js 16 infers the monorepo root from lockfiles. A stray `package-lock.json`
// in a parent directory (e.g. your home folder) can make Turbopack use the wrong
// root and yield a blank page or broken bundle. Pin the app root explicitly.
const nextConfig: NextConfig = {
  /** Self-hosted / Docker: produces `.next/standalone` + minimal `node_modules` trace. */
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // When pnpm skips sharp install scripts, image optimization can fail at runtime.
    // Dev uses unoptimized images so the UI still renders; production keeps optimization when sharp is OK.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
