import "server-only";

const devDefaults: Record<string, string> = {
  BACKEND_API_BASE_URL: "http://localhost:4000",
  SITE_BASE_URL: "http://localhost:8000",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV !== "production" && devDefaults[name]) {
      return devDefaults[name];
    }

    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getBackendApiBaseUrl(): string {
  const url = requireEnv("BACKEND_API_BASE_URL").trim();
  return url.replace(/\/+$/, "");
}

/** Public origin (no trailing slash). Uses `VERCEL_URL` when `SITE_BASE_URL` is unset (Vercel build/runtime). */
export function getSiteBaseUrl(): string {
  const explicit = process.env.SITE_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    const protocol = process.env.VERCEL === "1" ? "https" : "http";
    return `${protocol}://${vercelHost}`.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production" && devDefaults.SITE_BASE_URL) {
    return devDefaults.SITE_BASE_URL.replace(/\/+$/, "");
  }

  throw new Error("Missing required environment variable: SITE_BASE_URL");
}
