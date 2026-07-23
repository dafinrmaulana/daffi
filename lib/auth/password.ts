import { hash, verify, type Options } from "@node-rs/argon2";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(15, "Password must be at least 15 characters.")
  .max(128, "Password may not be greater than 128 characters.");

const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} satisfies Options;

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$4halr7wJAO0bmlNkTwoNDQ$DPPCxlYPBuLrgtZKivlREKlMGCOdKYOcy9evY/+1Vi8";

export function hashPassword(password: string) {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  encodedHash: string,
  password: string,
) {
  try {
    return await verify(encodedHash, password);
  } catch {
    return false;
  }
}

export function verifyPasswordOrDummy(
  encodedHash: string | null,
  password: string,
) {
  return verifyPassword(encodedHash ?? DUMMY_PASSWORD_HASH, password);
}
