import type { ComponentType } from "react";

export type BlogMetadata = {
  title: string;
  description: string;
  date: string;
  readTime: string;
};

export type BlogPost = {
  slug: string;
  metadata: BlogMetadata;
  Content: ComponentType;
};

export async function getAllPosts(): Promise<BlogPost[]> {
  const slugs = ["ai-trust-blueprint", "scaling-incident-response"];
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const mod = await import(`@/content/blog/${slug}.mdx`);
      return {
        slug,
        metadata: mod.metadata as BlogMetadata,
        Content: mod.default,
      };
    })
  );

  return posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const mod = await import(`@/content/blog/${slug}.mdx`);
    return {
      slug,
      metadata: mod.metadata as BlogMetadata,
      Content: mod.default,
    };
  } catch (error) {
    return null;
  }
}
