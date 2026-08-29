// The Coinbase/Base account connector bundled inside @wagmi/connectors (reached
// via RainbowKit's barrel export) lazily imports optional @x402/* payment
// packages. We don't install or use them — Sprkclub connects plain EVM wallets
// to 0G — and the imports sit behind `await import()` calls that never execute.
// The bundler still has to resolve them, so alias them here.
const unavailable = (): never => {
  throw new Error("@x402 is not installed: Coinbase payment flows are unused.");
};

const stub: unknown = new Proxy(unavailable, {
  get: (_target, prop) => (prop === "__esModule" ? true : stub),
});

export default stub;

// Named exports the CDP SDK destructures from these modules at import time.
export const toClientEvmSigner = stub;
export const cdpSolanaAccountToSvmSigner = stub;
export const ExactEvmScheme = stub;
export const registerExactEvmScheme = stub;
export const ExactSvmScheme = stub;
export const registerExactSvmScheme = stub;
export const UptoEvmScheme = stub;
export const registerUptoEvmScheme = stub;
export const createPaymentClient = stub;
