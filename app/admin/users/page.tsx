import type { Metadata } from "next"

import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Users" }

export default function UsersPage() {
  return <SimpleCrudPage kind="users" />
}
