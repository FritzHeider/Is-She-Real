import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { Content, metadata } = post;

  return (
    <article className="container prose prose-slate mx-auto max-w-3xl py-24 dark:prose-invert">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">{new Date(metadata.date).toLocaleDateString()}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">{metadata.title}</h1>
      <p className="mt-3 text-muted-foreground">{metadata.description}</p>
      <p className="mt-1 text-sm text-muted-foreground">{metadata.readTime}</p>
      <div className="mt-10 space-y-6 text-base leading-7 text-foreground">
        <Content />
      </div>
    </article>
  );
}
