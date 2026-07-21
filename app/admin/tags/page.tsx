import type { Metadata } from "next";
import TagsClientPage from "./tags-client-page";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return <TagsClientPage />;
}
