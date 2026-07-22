import type { Metadata } from "next";
import SkillsClientPage from "./skill-client-page";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return <SkillsClientPage />;
}
