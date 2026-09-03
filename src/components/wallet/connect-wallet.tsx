"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Rocket,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { activeChain, explorerAddress, ogMainnet, ogTestnet } from "@/lib/chain/config";
import { truncateAddress } from "@/lib/format";
import { useSprkStore } from "@/lib/sprk-store";

/**
 * Wallet-side network toggle. Only switches which chain the connected wallet
 * talks to — the app's contracts/API always stay pinned to `activeChain`
 * (chain/config.ts). Switching away from that chain means writes (stake,
 * mint, vote, dispute) will fail or target the wrong deployment.
 */
function NetworkToggle({ currentChainId }: { currentChainId: number }) {
  const { switchChain, isPending } = useSwitchChain();

  return (
    <div className="flex items-center gap-1 rounded-md bg-secondary/60 p-0.5">
      {[ogMainnet, ogTestnet].map((c) => {
        const isActive = currentChainId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            disabled={isPending || isActive}
            onClick={() => switchChain({ chainId: c.id })}
            className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors disabled:cursor-default ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.testnet ? "Testnet" : "Mainnet"}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Real wallet connection via RainbowKit (WalletConnect + injected), rendered
 * with this app's own button/menu styling instead of RainbowKit's default chrome.
 */
export function ConnectWallet({
  compact = false,
  className,
}: {
  compact?: boolean;
  /** Styles the disconnected/unsupported trigger — lets the hero render it as a pill. */
  className?: string;
}) {
  const { disconnect } = useDisconnect();
  const proposals = useSprkStore((s) => s.proposals);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openAccountModal,
        openChainModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          // Avoid a connected/disconnected flash before wagmi has hydrated.
          return (
            <div aria-hidden className="pointer-events-none opacity-0">
              <Button size={compact ? "sm" : "default"} className={className}>
                <Wallet />
                Connect wallet
              </Button>
            </div>
          );
        }

        if (!connected) {
          return (
            <Button
              size={compact ? "sm" : "default"}
              className={className}
              onClick={openConnectModal}
            >
              <Wallet />
              Connect wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button
              size={compact ? "sm" : "default"}
              variant="outline"
              onClick={openChainModal}
            >
              <TriangleAlert className="text-warn" />
              Switch network
            </Button>
          );
        }

        const onActiveChain = chain.id === activeChain.id;
        const addr = account.address.toLowerCase();
        const backedCount = proposals.filter((p) =>
          p.backers.some((b) => b.address.toLowerCase() === addr),
        ).length;
        const startedCount = proposals.filter(
          (p) => p.creator.toLowerCase() === addr,
        ).length;
        const readyToLaunchCount = proposals.filter(
          (p) => p.creator.toLowerCase() === addr && p.status === "passed",
        ).length;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 gap-1.5 rounded-full px-3 font-mono text-xs tabular-nums"
                aria-label={`Wallet ${truncateAddress(account.address)}`}
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${onActiveChain ? "bg-success" : "bg-warn"}`}
                  aria-hidden
                />
                {truncateAddress(account.address)}
                <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-1.5">
              <div className="rounded-md bg-secondary/60 px-2.5 py-2.5">
                <DropdownMenuLabel className="flex items-center justify-between gap-2 p-0 font-normal">
                  <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {chain.name}
                  </span>
                </DropdownMenuLabel>
                <p className="mt-1.5 font-mono text-sm tabular-nums tracking-tight text-foreground">
                  {truncateAddress(account.address, 6)}
                </p>
                <div className="mt-2.5">
                  <NetworkToggle currentChainId={chain.id} />
                </div>
                {!onActiveChain ? (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-warn">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    The app runs on {activeChain.name}. Actions like stake,
                    mint, and vote need the wallet on {activeChain.name} too.
                  </p>
                ) : null}
              </div>

              <DropdownMenuSeparator className="my-1.5" />

              <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <LayoutDashboard className="size-3.5" aria-hidden />
                Dashboard
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="justify-between gap-3">
                <Link href="/dashboard/campaigns">
                  <span>Backed campaigns</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {backedCount}
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="justify-between gap-3">
                <Link href="/dashboard/started-campaigns">
                  <span>Started campaigns</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {startedCount}
                  </span>
                </Link>
              </DropdownMenuItem>
              {readyToLaunchCount > 0 ? (
                <DropdownMenuItem asChild className="justify-between gap-3">
                  <Link href="/dashboard/started-campaigns#ready-to-launch">
                    <span className="flex items-center gap-2">
                      <Rocket className="size-3.5" aria-hidden />
                      Convert proposal
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {readyToLaunchCount}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ) : null}

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
