import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/layout/CrudLayout"

export const metadata: Metadata = { title: "Companies" }

export default function CompaniesPage() {
  return <SimpleCrudPage kind="companies" />
}
