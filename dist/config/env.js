"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function parsePort(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("PORT must be a valid integer between 1 and 65535");
    }
    return parsed;
}
exports.env = {
    nodeEnv: requireEnv("NODE_ENV"),
    port: parsePort(requireEnv("PORT")),
    frontendOrigin: requireEnv("FRONTEND_ORIGIN"),
    databaseUrl: requireEnv("DATABASE_URL"),
};
//# sourceMappingURL=env.js.map