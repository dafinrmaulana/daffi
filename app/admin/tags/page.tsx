import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/layout/CrudLayout"

export const metadata: Metadata = { title: "Tags" }

export default function TagsPage() {
  return <SimpleCrudPage kind="tags" />
}
