import type { NextConfig } from "next";

// See src/lib/chain/x402-stub.ts — unused optional deps of the bundled
// Coinbase connector that would otherwise fail resolution at build time.
const x402Stub = "./src/lib/chain/x402-stub.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/svm/exact/client": x402Stub,
    },
  },
  async redirects() {
    return [
      {
        source: "/explore/crowdfunding-events",
        destination: "/explore/campaigns",
        permanent: true,
      },
      {
        source: "/explore/crowdfunding-events/:id",
        destination: "/explore/campaigns/:id",
        permanent: true,
      },
      {
        source: "/dashboard/crowdfunding-events",
        destination: "/dashboard/campaigns",
        permanent: true,
      },
      {
        source: "/dashboard/started-events",
        destination: "/dashboard/started-campaigns",
        permanent: true,
      },
      {
        source: "/dashboard/started-events/:path*",
        destination: "/dashboard/started-campaigns/:path*",
        permanent: true,
      },
      {
        source: "/faucet",
        destination: "/join",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
