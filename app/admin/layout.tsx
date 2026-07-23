import type { Metadata } from "next"
import { connection } from "next/server"

import { AdminShell } from "@/components/admin/admin-shell"
import { requirePageUser } from "@/lib/auth/authorize"

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s - Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const user = await requirePageUser()

  return <AdminShell user={user}>{children}</AdminShell>
}
