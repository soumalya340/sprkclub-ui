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
};

export default nextConfig;
