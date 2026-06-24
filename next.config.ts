import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components enables `use cache`, cacheTag/updateTag, and Partial
  // Prerendering. Cached reads (lib/projects/data.ts) become part of the static
  // shell; anything reading runtime data (searchParams) streams under <Suspense>.
  cacheComponents: true,
};

export default nextConfig;
