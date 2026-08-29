"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CreateProposalForm } from "@/components/proposal/create-form";

export default function CreateProposalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Launch"
        title="Create a proposal"
        description="Describe the work, set a price per NFT, and name a funding goal. The club votes before anything goes on-chain."
      />
      <div className="mt-10">
        <CreateProposalForm />
      </div>
    </div>
  );
}
