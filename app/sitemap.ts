import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://isshereal.ai";
  const routes = ["/", "/features", "/blog", "/about", "/contact"];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
