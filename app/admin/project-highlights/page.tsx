import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Project Highlights" }

export default function ProjectHighlightsPage() {
  return <SimpleCrudPage kind="projectHighlights" />
}
