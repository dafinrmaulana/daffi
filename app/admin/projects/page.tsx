import type { Metadata } from "next";

import ProjectsClientPage from "./projects-client-page";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <ProjectsClientPage />;
}
