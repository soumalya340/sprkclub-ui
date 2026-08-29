"use client";

import { Check, ChevronDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/format";
import { useSprkStore } from "@/lib/sprk-store";

export function ConnectWallet({ compact = false }: { compact?: boolean }) {
  const connected = useSprkStore((s) => s.connected);
  const wallets = useSprkStore((s) => s.wallets);
  const activeWalletId = useSprkStore((s) => s.activeWalletId);
  const connect = useSprkStore((s) => s.connect);
  const disconnect = useSprkStore((s) => s.disconnect);
  const switchWallet = useSprkStore((s) => s.switchWallet);
  const active = wallets.find((w) => w.id === activeWalletId);

  if (!connected || !active) {
    return (
      <Button
        size={compact ? "sm" : "default"}
        onClick={() => {
          connect();
          toast.success("Wallet connected");
        }}
      >
        <Wallet />
        Connect wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className="font-mono text-xs">
          <span className="size-1.5 rounded-full bg-success" />
          {truncateAddress(active.address)}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Demo wallets</DropdownMenuLabel>
        {wallets.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => {
              switchWallet(w.id);
              toast.message(`Switched to ${w.label}`);
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm">{w.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {truncateAddress(w.address, 5)}
              </span>
            </div>
            {w.id === activeWalletId ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            disconnect();
            toast.message("Wallet disconnected");
          }}
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
