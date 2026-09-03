/**
 * Chain constants that do not depend on the active network.
 *
 * The active network is now runtime state, not a module constant: server code
 * resolves it per request via `@/lib/server/network`, client code reads it from
 * `useNetwork()` in `@/lib/chain/network-context`. Import those instead of
 * reaching for a global "current chain" — that is what let testnet and mainnet
 * drift apart.
 */
export {
  ogMainnet,
  ogTestnet,
  deploymentFor,
  isDeployedOn,
  ZERO,
  type Deployment,
  type OgNetwork,
} from "./chains";

export {
  DEFAULT_OG_NETWORK,
  NETWORK_COOKIE,
  chainFor,
  computeBaseUrl,
  computeModel,
  isOgNetwork,
  parseNetwork,
  storageExplorerUrl,
  storageIndexerUrl,
} from "./network";

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
