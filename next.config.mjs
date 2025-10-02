import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig = {
  experimental: {
    mdxRs: true,
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
};

export default withMDX(nextConfig);
