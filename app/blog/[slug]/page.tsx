import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PostArticle } from "@/components/blog/post-article";
import { Section } from "@/components/layout/section";
import { getPublishedPost } from "@/lib/data/published-posts";

const getPost = cache((slug: string) => getPublishedPost(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags.map((tag) => tag.name),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags.map((tag) => tag.name),
      images: [{ url: post.thumbnail, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnail],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <Section>
      <PostArticle post={post} />
    </Section>
  );
}
