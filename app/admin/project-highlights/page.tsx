import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/layout/CrudLayout"

export const metadata: Metadata = { title: "Project Highlights" }

export default function ProjectHighlightsPage() {
  return <SimpleCrudPage kind="projectHighlights" />
}
