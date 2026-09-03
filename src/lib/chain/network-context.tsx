"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  deploymentFor,
  isDeployedOn,
  type Deployment,
  type OgNetwork,
} from "./chains";
import { chainFor, NETWORK_COOKIE, storageExplorerUrl } from "./network";

type NetworkContextValue = {
  network: OgNetwork;
  chain: ReturnType<typeof chainFor>;
  contracts: Deployment;
  isDeployed: boolean;
  /** Persists the choice and reloads so server components re-render for it. */
  setNetwork: (next: OgNetwork) => void;
  explorerTx: (hash: string) => string;
  explorerAddress: (addr: string) => string;
  storageExplorerRoot: (rootHash: string) => string;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

/**
 * Holds the active 0G network for the client tree. Seeded from the cookie the
 * server already read, so the first client render matches the server's HTML.
 *
 * Switching writes the cookie and does a full reload: server components, route
 * handlers and the DB queries behind them all key off that cookie, so a reload
 * is what makes the whole app — not just the wallet — move networks together.
 */
export function NetworkProvider({
  initialNetwork,
  children,
}: {
  initialNetwork: OgNetwork;
  children: React.ReactNode;
}) {
  const [network, setNetworkState] = useState<OgNetwork>(initialNetwork);

  const setNetwork = useCallback((next: OgNetwork) => {
    if (next === network) return;
    // One year, root path: the choice should survive navigation and restarts.
    document.cookie = `${NETWORK_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setNetworkState(next);
    window.location.reload();
  }, [network]);

  const value = useMemo<NetworkContextValue>(() => {
    const chain = chainFor(network);
    const explorer = chain.blockExplorers.default.url;
    return {
      network,
      chain,
      contracts: deploymentFor(network),
      isDeployed: isDeployedOn(network),
      setNetwork,
      explorerTx: (hash) => `${explorer}/tx/${hash}`,
      explorerAddress: (addr) => `${explorer}/address/${addr}`,
      storageExplorerRoot: (rootHash) =>
        `${storageExplorerUrl(network)}/?rootHash=${rootHash}`,
    };
  }, [network, setNetwork]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const value = useContext(NetworkContext);
  if (!value) {
    throw new Error("useNetwork must be used inside <NetworkProvider>");
  }
  return value;
}
