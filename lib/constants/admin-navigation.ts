import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileText,
  FolderKanban,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react"

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/experiences", label: "Experiences", icon: BriefcaseBusiness },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/skills", label: "Skills", icon: BadgeCheck },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/project-highlights", label: "Project Highlights", icon: UsersRound },
  { href: "/admin/users", label: "Users", icon: UserRound },
]

export function isAdminNavItemActive(item: AdminNavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function getAdminPageLabel(pathname: string) {
  return adminNavItems.find((item) => isAdminNavItemActive(item, pathname))?.label ?? "Admin"
}
