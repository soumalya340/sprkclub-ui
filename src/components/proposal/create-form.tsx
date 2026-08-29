"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

const schema = z.object({
  title: z.string().min(3, "Give it a name").max(80),
  description: z.string().min(20, "Tell people what you are making").max(600),
  pricePerNft: z.number().positive("Must be above zero"),
  fundingGoal: z.number().positive("Must be above zero"),
  type: z.enum(["collab", "holder"]),
  validTill: z.string().min(1, "Pick a date"),
});

type Values = z.infer<typeof schema>;

function defaultValidTill(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

export function CreateProposalForm() {
  const router = useRouter();
  const address = useAddress();
  const createProposal = useSprkStore((s) => s.createProposal);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      pricePerNft: 25,
      fundingGoal: 4000,
      type: "collab",
      validTill: defaultValidTill(),
    },
  });

  const watch = form.watch();

  if (!address) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="font-display text-2xl tracking-tight">Connect to propose</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Proposals are tied to your wallet. Connect a demo wallet to draft one.
        </p>
        <div className="mt-6">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form
        className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:p-8"
        onSubmit={form.handleSubmit((values) => {
          if (values.fundingGoal < values.pricePerNft) {
            form.setError("fundingGoal", {
              message: "Goal should be at least one NFT",
            });
            return;
          }
          const id = createProposal(values);
          toast.success(`${values.title} has been created`);
          router.push(`/proposal/${id}`);
        })}
      >
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Harbor Protocol" {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What are you making, who is it for, and what does an NFT unlock?"
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="pricePerNft">Price per NFT</Label>
            <Input
              id="pricePerNft"
              type="number"
              min={1}
              step="1"
              {...form.register("pricePerNft", { valueAsNumber: true })}
            />
            {form.formState.errors.pricePerNft ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.pricePerNft.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fundingGoal">Funding goal</Label>
            <Input
              id="fundingGoal"
              type="number"
              min={1}
              step="1"
              {...form.register("fundingGoal", { valueAsNumber: true })}
            />
            {form.formState.errors.fundingGoal ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.fundingGoal.message}
              </p>
            ) : null}
          </div>
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Proposal type</legend>
          <RadioGroup
            value={watch.type}
            onValueChange={(v) => form.setValue("type", v as Values["type"])}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-secondary p-4 has-[[data-state=checked]]:border-primary">
              <RadioGroupItem value="collab" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Sprkclub Collab</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Creator withdraws after an operator validates a milestone.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-secondary p-4 has-[[data-state=checked]]:border-primary">
              <RadioGroupItem value="holder" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Sprkclub Holder</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  NFT holders share later yield from the work.
                </span>
              </span>
            </label>
          </RadioGroup>
        </fieldset>

        <div className="grid gap-2">
          <Label htmlFor="validTill">Valid till</Label>
          <Input id="validTill" type="date" {...form.register("validTill")} />
          {form.formState.errors.validTill ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.validTill.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="mt-2 self-start">
          Create proposal
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Preview
        </p>
        <h3 className="mt-3 font-display text-2xl leading-snug tracking-tight">
          {watch.title || "Untitled proposal"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {watch.description || "Your description will appear here as you write."}
        </p>
        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Price / NFT</dt>
            <dd className="font-mono tabular-nums">{watch.pricePerNft || 0} USDC</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Goal</dt>
            <dd className="font-mono tabular-nums">{watch.fundingGoal || 0} USDC</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{watch.type === "holder" ? "Holder" : "Collab"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Stake to launch</dt>
            <dd className="font-mono tabular-nums">
              {Math.round((Number(watch.fundingGoal) || 0) * 0.2)} USDC
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
