"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { CoverUpload } from "@/components/proposal/cover-upload";
import { normalizeHandle, typeLabel } from "@/lib/format";
import type { ProposalType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT = "#1A1814";
const DRAFT_KEY = "sprkclub:proposal-draft";

const campaignTypes: {
  value: ProposalType;
  label: string;
  hint: string;
}[] = [
  {
    value: "event",
    label: "Event",
    hint: "A gathering, residency, or time-bound experience.",
  },
  {
    value: "project",
    label: "Project",
    hint: "Ongoing work with a clear delivery goal.",
  },
  {
    value: "creative-work",
    label: "Creative Work",
    hint: "A zine, film, drop, or other finished piece.",
  },
];

const optionalHandle = z
  .string()
  .max(60)
  .refine(
    (v) => {
      const handle = normalizeHandle(v);
      return !handle || /^[A-Za-z0-9._]{1,30}$/.test(handle);
    },
    { message: "Use a handle like @name" },
  );

const schema = z.object({
  title: z.string().min(3, "Give it a name").max(80),
  description: z.string().min(20, "Tell people what you are making").max(600),
  pricePerNft: z.number().positive("Must be above zero"),
  fundingGoal: z.number().positive("Must be above zero"),
  validTill: z.string().min(1, "Pick a date"),
  type: z.enum(["event", "project", "creative-work"]),
  projectTwitter: optionalHandle,
  creatorTwitter: optionalHandle,
  projectInstagram: optionalHandle,
  creatorInstagram: optionalHandle,
});

type Values = z.infer<typeof schema>;

function defaultValidTill(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

function chipStyles(active: boolean) {
  if (active) {
    return {
      background: ACCENT,
      color: "#FAF5EF",
      borderColor: ACCENT,
      dot: "#FAF5EF",
      ring: "rgba(250,245,239,.25)",
    };
  }
  return {
    background: "#F1EDE1",
    color: "#1A1814",
    borderColor: "rgba(26,24,20,.10)",
    dot: "transparent",
    ring: "rgba(26,24,20,.22)",
  };
}

function SocialInput({
  label,
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center rounded-[10px] border border-[rgba(26,24,20,0.10)] bg-[#F1EDE1] px-3.5 transition-[border-color] focus-within:border-[#1A1814]",
        )}
      >
        <span className="w-16 shrink-0 font-mono text-[13px] text-[#B6AF9E]">
          {label}
        </span>
        <input
          {...props}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent py-[13px] text-[15px] text-[#1A1814] outline-none placeholder:text-[#A9A294]"
        />
      </div>
      {error ? <p className="text-sm text-[#8c3a2e]">{error}</p> : null}
    </div>
  );
}

function FieldInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[10px] border border-[rgba(26,24,20,0.10)] bg-[#F1EDE1] px-[15px] py-[13px] text-[15px] text-[#1A1814] outline-none transition-[border-color,background-color] placeholder:text-[#A9A294] focus:border-[#1A1814] focus:bg-[#FFFDF8]",
        className,
      )}
    />
  );
}

export function CreateProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const address = useAddress();
  const createProposal = useSprkStore((s) => s.createProposal);
  const [cover, setCover] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: searchParams.get("description") ?? "",
      pricePerNft: 25,
      fundingGoal: 4000,
      validTill: defaultValidTill(),
      type: "project",
      projectTwitter: "",
      creatorTwitter: "",
      projectInstagram: "",
      creatorInstagram: "",
    },
  });

  const watch = form.watch();
  const price = Number(watch.pricePerNft) || 0;
  const goal = Number(watch.fundingGoal) || 0;
  const editions = price > 0 ? Math.floor(goal / price) : 0;
  const stake = Math.round(goal * 0.2);

  const readyPct = useMemo(() => {
    const filled = [
      watch.title,
      watch.description,
      watch.pricePerNft,
      watch.fundingGoal,
      watch.validTill,
    ].filter((v) => String(v ?? "").trim().length > 0).length;
    return Math.round((filled / 5) * 100);
  }, [
    watch.title,
    watch.description,
    watch.pricePerNft,
    watch.fundingGoal,
    watch.validTill,
  ]);

  function saveDraft() {
    const draft = { ...form.getValues(), cover };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast.success("Draft saved on this device");
    } catch {
      toast.error("Could not save draft");
    }
  }

  async function onSubmit(values: Values) {
    if (values.fundingGoal < values.pricePerNft) {
      form.setError("fundingGoal", { message: "Goal should be at least one NFT" });
      return;
    }
    const handle = (raw: string) => normalizeHandle(raw) || undefined;
    setSubmitting(true);
    try {
      const id = await createProposal({
        title: values.title,
        description: values.description,
        pricePerNft: values.pricePerNft,
        fundingGoal: values.fundingGoal,
        validTill: values.validTill,
        type: values.type,
        cover: cover ?? undefined,
        projectTwitter: handle(values.projectTwitter),
        creatorTwitter: handle(values.creatorTwitter),
        projectInstagram: handle(values.projectInstagram),
        creatorInstagram: handle(values.creatorInstagram),
      });
      if (!id) return;
      localStorage.removeItem(DRAFT_KEY);
      toast.success(`${values.title} has been created`);
      router.push(`/proposal/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!address) {
    return (
      <div className="min-h-svh bg-[#FAF5EF] px-6 py-12 text-[#1A1814] sm:px-14 sm:py-12">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-[#6B6455] no-underline transition-colors hover:text-[#1A1814]"
          >
            ← Back
          </Link>
          <div className="max-w-xl rounded-[16px] border border-[rgba(26,24,20,0.09)] bg-[#FFFDF8] p-8 shadow-[0_1px_2px_rgba(26,24,20,0.05)]">
            <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#9A9384]">
              LAUNCH
            </p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[56px]">
              Create a proposal
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#6B6455]">
              Proposals are tied to your wallet. Connect to draft one for the club.
            </p>
            <div className="mt-6">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#FAF5EF] px-6 pb-24 pt-12 text-[#1A1814] sm:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-[22px]">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-[9px] text-sm text-[#6B6455] no-underline transition-colors hover:text-[#1A1814]"
          >
            ← Back
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-10">
            <div className="flex max-w-[620px] flex-col gap-2.5">
              <span className="font-mono text-[11px] font-medium leading-none tracking-[0.18em] text-[#9A9384]">
                LAUNCH
              </span>
              <h1 className="m-0 text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[56px]">
                Create a proposal
              </h1>
              <p className="m-0 mt-1.5 text-base leading-relaxed text-[#6B6455] text-pretty">
                Describe the work, set a price per NFT, and name a funding goal. The
                club votes before anything goes on-chain.
              </p>
            </div>
            <div className="flex min-w-[190px] flex-col gap-2">
              <div className="flex justify-between font-mono text-[11px] font-medium leading-none tracking-[0.12em] text-[#9A9384]">
                <span>READY</span>
                <span>{readyPct}%</span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-[2px] bg-[rgba(26,24,20,0.10)]">
                <div
                  className="h-full bg-[#1A1814] transition-[width] duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  style={{ width: `${readyPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-wrap items-start gap-x-14 gap-y-12"
        >
          {/* Main column */}
          <div className="flex min-w-0 flex-[1_1_460px] flex-col">
            {/* 01 Identity */}
            <section className="flex flex-wrap gap-x-7 gap-y-4 border-t border-[rgba(26,24,20,0.13)] py-[34px]">
              <div className="sticky top-8 flex w-[88px] shrink-0 flex-col gap-1">
                <span className="font-mono text-[11px] font-medium text-[#B6AF9E]">01</span>
                <span className="text-[13px] font-semibold tracking-[-0.01em]">Identity</span>
              </div>
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-[22px]">
                <div>
                  <CoverUpload value={cover} onChange={setCover} variant="banner" />
                  <p className="mt-2 text-xs text-[#9A9384]">
                    Optional — a stock cover is used if you skip.
                  </p>
                </div>
                <div className="flex flex-col gap-[18px]">
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="title" className="text-[13px] font-semibold tracking-[-0.005em]">
                      Title
                    </label>
                    <FieldInput
                      id="title"
                      placeholder="Harbor Protocol"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title ? (
                      <p className="text-sm text-[#8c3a2e]">
                        {form.formState.errors.title.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="description"
                        className="text-[13px] font-semibold tracking-[-0.005em]"
                      >
                        Description
                      </label>
                      <span className="font-mono text-[11px] text-[#B6AF9E]">
                        {(watch.description ?? "").length} / 600
                      </span>
                    </div>
                    <textarea
                      id="description"
                      rows={5}
                      placeholder="What are you making, who is it for, and what does an NFT unlock?"
                      {...form.register("description")}
                      className="w-full resize-y rounded-[10px] border border-[rgba(26,24,20,0.10)] bg-[#F1EDE1] px-[15px] py-[13px] text-[15px] leading-[1.55] text-[#1A1814] outline-none transition-[border-color,background-color] placeholder:text-[#A9A294] focus:border-[#1A1814] focus:bg-[#FFFDF8]"
                    />
                    {form.formState.errors.description ? (
                      <p className="text-sm text-[#8c3a2e]">
                        {form.formState.errors.description.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {/* 02 Framing */}
            <section className="flex flex-wrap gap-x-7 gap-y-4 border-t border-[rgba(26,24,20,0.13)] py-[34px]">
              <div className="sticky top-8 flex w-[88px] shrink-0 flex-col gap-1">
                <span className="font-mono text-[11px] font-medium text-[#B6AF9E]">02</span>
                <span className="text-[13px] font-semibold tracking-[-0.01em]">Framing</span>
              </div>
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-[26px]">
                <div className="flex flex-col gap-2.5">
                  <span className="text-[13px] font-semibold">Campaign type</span>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {campaignTypes.map((opt) => {
                      const active = watch.type === opt.value;
                      const styles = chipStyles(active);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => form.setValue("type", opt.value, { shouldDirty: true })}
                          className="flex flex-col gap-1.5 rounded-[12px] border px-[15px] pb-[15px] pt-3.5 text-left transition-all duration-150"
                          style={{
                            background: styles.background,
                            color: styles.color,
                            borderColor: styles.borderColor,
                          }}
                        >
                          <span className="flex items-center gap-[9px] text-sm font-semibold">
                            <span
                              className="size-[7px] rounded-full"
                              style={{
                                background: styles.dot,
                                boxShadow: `0 0 0 3px ${styles.ring}`,
                              }}
                            />
                            {opt.label}
                          </span>
                          <span className="text-[12.5px] leading-[1.45] opacity-[0.62]">
                            {opt.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="text-[13px] font-semibold">Social links</span>
                    <span className="text-xs text-[#9A9384]">
                      Optional — X and Instagram handles.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-x-3.5 gap-y-2.5 sm:grid-cols-2">
                    <SocialInput
                      label="X / proj"
                      placeholder="@projectname"
                      error={form.formState.errors.projectTwitter?.message}
                      {...form.register("projectTwitter")}
                    />
                    <SocialInput
                      label="X / you"
                      placeholder="@yourname"
                      error={form.formState.errors.creatorTwitter?.message}
                      {...form.register("creatorTwitter")}
                    />
                    <SocialInput
                      label="IG / proj"
                      placeholder="@projectname"
                      error={form.formState.errors.projectInstagram?.message}
                      {...form.register("projectInstagram")}
                    />
                    <SocialInput
                      label="IG / you"
                      placeholder="@yourname"
                      error={form.formState.errors.creatorInstagram?.message}
                      {...form.register("creatorInstagram")}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 03 Economics */}
            <section className="flex flex-wrap gap-x-7 gap-y-4 border-y border-[rgba(26,24,20,0.13)] py-[34px]">
              <div className="sticky top-8 flex w-[88px] shrink-0 flex-col gap-1">
                <span className="font-mono text-[11px] font-medium text-[#B6AF9E]">03</span>
                <span className="text-[13px] font-semibold tracking-[-0.01em]">Economics</span>
              </div>
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-[22px]">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="pricePerNft" className="text-[13px] font-semibold">
                      Price per NFT
                    </label>
                    <div className="flex items-center rounded-[10px] border border-[rgba(26,24,20,0.10)] bg-[#F1EDE1] px-3.5 transition-[border-color] focus-within:border-[#1A1814]">
                      <input
                        id="pricePerNft"
                        type="number"
                        min={1}
                        step="1"
                        inputMode="numeric"
                        {...form.register("pricePerNft", { valueAsNumber: true })}
                        className="min-w-0 flex-1 border-0 bg-transparent py-[13px] text-[15px] text-[#1A1814] outline-none"
                      />
                      <span className="font-mono text-xs font-medium text-[#9A9384]">SPRK</span>
                    </div>
                    {form.formState.errors.pricePerNft ? (
                      <p className="text-sm text-[#8c3a2e]">
                        {form.formState.errors.pricePerNft.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="fundingGoal" className="text-[13px] font-semibold">
                      Funding goal
                    </label>
                    <div className="flex items-center rounded-[10px] border border-[rgba(26,24,20,0.10)] bg-[#F1EDE1] px-3.5 transition-[border-color] focus-within:border-[#1A1814]">
                      <input
                        id="fundingGoal"
                        type="number"
                        min={1}
                        step="1"
                        inputMode="numeric"
                        {...form.register("fundingGoal", { valueAsNumber: true })}
                        className="min-w-0 flex-1 border-0 bg-transparent py-[13px] text-[15px] text-[#1A1814] outline-none"
                      />
                      <span className="font-mono text-xs font-medium text-[#9A9384]">SPRK</span>
                    </div>
                    {form.formState.errors.fundingGoal ? (
                      <p className="text-sm text-[#8c3a2e]">
                        {form.formState.errors.fundingGoal.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-[10px] bg-[rgba(26,24,20,0.045)] px-3.5 py-3 text-[13px] text-[#5E5849]">
                  <span className="font-mono text-xs font-medium text-[#1A1814]">
                    {editions.toLocaleString()}
                  </span>
                  <span>
                    editions sell out the goal · stake{" "}
                    <span className="font-semibold text-[#1A1814]">
                      {stake.toLocaleString()} SPRK
                    </span>{" "}
                    to launch
                  </span>
                </div>

                <div className="flex max-w-[280px] flex-col gap-[7px]">
                  <label htmlFor="validTill" className="text-[13px] font-semibold">
                    Valid till
                  </label>
                  <FieldInput
                    id="validTill"
                    type="date"
                    className="py-3"
                    {...form.register("validTill")}
                  />
                  {form.formState.errors.validTill ? (
                    <p className="text-sm text-[#8c3a2e]">
                      {form.formState.errors.validTill.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-[26px]">
              <span className="max-w-[340px] text-[13px] text-[#8A8375] text-pretty">
                Proposals stay editable until the club vote opens.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="rounded-full border border-[rgba(26,24,20,0.16)] bg-transparent px-5 py-3.5 text-[14.5px] font-medium text-[#1A1814] transition-colors hover:bg-[rgba(26,24,20,0.05)]"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2.5 rounded-full border-0 bg-[#1A1814] px-[26px] py-3.5 text-[14.5px] font-semibold text-[#FAF5EF] shadow-[0_1px_2px_rgba(26,24,20,0.2)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(26,24,20,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating…" : "Create proposal"}{" "}
                  <span className="opacity-55">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <aside className="sticky top-8 flex w-full max-w-[372px] flex-[1_1_320px] flex-col gap-3.5">
            <div className="overflow-hidden rounded-2xl border border-[rgba(26,24,20,0.09)] bg-[#FFFDF8] shadow-[0_1px_2px_rgba(26,24,20,0.05),0_12px_32px_-18px_rgba(26,24,20,0.35)]">
              <div
                className="relative flex h-[118px] items-end justify-between px-4 py-3"
                style={{
                  background: cover
                    ? undefined
                    : "linear-gradient(140deg,#EFE9DA,#E4DDCA)",
                }}
              >
                {cover ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  </>
                ) : null}
                <span
                  className={cn(
                    "relative font-mono text-[10px] font-medium tracking-[0.16em]",
                    cover ? "text-white/80" : "text-[#8A8375]",
                  )}
                >
                  PREVIEW
                </span>
                <span className="relative rounded-full bg-[#1A1814] px-2 py-1 font-mono text-[10px] font-medium tracking-[0.1em] text-[#FAF5EF]">
                  {typeLabel(watch.type).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-3.5 px-[18px] pb-5 pt-[18px]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xl font-semibold leading-[1.2] tracking-[-0.02em]">
                    {watch.title?.trim() || "Untitled proposal"}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-[#6B6455] text-pretty">
                    {watch.description?.trim() ||
                      "Your description will appear here as you write."}
                  </span>
                </div>
                <div className="flex flex-col gap-[9px] border-t border-[rgba(26,24,20,0.09)] pt-[13px]">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8A8375]">Price / NFT</span>
                    <span className="font-mono text-[13px] font-medium">
                      {price.toLocaleString()} SPRK
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8A8375]">Goal</span>
                    <span className="font-mono text-[13px] font-medium">
                      {goal.toLocaleString()} SPRK
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8A8375]">Editions</span>
                    <span className="font-mono text-[13px] font-medium">
                      {editions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8A8375]">Stake to launch</span>
                    <span className="font-mono text-[13px] font-medium">
                      {stake.toLocaleString()} SPRK
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="m-0 px-1 text-xs leading-relaxed text-[#9A9384] text-pretty">
              The preview is what voters see in the club feed.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
