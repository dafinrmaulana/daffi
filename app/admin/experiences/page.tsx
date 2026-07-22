import type { Metadata } from "next";

import ExperiencesClientPage from "./experiences-client-page";

export const metadata: Metadata = { title: "Experiences" };

export default function ExperiencesPage() {
  return <ExperiencesClientPage />;
}
