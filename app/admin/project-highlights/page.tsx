import type { Metadata } from "next";
import ProjectHighlightsClientPage from "./project-highlights-client-page";

export const metadata: Metadata = { title: "Project Highlights" };

export default function ProjectHighlightsPage() {
  return <ProjectHighlightsClientPage />;
}
