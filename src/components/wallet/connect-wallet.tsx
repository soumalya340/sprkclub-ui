"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";
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
import { useSprkStore } from "@/lib/sprk-store";

/**
 * Real wallet connection via RainbowKit (WalletConnect + injected), rendered
 * with this app's own button/menu styling instead of RainbowKit's default chrome.
 */
export function ConnectWallet({ compact = false }: { compact?: boolean }) {
  const { disconnect } = useDisconnect();
  const { isVerifier } = useIsVerifier();
  const proposals = useSprkStore((s) => s.proposals);

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

        const addr = account.address.toLowerCase();
        const backedCount = proposals.filter((p) =>
          p.backers.some((b) => b.address.toLowerCase() === addr),
        ).length;
        const startedCount = proposals.filter(
          (p) => p.creator.toLowerCase() === addr,
        ).length;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                className="font-mono text-xs tabular-nums"
                aria-label={`Wallet ${truncateAddress(account.address)}`}
              >
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {truncateAddress(account.address)}
                <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-1.5">
              <div className="rounded-md bg-secondary/60 px-2.5 py-2.5">
                <DropdownMenuLabel className="flex items-center justify-between gap-2 p-0 font-normal">
                  <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {chain.name}
                  </span>
                  {isVerifier ? (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <ShieldCheck className="size-3.5" aria-hidden />
                      Verifier
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <p className="mt-1.5 font-mono text-sm tabular-nums tracking-tight text-foreground">
                  {truncateAddress(account.address, 6)}
                </p>
              </div>

              <DropdownMenuSeparator className="my-1.5" />

              <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <LayoutDashboard className="size-3.5" aria-hidden />
                Dashboard
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="justify-between gap-3">
                <Link href="/dashboard/crowdfunding-events">
                  <span>Backed events</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {backedCount}
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="justify-between gap-3">
                <Link href="/dashboard/started-events">
                  <span>Started events</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {startedCount}
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5" />

              <DropdownMenuItem onClick={openAccountModal}>
                <Wallet />
                Wallet details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={explorerAddress(account.address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink />
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
