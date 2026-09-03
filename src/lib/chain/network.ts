import { ogMainnet, ogTestnet, type OgNetwork } from "./chains";

/**
 * Which network a fresh visitor gets. The runtime toggle (cookie) overrides
 * this per browser; the env var only decides the default.
 */
export const DEFAULT_OG_NETWORK: OgNetwork =
  process.env.NEXT_PUBLIC_OG_NETWORK === "testnet" ? "testnet" : "mainnet";

/** Cookie the network toggle writes. Read server-side on every request. */
export const NETWORK_COOKIE = "og-network";

export function isOgNetwork(value: unknown): value is OgNetwork {
  return value === "testnet" || value === "mainnet";
}

/** Narrows any untrusted string (cookie, header, query) to a network. */
export function parseNetwork(value: unknown): OgNetwork {
  return isOgNetwork(value) ? value : DEFAULT_OG_NETWORK;
}

export function chainFor(network: OgNetwork) {
  return network === "mainnet" ? ogMainnet : ogTestnet;
}

/** 0G Storage indexer — Node-side only. The browser never calls these. */
export function storageIndexerUrl(network: OgNetwork): string {
  return network === "mainnet"
    ? "https://indexer-storage-turbo.0g.ai"
    : "https://indexer-storage-testnet-turbo.0g.ai";
}

export function storageExplorerUrl(network: OgNetwork): string {
  return network === "mainnet"
    ? "https://storagescan.0g.ai"
    : "https://storagescan-galileo.0g.ai";
}

export function computeBaseUrl(network: OgNetwork): string {
  return network === "mainnet"
    ? "https://router-api.0g.ai/v1"
    : "https://router-api-testnet.integratenetwork.work/v1";
}

export function computeModel(network: OgNetwork): string {
  return network === "mainnet" ? "qwen3-vl-30b" : "qwen2.5-omni";
}
