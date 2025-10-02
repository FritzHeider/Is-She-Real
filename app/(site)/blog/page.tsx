import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, deep dives, and field notes from the Is She Real research team.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <section className="container space-y-10 py-24">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-semibold sm:text-5xl">Intelligence brief</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Dispatches on building resilient trust & safety operations in the age of synthetic media.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-3xl border border-border/60 bg-card/80 p-8 shadow-soft transition hover:border-primary/60"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              {new Date(post.metadata.date).toLocaleDateString()}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-foreground group-hover:text-primary">
              {post.metadata.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{post.metadata.description}</p>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
              {post.metadata.readTime}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
