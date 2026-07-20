import { AdminPageHeader } from "@/components/admin/AdminPageHeader"

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Dashboard" />
      <div data-testid="dashboard-empty" className="min-h-[55vh] border border-border" />
    </>
  )
}
