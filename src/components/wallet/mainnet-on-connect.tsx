"use client";

import { useEffect, useRef } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { ogMainnet } from "@/lib/chain/config";
import { useNetwork } from "@/lib/chain/network-context";

/**
 * Forces the app onto mainnet whenever a wallet connects.
 *
 * The network toggle is hidden while disconnected, so a testnet cookie left
 * over from an earlier session must not silently carry into a fresh
 * connection: every connect lands on mainnet, and testnet is reachable only
 * from the toggle inside the connected wallet menu.
 *
 * The wallet switch is best-effort — `setNetwork` reloads the app onto mainnet
 * either way, and the wrong-chain banner covers a wallet that stayed behind.
 *
 * Mounted once, inside <NetworkProvider>: <ConnectWallet /> renders in several
 * places at once, so the effect cannot live there without racing itself.
 */
export function MainnetOnConnect() {
  const { network, setNetwork } = useNetwork();
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const wasConnected = useRef(isConnected);

  useEffect(() => {
    const justConnected = isConnected && !wasConnected.current;
    wasConnected.current = isConnected;
    if (!justConnected || network === "mainnet") return;

    void (async () => {
      if (chainId !== ogMainnet.id) {
        try {
          await switchChainAsync({ chainId: ogMainnet.id });
        } catch {
          // Ignored: the app still moves, the banner flags the stale wallet.
        }
      }
      setNetwork("mainnet");
    })();
  }, [isConnected, chainId, network, setNetwork, switchChainAsync]);

  return null;
}
