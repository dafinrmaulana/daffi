import { z } from "zod";

export function normalizeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255)
    .replace(/-+$/g, "");
}

export const slugInputSchema = z
  .string()
  .trim()
  .max(255, "The slug may not be greater than 255 characters.")
  .optional();
