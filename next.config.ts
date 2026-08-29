import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Coinbase connector inside @reown/appkit reaches for optional x402
  // payment packages we neither install nor use (enableCoinbase is off).
  // Stub them so the bundler stops trying to resolve them.
  turbopack: {
    resolveAlias: {
      "@x402/core/client": "./src/lib/chain/empty-module.ts",
      "@x402/evm": "./src/lib/chain/empty-module.ts",
      "@x402/evm/exact/client": "./src/lib/chain/empty-module.ts",
      "@x402/evm/upto/client": "./src/lib/chain/empty-module.ts",
      "@x402/svm/exact/client": "./src/lib/chain/empty-module.ts",
    },
  },
};

export default nextConfig;
