import type { Prisma } from "@/prisma/generated/prisma/client";
import type { ProjectMetric } from "@/types/project";

export function parseProjectMetrics(value: Prisma.JsonValue): ProjectMetric[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const label = "label" in entry && typeof entry.label === "string" ? entry.label.trim() : "";
    const metricValue = "value" in entry && typeof entry.value === "string" ? entry.value.trim() : "";
    return label && metricValue ? [{ label, value: metricValue }] : [];
  });
}

export function formatProjectYear(year: number) {
  return String(year);
}

export function getThumbnailKind(value: string): "remote" | "local" | "invalid" {
  if (value.startsWith("/")) return "local";
  if (/^https?:\/\/[^\s]+$/i.test(value)) return "remote";
  return "invalid";
}
