import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Tags" }

export default function TagsPage() {
  return <SimpleCrudPage kind="tags" />
}
