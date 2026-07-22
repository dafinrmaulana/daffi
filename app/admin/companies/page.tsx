import type { Metadata } from "next";
import CompaniesClientPage from "./company-client-page";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return <CompaniesClientPage />;
}
