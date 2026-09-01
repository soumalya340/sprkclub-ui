"use client";

import { Suspense } from "react";
import { CreateProposalForm } from "@/components/proposal/create-form";

export default function CreateProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-[#FAF5EF] px-6 py-12 sm:px-14" aria-busy="true">
          <div className="mx-auto h-40 max-w-[1180px] animate-pulse rounded-2xl bg-[rgba(26,24,20,0.06)]" />
        </div>
      }
    >
      <CreateProposalForm />
    </Suspense>
  );
}
