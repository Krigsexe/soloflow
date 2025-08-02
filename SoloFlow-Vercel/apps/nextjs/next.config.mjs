// @ts-check
import "./src/env.mjs";
import "@soloflow/auth/env.mjs";

// import { withNextDevtools } from "@next-devtools/core/plugin";
// import "@soloflow/api/env"
import withMDX from "@next/mdx";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@soloflow/api",
    "@soloflow/auth",
    "@soloflow/db",
    "@soloflow/common",
    "@soloflow/ui",
    "@soloflow/stripe",
  ],
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    mdxRs: true,
    // serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.twillot.com',
      },
      {
        protocol: 'https',
        hostname: 'cdnv2.ruguoapp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.setupyourpay.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
};

export default withMDX()(config);
