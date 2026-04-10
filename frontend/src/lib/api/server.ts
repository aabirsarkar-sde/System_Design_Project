import "server-only";

import { getBackendApiBaseUrl } from "@/lib/env";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Ignore JSON parse errors and return generic message.
  }

  return `Request failed with status ${response.status}`;
}

export async function fetchFromBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBackendApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as T;
}
