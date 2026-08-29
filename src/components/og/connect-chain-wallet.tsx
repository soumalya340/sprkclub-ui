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
import { activeChain, explorerAddress } from "@/lib/chain/config";
import { useIsVerifier } from "@/lib/chain/hooks";
import { truncateAddress } from "@/lib/format";

/** Real wallet connection against 0G, as opposed to the seed-data demo wallet. */
export function ConnectChainWallet({ compact = false }: { compact?: boolean }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { isVerifier } = useIsVerifier();

  const injected = connectors[0];
  const wrongChain = isConnected && chainId !== activeChain.id;

  if (!isConnected || !address) {
    return (
      <Button
        size={compact ? "sm" : "default"}
        disabled={isPending || !injected}
        onClick={() => {
          if (!injected) {
            toast.error("No browser wallet found. Install MetaMask or Rabby.");
            return;
          }
          connect({ connector: injected });
        }}
      >
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
        Switch to {activeChain.name}
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
      <DropdownMenuContent align="end" className="w-72">
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
