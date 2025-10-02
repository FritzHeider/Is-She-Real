"use client";

import Link from "next/link";
import { blogPosts } from "@/lib/copy";
import { useGsapReveal } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";

export function BlogPreview() {
  const ref = useGsapReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="container space-y-10 py-24" data-animate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-display font-semibold sm:text-4xl">From the intelligence brief</h2>
          <p className="text-muted-foreground">Stories and deep dives from the Is She Real research team.</p>
        </div>
        <Badge variant="outline" className="h-fit">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm">
            View all
          </Link>
        </Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-3xl border border-border/60 bg-card/80 p-8 shadow-soft transition hover:border-primary/60"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{new Date(post.date).toLocaleDateString()}</p>
            <h3 className="mt-4 text-2xl font-semibold text-foreground group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{post.description}</p>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
              {post.readTime}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
