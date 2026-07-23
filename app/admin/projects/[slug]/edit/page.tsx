import EditProjectClient from "./edit-project-client";

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditProjectClient slug={slug} />;
}
