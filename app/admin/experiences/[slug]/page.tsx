import ExperienceDetailClient from "./experience-detail-client";

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ExperienceDetailClient slug={slug} />;
}
