"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { PageHeader } from "@/components/layout/page-header";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { OperatorReview } from "@/components/og/operator-review";
import { ProofUpload } from "@/components/og/proof-upload";
import { Badge } from "@/components/ui/badge";
import {
  activeChain,
  contracts,
  explorerAddress,
  isDeployed,
  STORAGE_INDEXER_URL,
} from "@/lib/chain/config";
import { useProposalState } from "@/lib/chain/hooks";
import { truncateAddress } from "@/lib/format";

const DEPLOYMENTS = [
  { label: "SprkClub Collab", address: contracts.collab },
  { label: "SprkClub Holder", address: contracts.holder },
] as const;

export default function MilestonesPage() {
  const { address } = useAccount();
  const [selected, setSelected] = useState<Address>(contracts.collab);
  const state = useProposalState(selected);

  const isCreator =
    Boolean(address) &&
    Boolean(state.creator) &&
    address!.toLowerCase() === state.creator!.toLowerCase();

  if (!isDeployed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          kicker="0G"
          title="Milestone proofs"
          description={`No contracts are deployed on ${activeChain.name} yet.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="0G integration"
        title="Milestone proofs"
        description="Proof files are hashed into a 0G Storage Merkle root, the root is recorded on 0G Chain, and an AgenticVerifier NFT holder validates the milestone."
        action={<ConnectWallet />}
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {DEPLOYMENTS.map((d) => (
          <button
            key={d.address}
            type="button"
            onClick={() => setSelected(d.address)}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
              (selected === d.address
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Network</dt>
              <dd className="mt-1">{activeChain.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Milestone</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {state.milestoneIndex ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">State</dt>
              <dd className="mt-1">
                {state.rejected ? (
                  <Badge variant="danger">Rejected</Badge>
                ) : state.paused ? (
                  <Badge variant="warn">Paused</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs text-muted-foreground">Contract</dt>
              <dd className="mt-1">
                <a
                  href={explorerAddress(selected)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs underline underline-offset-4"
                >
                  {truncateAddress(selected, 10)}
                  <ExternalLink className="size-3" />
                </a>
              </dd>
            </div>
          </dl>

          {isCreator ? (
            <ProofUpload
              proposalAddr={selected}
              milestoneIndex={state.milestoneIndex ?? 0}
            />
          ) : (
            <p className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
              Only the proposal creator{" "}
              {state.creator ? (
                <span className="font-mono">{truncateAddress(state.creator)}</span>
              ) : null}{" "}
              can submit milestone proofs — <code>submitMileStoneProof</code> is
              gated by <code>onlyProposalCreator</code> on-chain.
            </p>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
          <OperatorReview proposalAddr={selected} />
          <div className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">0G modules in use</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li>
                <span className="text-foreground">Chain</span> — contracts on{" "}
                {activeChain.name} (id {activeChain.id})
              </li>
              <li>
                <span className="text-foreground">Storage</span> — proof files via{" "}
                <span className="break-all font-mono">{STORAGE_INDEXER_URL}</span>
              </li>
              <li>
                <span className="text-foreground">Agentic ID</span> — ERC-7857
                verifier NFT gating <code>validate()</code>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
