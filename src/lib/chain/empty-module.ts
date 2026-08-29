// Stub for the optional x402 packages pulled in by @reown/appkit's Coinbase
// connector, which is disabled via `enableCoinbase: false` — this code never
// runs. A Proxy satisfies whatever named export the importer asks for.
const stub: unknown = new Proxy(
  () => {
    throw new Error("x402 is not available: the Coinbase connector is disabled.");
  },
  {
    get: (_target, prop) => (prop === "__esModule" ? true : stub),
  },
);

export default stub;
export const toClientEvmSigner = stub;
export const createSigner = stub;
export const exact = stub;
export const upto = stub;
