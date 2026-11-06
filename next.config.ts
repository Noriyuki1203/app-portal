import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Server Action で受け取れる大きさ（画像のアップロード用。ふつうは 1MB まで）
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Supabase Storage の公開画像だけ、<Image> で表示してよい
    remotePatterns: [
      new URL("https://rrtiunextojtqvgsuzna.supabase.co/storage/v1/object/public/app-images/**"),
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
