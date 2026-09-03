import { defineChain } from "viem";

/**
 * 0G Galileo testnet. Kept for reference / older deployments — mainnet
 * (16661) is the default network now that the Collab contracts are live there.
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
  process.env.NEXT_PUBLIC_OG_NETWORK === "testnet" ? "testnet" : "mainnet";

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
  /** @deprecated Unused on the money path — optimistic dispute replaced AgenticVerifier. */
  agenticVerifier: `0x${string}`;
  collabFactory: `0x${string}`;
  /** Sample / demo Collab instance from the optimistic-dispute deploy. */
  collab: `0x${string}`;
  /** @deprecated Holder path not in Wave dispute UI. */
  holder: `0x${string}`;
  /** Server signer authorized for recordAuditRoot. */
  relayer: `0x${string}`;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

/**
 * Optimistic dispute-escrow deploy (no AgenticVerifier on money path).
 * See deps/smart_contracts/README.md — Galileo chain 16602.
 */
const TESTNET_DEPLOYMENT: Deployment = {
  accessMaster: "0x1c78C8D3EF0506bF4d6Af08E8C1b41D150A57CF3",
  stablecoin: "0x0E92016aF2fddC74D9709E9c26E1D95d2DC7f311",
  agenticVerifier: ZERO,
  collabFactory: "0xCF7D80C69E93B8a728059EB605586c4373F71514",
  collab: "0x84eFcd6291168f3E3C618a28757eFB4B4344FC0F",
  holder: ZERO,
  relayer: "0xF0258C922928eB7B37C1B28201609Efa2437e29d",
};

/**
 * Optimistic dispute-escrow deploy (no AgenticVerifier on money path).
 * See deps/smart_contracts/README.md — 0G Mainnet chain 16661.
 *
 * `stablecoin` here is the same test/dev SprkToken used on testnet
 * (permissionless `mint()` / `delegateMint()`) — it holds no real value and
 * must be replaced with a real stablecoin before any production proposal
 * collects real user funds.
 */
const MAINNET_DEPLOYMENT: Deployment = {
  accessMaster: "0x1c1A950C00bfEFFef4a9C0FF580a2bd2135B6C27",
  stablecoin: "0x0A550c1ad0Db4543a186C146DAb64D97eF27DAD0",
  agenticVerifier: ZERO,
  collabFactory: "0xdF48680B583b5B8e45Bf44850D6BFa1ec45a595D",
  collab: "0xD993C727250E5cA5D8863320B73FAEdCE55f3f61",
  holder: ZERO,
  relayer: "0xF0258C922928eB7B37C1B28201609Efa2437e29d",
};

export const contracts: Deployment =
  OG_NETWORK === "mainnet" ? MAINNET_DEPLOYMENT : TESTNET_DEPLOYMENT;

export const isDeployed = contracts.collab !== ZERO;

/** On-chain MilestoneStatus enum order from SprkClubCollab.sol */
export const MilestoneStatusOnChain = {
  None: 0,
  ProofSubmitted: 1,
  InDisputeWindow: 2,
  Challenged: 3,
  Finalized: 4,
  Rejected: 5,
} as const;

export type MilestoneStatusOnChainValue =
  (typeof MilestoneStatusOnChain)[keyof typeof MilestoneStatusOnChain];

export const DISPUTE_WINDOW_SECONDS = 7 * 24 * 60 * 60;
export const VOTE_PERIOD_SECONDS = 3 * 24 * 60 * 60;

export function explorerTx(hash: string): string {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `${activeChain.blockExplorers.default.url}/address/${addr}`;
}

export function storageExplorerRoot(rootHash: string): string {
  return `${STORAGE_EXPLORER_URL}/?rootHash=${rootHash}`;
}
