import PostDetailClient from "./post-detail-client";

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailClient slug={slug} />;
}
