import type { Metadata } from "next";
import UsersClientPage from "../tags/users-client-page";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <UsersClientPage />;
}
