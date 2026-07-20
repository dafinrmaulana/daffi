import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Skills" }

export default function SkillsPage() {
  return <SimpleCrudPage kind="skills" />
}
