import { config } from "dotenv";

config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be a valid integer between 1 and 65535");
  }
  return parsed;
}

export const env = {
  nodeEnv: requireEnv("NODE_ENV"),
  port: parsePort(requireEnv("PORT")),
  frontendOrigin: requireEnv("FRONTEND_ORIGIN"),
};
