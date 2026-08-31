"use client";

import { Droplets, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatEther, formatUnits, parseEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { PageHeader } from "@/components/layout/page-header";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { Button } from "@/components/ui/button";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { activeChain, contracts, explorerAddress, explorerTx, isDeployed } from "@/lib/chain/config";
import { truncateAddress } from "@/lib/format";

/** SprkToken mints `msg.value * 100` tokens. 0.01 0G → 1 token unit * 100 = 1e18 * 1 if 18 decimals. */
const FAUCET_VALUE = "0.01";

/**
 * SprkToken.mint() is payable: send native 0G, receive 100× that amount in
 * stable units. Used for stakes, ticket mints, and dispute bonds on Galileo.
 */
export default function FaucetPage() {
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
  const expectedTokens = Number(FAUCET_VALUE) * 100;

  async function claim() {
    try {
      const hash = await writeContractAsync({
        address: contracts.stablecoin,
        abi: MyTokenAbi,
        functionName: "mint",
        value: parseEther(FAUCET_VALUE),
      });
      setTxHash(hash);
      toast.success(`Minted ~${expectedTokens} stable (sent ${FAUCET_VALUE} 0G)`);
      setTimeout(() => refetchBalance(), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mint failed";
      toast.error(message);
    }
  }

  if (!isDeployed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PageHeader
          kicker="0G"
          title="Faucet"
          description={`No contracts are deployed on ${activeChain.name} yet.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="0G testnet"
        title="Faucet"
        description="Mint the mock stablecoin used for stakes, ticket mints, and dispute bonds on 0G Galileo."
      />

      <div className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-8">
        {!address ? (
          <>
            <p className="text-sm text-muted-foreground">Connect a wallet to claim stablecoin.</p>
            <div className="mt-4">
              <ConnectWallet />
            </div>
          </>
        ) : wrongChain ? (
          <>
            <p className="text-sm text-muted-foreground">
              Switch to {activeChain.name} to mint.
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
                  <span className="text-lg text-muted-foreground">stable</span>
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {truncateAddress(address, 6)}
                </p>
              </div>
              <Button onClick={claim} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Droplets />}
                {busy ? "Minting…" : `Claim (~${expectedTokens} for ${FAUCET_VALUE} 0G)`}
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
        SprkToken <code>mint()</code> is payable: you send native 0G and receive{" "}
        <code>msg.value × 100</code> stable units (
        {formatEther(parseEther(FAUCET_VALUE))} 0G → ~{expectedTokens} tokens). Token:{" "}
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
