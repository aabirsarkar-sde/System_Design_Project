import "server-only";

const devDefaults: Record<string, string> = {
  BACKEND_API_BASE_URL: "http://localhost:4000",
  SITE_BASE_URL: "http://localhost:3000",
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

export function getSiteBaseUrl(): string {
  const url = requireEnv("SITE_BASE_URL").trim();
  return url.replace(/\/+$/, "");
}
