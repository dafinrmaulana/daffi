import type { Metadata } from "next";

import PostsClientPage from "./posts-client-page";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return <PostsClientPage />;
}
