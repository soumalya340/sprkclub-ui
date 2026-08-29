import { defineChain } from "viem";

/**
 * 0G Galileo testnet. Contracts in `deps/sprkclub-smartcontract` are deployed here.
 * Mainnet (16661) is defined below but not deployed to — flip NEXT_PUBLIC_OG_NETWORK
 * to "mainnet" once the contracts are redeployed and the addresses below are filled in.
 */
export const ogTestnet = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc-testnet.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

export const ogMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan.0g.ai" },
  },
});

export type OgNetwork = "testnet" | "mainnet";

export const OG_NETWORK: OgNetwork =
  process.env.NEXT_PUBLIC_OG_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const activeChain = OG_NETWORK === "mainnet" ? ogMainnet : ogTestnet;

/** 0G Storage indexer — Node-side only. The browser never calls these. */
export const STORAGE_INDEXER_URL =
  OG_NETWORK === "mainnet"
    ? "https://indexer-storage-turbo.0g.ai"
    : "https://indexer-storage-testnet-turbo.0g.ai";

export const STORAGE_EXPLORER_URL =
  OG_NETWORK === "mainnet"
    ? "https://storagescan.0g.ai"
    : "https://storagescan-galileo.0g.ai";

type Deployment = {
  accessMaster: `0x${string}`;
  stablecoin: `0x${string}`;
  agenticVerifier: `0x${string}`;
  collab: `0x${string}`;
  holder: `0x${string}`;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

/** Deployed 2026-08-29 — see deps/sprkclub-smartcontract/README.md */
const TESTNET_DEPLOYMENT: Deployment = {
  accessMaster: "0x1c1A950C00bfEFFef4a9C0FF580a2bd2135B6C27",
  stablecoin: "0x0A550c1ad0Db4543a186C146DAb64D97eF27DAD0",
  agenticVerifier: "0xdF48680B583b5B8e45Bf44850D6BFa1ec45a595D",
  collab: "0x24C495F703E6B9ccd93694eDb51611eb68B09Fb5",
  holder: "0x8855e29BcD98AA1F63f93d44E0169D3704c95101",
};

/** Not deployed. Fill in after running the mainnet forge script. */
const MAINNET_DEPLOYMENT: Deployment = {
  accessMaster: ZERO,
  stablecoin: ZERO,
  agenticVerifier: ZERO,
  collab: ZERO,
  holder: ZERO,
};

export const contracts: Deployment =
  OG_NETWORK === "mainnet" ? MAINNET_DEPLOYMENT : TESTNET_DEPLOYMENT;

export const isDeployed = contracts.collab !== ZERO;

export function explorerTx(hash: string): string {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `${activeChain.blockExplorers.default.url}/address/${addr}`;
}
