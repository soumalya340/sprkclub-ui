"use client";

import { ChevronDown, LogOut, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasProjectId, openAppKit } from "@/lib/chain/appkit";
import { activeChain, explorerAddress } from "@/lib/chain/config";
import { useIsVerifier } from "@/lib/chain/hooks";
import { truncateAddress } from "@/lib/format";

/**
 * Real wallet connection. Opens the WalletConnect/AppKit modal when a Reown
 * project id is configured, and falls back to the injected connector
 * (MetaMask, Rabby) when it isn't.
 */
export function ConnectWallet({ compact = false }: { compact?: boolean }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { isVerifier } = useIsVerifier();

  const wrongChain = isConnected && chainId !== activeChain.id;

  function startConnect() {
    if (hasProjectId) {
      void openAppKit();
      return;
    }
    const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];
    if (!injected) {
      toast.error("No wallet found. Install MetaMask, or set NEXT_PUBLIC_REOWN_PROJECT_ID.");
      return;
    }
    connect({ connector: injected });
  }

  if (!isConnected || !address) {
    return (
      <Button size={compact ? "sm" : "default"} disabled={isPending} onClick={startConnect}>
        <Wallet />
        {isPending ? "Connecting…" : "Connect wallet"}
      </Button>
    );
  }

  if (wrongChain) {
    return (
      <Button
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={() => switchChain({ chainId: activeChain.id })}
      >
        <TriangleAlert className="text-warn" />
        Switch network
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className="font-mono text-xs"
        >
          <span className="size-1.5 rounded-full bg-success" />
          {truncateAddress(address)}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{activeChain.name}</span>
          {isVerifier ? (
            <span className="flex items-center gap-1 text-xs font-normal text-success">
              <ShieldCheck className="size-3.5" />
              Verifier
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasProjectId ? (
          <DropdownMenuItem onClick={() => void openAppKit("Account")}>
            Wallet details
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <a href={explorerAddress(address)} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            disconnect();
            toast.message("Wallet disconnected");
          }}
        >
          <LogOut />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
