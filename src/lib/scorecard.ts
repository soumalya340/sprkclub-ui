import { z } from "zod";

/** Advisory rubric scorecard produced by 0G Compute (or honest fallback). */
export const ScorecardCriterionSchema = z.object({
  id: z.string(),
  label: z.string(),
  pass: z.boolean(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
});

export const ScorecardSchema = z.object({
  schemaVersion: z.literal(1),
  provider: z.enum(["0g-compute", "fallback"]),
  model: z.string(),
  overallScore: z.number().min(0).max(100),
  pass: z.boolean(),
  criteria: z.array(ScorecardCriterionSchema).min(1),
  risks: z.array(z.string()),
  summary: z.string(),
  evaluatedAt: z.string(),
});

export type Scorecard = z.infer<typeof ScorecardSchema>;
export type ScorecardCriterion = z.infer<typeof ScorecardCriterionSchema>;

export type EvaluateContext = {
  proposalTitle: string;
  proposalDescription: string;
  milestoneTitle?: string;
  milestoneAcceptance?: string;
  proofText: string;
  proofRootHash?: string;
  injectionFlags?: string[];
};
