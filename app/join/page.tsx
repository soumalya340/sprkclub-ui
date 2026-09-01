"use client";

import { Droplets, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { PageHeader } from "@/components/layout/page-header";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { Button } from "@/components/ui/button";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { activeChain, contracts, explorerAddress, explorerTx, isDeployed } from "@/lib/chain/config";
import { truncateAddress } from "@/lib/format";

/** Payable mint: send this much native 0G → receive 100× in SprkCoin. */
const FAUCET_VALUE = "0.01";
const FAUCET_STABLE = Number(FAUCET_VALUE) * 100;

/**
 * Claim SprkCoin (SPRK) on testnet — the mock stable used in stakes, ticket
 * mints, and dispute bonds.
 */
export default function JoinPage() {
  const { address, isConnected, chainId } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: decimals } = useReadContract({
    address: contracts.stablecoin,
    abi: MyTokenAbi,
    functionName: "decimals",
    query: { enabled: isDeployed },
  });

  const {
    data: balance,
    refetch: refetchBalance,
  } = useReadContract({
    address: contracts.stablecoin,
    abi: MyTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isDeployed && Boolean(address) },
  });

  const busy = isPending || confirming;
  const wrongChain = isConnected && chainId !== activeChain.id;

  async function claim() {
    try {
      const hash = await writeContractAsync({
        address: contracts.stablecoin,
        abi: MyTokenAbi,
        functionName: "mint",
        value: parseEther(FAUCET_VALUE),
      });
      setTxHash(hash);
      toast.success(`Claimed ${FAUCET_STABLE} SPRK`);
      setTimeout(() => refetchBalance(), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Claim failed";
      toast.error(message);
    }
  }

  if (!isDeployed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PageHeader
          kicker="0G"
          title="Join The Movement"
          description={`No contracts are deployed on ${activeChain.name} yet.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="0G testnet"
        title="Join The Movement"
        description="Claim SprkCoin to stake, mint tickets, and back campaigns on Galileo."
      />

      <div className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-8">
        {!address ? (
          <>
            <p className="text-sm text-muted-foreground">Connect a wallet to claim SprkCoin.</p>
            <div className="mt-4">
              <ConnectWallet />
            </div>
          </>
        ) : wrongChain ? (
          <>
            <p className="text-sm text-muted-foreground">
              Switch to {activeChain.name} to claim SprkCoin.
            </p>
            <div className="mt-4">
              <ConnectWallet />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Your balance
                </p>
                <p className="mt-1 font-mono text-3xl tabular-nums">
                  {typeof balance === "bigint" && typeof decimals === "number"
                    ? Number(formatUnits(balance, decimals)).toLocaleString()
                    : "—"}{" "}
                  <span className="text-lg text-muted-foreground">SPRK</span>
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {truncateAddress(address, 6)}
                </p>
              </div>
              <Button onClick={claim} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Droplets />}
                {busy ? "Claiming…" : "Claim SPRK"}
              </Button>
            </div>

            {txHash ? (
              <a
                href={explorerTx(txHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                View transaction <ExternalLink className="size-3" />
              </a>
            ) : null}
          </>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Each claim sends {FAUCET_VALUE} 0G and credits about {FAUCET_STABLE} SprkCoin. Token
        contract on{" "}
        <a
          href={explorerAddress(contracts.stablecoin)}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {activeChain.name}
        </a>
        .
      </p>
    </div>
  );
}
