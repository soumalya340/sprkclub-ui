"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, LogOut, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useDisconnect } from "wagmi";
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

/**
 * Real wallet connection via RainbowKit (WalletConnect + injected), rendered
 * with this app's own button/menu styling instead of RainbowKit's default chrome.
 */
export function ConnectWallet({ compact = false }: { compact?: boolean }) {
  const { disconnect } = useDisconnect();
  const { isVerifier } = useIsVerifier();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          // Avoid a connected/disconnected flash before wagmi has hydrated.
          return (
            <div aria-hidden className="pointer-events-none opacity-0">
              <Button size={compact ? "sm" : "default"}>
                <Wallet />
                Connect wallet
              </Button>
            </div>
          );
        }

        if (!connected) {
          return (
            <Button size={compact ? "sm" : "default"} onClick={openConnectModal}>
              <Wallet />
              Connect wallet
            </Button>
          );
        }

        if (chain.unsupported || chain.id !== activeChain.id) {
          return (
            <Button
              size={compact ? "sm" : "default"}
              variant="outline"
              onClick={openAccountModal}
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
                {truncateAddress(account.address)}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                <span>{chain.name}</span>
                {isVerifier ? (
                  <span className="flex items-center gap-1 text-xs font-normal text-success">
                    <ShieldCheck className="size-3.5" />
                    Verifier
                  </span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openAccountModal}>
                Wallet details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={explorerAddress(account.address)} target="_blank" rel="noreferrer">
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
      }}
    </ConnectButton.Custom>
  );
}
