import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { Section } from "@/components/layout/section";
import { PageIntro } from "@/components/shared/page-intro";
import { getAllPublicPosts } from "@/lib/data/public-posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on frontend development, product interfaces, and building dependable digital experiences.",
};

export default async function BlogPage() {
  const posts = await getAllPublicPosts();

  return (
    <Section>
      <PageIntro
        className="mb-12"
        eyebrow="Writing"
        title="Notes on interfaces, engineering, and shipping reliable products."
      />
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="border border-border p-8 sm:p-10">
          <p className="font-serif text-3xl">No published Posts yet.</p>
          <p className="mt-3 text-muted">New writing will appear here once it is ready.</p>
        </div>
      )}
    </Section>
  );
}
