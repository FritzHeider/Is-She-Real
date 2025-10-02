import type { MetadataRoute } from "next";

export function GET(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://isshereal.ai/sitemap.xml",
  };
}
