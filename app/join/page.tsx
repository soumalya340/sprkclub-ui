"use client";

import { Droplets, ExternalLink, Loader2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { PageHeader } from "@/components/layout/page-header";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { useNetwork } from "@/lib/chain/network-context";
import { truncateAddress } from "@/lib/format";

/** Contract rate: 1 native 0G minted → 100 SprkCoin (SprkCoin.sol `mint()`: `_mint(msg.sender, msg.value * 100)`). */
const MINT_RATE = 100;
const QUICK_AMOUNTS = ["0.01", "0.1", "1"];

/** Loosely validate a decimal string is a positive, parseable amount before it hits parseEther. */
function parseAmount(raw: string): number | null {
  if (!/^\d*\.?\d*$/.test(raw) || raw === "" || raw === ".") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * Claim SprkCoin (SPRK) — the mock stable used in stakes, ticket mints, and
 * dispute bonds. Rate is fixed by the contract at 100 SPRK per 0G. Network
 * (mainnet/testnet) follows `activeChain` from chain/config.ts.
 */
export default function JoinPage() {
  const {
    chain: activeChain,
    contracts,
    isDeployed,
    explorerAddress,
    explorerTx,
  } = useNetwork();
  const inputId = useId();
  const { address, isConnected, chainId } = useAccount();
  const [amount, setAmount] = useState("0.01");
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

  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const busy = isPending || confirming;
  const wrongChain = isConnected && chainId !== activeChain.id;

  const parsedAmount = useMemo(() => parseAmount(amount), [amount]);
  const insufficientNative =
    parsedAmount !== null && nativeBalance ? parseEther(amount) > nativeBalance.value : false;
  const amountError =
    amount.length > 0 && parsedAmount === null
      ? "Enter a valid amount, e.g. 0.05"
      : insufficientNative
        ? `You only have ${Number(formatUnits(nativeBalance!.value, 18)).toLocaleString()} 0G`
        : null;
  const canClaim = parsedAmount !== null && !insufficientNative && !busy;
  const sprkPreview = parsedAmount !== null ? parsedAmount * MINT_RATE : 0;

  async function claim() {
    if (!canClaim || parsedAmount === null) return;
    try {
      const hash = await writeContractAsync({
        address: contracts.stablecoin,
        abi: MyTokenAbi,
        functionName: "mint",
        value: parseEther(amount),
      });
      setTxHash(hash);
      toast.success(`Claimed ${sprkPreview.toLocaleString()} SPRK`);
      setTimeout(() => {
        refetchBalance();
        refetchNative();
      }, 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Claim failed";
      if (!/user rejected/i.test(message)) toast.error(message);
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
        kicker={activeChain.name}
        title="Join The Movement"
        description={`Claim SprkCoin to stake, mint tickets, and back campaigns on ${activeChain.name}.`}
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
            <div className="flex flex-wrap items-start justify-between gap-6">
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

              {nativeBalance ? (
                <p className="font-mono text-xs text-muted-foreground">
                  Wallet: {Number(formatUnits(nativeBalance.value, 18)).toLocaleString()} 0G
                </p>
              ) : null}
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <label
                htmlFor={inputId}
                className="text-xs uppercase tracking-[0.16em] text-muted-foreground"
              >
                Amount to send (0G)
              </label>
              <div className="mt-2 flex flex-wrap gap-3 sm:flex-nowrap">
                <Input
                  id={inputId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.05"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={busy}
                  aria-invalid={amountError ? "true" : undefined}
                  aria-describedby={amountError ? `${inputId}-error` : `${inputId}-preview`}
                  className="font-mono text-base tabular-nums sm:max-w-[200px]"
                />
                <Button onClick={claim} disabled={!canClaim} className="shrink-0">
                  {busy ? <Loader2 className="animate-spin" /> : <Droplets />}
                  {busy ? "Claiming…" : "Claim SPRK"}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value)}
                    disabled={busy}
                    className="rounded-full border border-input px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {value} 0G
                  </button>
                ))}
                {nativeBalance && nativeBalance.value > 0n ? (
                  <button
                    type="button"
                    onClick={() => setAmount(formatUnits(nativeBalance.value, 18))}
                    disabled={busy}
                    className="rounded-full border border-input px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Max
                  </button>
                ) : null}
              </div>

              {amountError ? (
                <p id={`${inputId}-error`} className="mt-3 text-xs text-destructive">
                  {amountError}
                </p>
              ) : (
                <p id={`${inputId}-preview`} className="mt-3 text-xs text-muted-foreground">
                  You&apos;ll send{" "}
                  <span className="font-mono tabular-nums text-foreground">
                    {parsedAmount !== null ? parsedAmount.toLocaleString() : "0"} 0G
                  </span>{" "}
                  and receive{" "}
                  <span className="font-mono tabular-nums text-foreground">
                    {sprkPreview.toLocaleString()} SPRK
                  </span>{" "}
                  ({MINT_RATE}× rate, fixed by the contract).
                </p>
              )}
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
        Every 0G sent mints {MINT_RATE}× in SprkCoin — send any amount you like. Token contract on{" "}
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
