import { createHash, createHmac, randomBytes } from "node:crypto";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be configured with at least 32 characters.",
    );
  }

  return secret;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashThrottleKey(
  kind: "username" | "ip",
  value: string,
) {
  return createHmac("sha256", getAuthSecret())
    .update(`${kind}:${value}`)
    .digest("hex");
}
