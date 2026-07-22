import EditExperienceClient from "./edit-experience-client";

export default async function EditExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditExperienceClient slug={slug} />;
}
