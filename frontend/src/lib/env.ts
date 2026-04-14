import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
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
