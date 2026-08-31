# sprkclub-ui Architecture

Target design for the Next.js app after the Wave design grill. Contract rules live in `sprkclub-smartcontract/Architecture.md`. This file is the source of truth for **UI, API routes, and 0G client wiring**.

**Submission claim:** 0G Chain + 0G Storage + 0G Compute. **Do not claim Agentic ID / ERC-7857.**

Companion: [`../sprkclub-smartcontract/Architecture.md`](../sprkclub-smartcontract/Architecture.md)

---

## 1. Product intent (UI)

The UI lets creators, backers, and watchdogs run optimistic milestone escrow:

1. Creator uploads a deliverable → server stores it on **0G Storage** and records the proof root on **0G Chain**.
2. Server runs **0G Compute** → structured rubric scorecard → Storage → `recordAuditRoot` on-chain (relayer).
3. UI shows the scorecard + dispute countdown (clock starts only after `auditRootHash`).
4. Anyone can **challenge** (approve 10 stable + bond tx). Ticket holders **vote**. Anyone can **finalize** when the window is clean.
5. AI never unlocks money. Humans dispute; tickets settle.

---

## 2. Today vs target

| Area | Today | Target |
| --- | --- | --- |
| Milestone unlock UX | Operator Approve/Reject via `validate()`, gated by `useIsVerifier()` / AgenticVerifier NFT | Remove operator review happy path. Show **Finalize**, **Challenge**, **Vote**, **Resolve** |
| 0G Compute | Not used (`README`: “0G Compute … not used”) | `og-compute.ts` + evaluate API; scorecard in UI |
| Audit trail | Proof root only | Proof root **+** `auditRootHash` + downloadable scorecard |
| Agentic ID messaging | README + milestone panel claim ERC-7857 gate | Strip claims; remove verifier gate UI |
| Dispute | DB/action stubs; no on-chain challenge UX | Full challenge / vote / finalize panels on Collab |
| Storage access | Server-only via `og-storage.ts` | **Keep** (browser must not call Storage SDK upload/download) |
| First tranche | Stake / mint / withdraw in crowdfund UI | **Unchanged** |

---

## 3. Out of scope (UI)

- Bonding-curve launch pages
- Holder-specific dispute parity (Collab campaigns first)
- Marketing AgenticVerifier / ERC-7857 as a pillar
- Letting the LLM auto-call `finalize` / move funds
- Browser-side 0G Storage uploads (SDK needs Node + server key)

---

## 4. End-to-end UI / API flow

```
Creator on proposal / milestones UI
        │
        ▼
POST /api/milestones/:proposalAddr/:index/proof
  • upload file → 0G Storage (og-storage.ts)
  • submitMileStoneProof(rootHash) via og-chain.ts
        │
        ▼
POST /api/milestones/:proposalAddr/:index/evaluate   (NEW)
  • download / load proof context from Storage (or metadata)
  • og-compute.ts → rubric JSON (0G Compute, else honest fallback)
  • upload scorecard JSON → 0G Storage
  • recordAuditRoot(index, auditRootHash) via og-chain.ts (relayer)
        │
        ▼
Milestone panel shows:
  • proof root + link
  • scorecard (criteria, score, risks)
  • badge: "0G Compute" | "Fallback Mode"
  • countdown until windowEnd (7d from auditRecordedAt)
        │
        ├── [Finalize] wallet tx finalizeMilestone()     // if window elapsed, no challenge
        ├── [Challenge] approve 10 stable + challenge()   // anyone
        └── if Challenged:
              [Vote Support Alice | Support Bob]         // ticket holders
              [Resolve] after voteEnd                    // applies slash/bond on-chain
```

---

## 5. Module map (target)

### Server libs

| Path | Role |
| --- | --- |
| `src/lib/server/og-storage.ts` | Upload / download via `@0glabs/0g-ts-sdk` Indexer; may return `degraded: true` |
| `src/lib/server/og-chain.ts` | Relayer signer: `submitMileStoneProof`, **`recordAuditRoot`** (new) |
| `src/lib/server/og-compute.ts` | **NEW** — chat/completions against 0G Compute Serving Router; structured rubric prompt; fallback path |

### API routes

| Route | Role |
| --- | --- |
| `POST /api/milestones/[proposalAddr]/[index]/proof` | Existing — Storage + proof root |
| `GET /api/milestones/[proposalAddr]/[index]/proof` | Existing — status / roots |
| `POST /api/milestones/[proposalAddr]/[index]/evaluate` | **NEW** — Compute → scorecard Storage → `recordAuditRoot` |
| `GET /api/storage/[rootHash]` | Existing — fetch bytes by root (scorecard + proofs) |
| Proposal action routes | Drop `review-milestone` / operator validate; add challenge/vote/finalize helpers only if needed for indexing — **preferred: wallet txs from client** |

Wallet-signed dispute txs (`challenge`, `vote`, `finalizeMilestone`, `resolveChallenge`) should go through **wagmi** in the browser. Relayer is only for Storage + Compute + `recordAuditRoot` (and today’s proof submit helper).

### Components

| Path | Role |
| --- | --- |
| `src/components/milestone/milestone-panel.tsx` | Replace operator Approve/Reject with dispute machine UI |
| `src/components/milestone/scorecard-panel.tsx` | **NEW** — render rubric JSON + badge |
| `src/components/milestone/dispute-panel.tsx` | **NEW** — countdown, Challenge, Finalize, Vote, Resolve |
| `src/lib/chain/hooks.ts` | Remove / stop using `useIsVerifier` for unlock; add hooks for window status, audit root, challenge state, ticket balance |
| `src/lib/chain/abi/SprkClubCollab.ts` | Regenerate / extend ABI after contract changes |
| `src/lib/chain/abi/AgenticVerifier.ts` | Stop importing from happy path; optional delete later |
| `src/lib/chain/config.ts` | Point at redeployed Collab **without** AgenticVerifier; mainnet addresses when ready |

### Pages

| Route | Change |
| --- | --- |
| `/proposal/[id]` | Embed updated milestone + dispute panels |
| `/milestones` (if present / restored) | Same panels; demo path for Wave video |
| Launch / explore / dashboard | No bonding curve; crowdfund flow unchanged |

---

## 6. 0G Compute client (`og-compute.ts`)

**Job:** grade Alice’s deliverable against proposal acceptance criteria. Output is **advisory evidence**.

### Inputs

- Proposal title / description / milestone acceptance text (from DB + on-chain metadata as available)
- Proof file bytes or text extract from 0G Storage (or degraded metadata + creator notes)
- Rubric schema version string

### Output (scorecard JSON)

```json
{
  "schemaVersion": 1,
  "provider": "0g-compute" | "fallback",
  "model": "string",
  "overallScore": 0,
  "pass": false,
  "criteria": [
    { "id": "string", "label": "string", "pass": false, "score": 0, "evidence": "string" }
  ],
  "risks": ["string"],
  "summary": "string",
  "evaluatedAt": "ISO-8601"
}
```

### Fallback (mandatory)

If 0G Compute key missing, router error, or timeout:

1. Run documented fallback (e.g. alternate LLM or deterministic stub that still fills the schema).
2. Set `provider: "fallback"`.
3. **Still** upload scorecard to Storage and call `recordAuditRoot` so the dispute clock can start.
4. UI badge: **Fallback Mode** (never pretend TEE if fallback).

Never leave Alice stuck with proof submitted and no `auditRootHash`.

---

## 7. Relayer responsibilities

Server key (`OG_PRIVATE_KEY` / existing env):

| Step | Relayer? |
| --- | --- |
| 0G Storage upload (proof + scorecard) | Yes |
| `submitMileStoneProof` | Yes (today’s pattern) |
| `recordAuditRoot` | **Yes** |
| `challenge` / `vote` / `finalizeMilestone` / `resolveChallenge` | **No** — user wallet |
| Admin pause/unpause | AccessMaster admin wallet only |

Document the relayer address in README. Same honesty bar as current Storage + proof submit.

---

## 8. Milestone panel UX states

Drive UI from on-chain status (see contract Architecture §6):

| State | UI |
| --- | --- |
| No proof | Creator upload form |
| `ProofSubmitted` | “Scoring…” / button to trigger `evaluate` if not auto-started |
| `InDisputeWindow` | Scorecard + countdown + **Challenge** + **Finalize** (Finalize enabled only after `windowEnd`) |
| `Challenged` | Scorecard + vote tallies + **Vote** (if ticket holder) + time to `voteEnd` + **Resolve** when ended |
| `Finalized` | Cleared badge; creator can withdraw next tranche |
| `Rejected` | Bob won; claimback / refund messaging for backers |

### Badges

- `0G Compute` when `provider === "0g-compute"`
- `Fallback Mode` when fallback wrote the scorecard
- `Degraded Storage` when Storage upload returned `degraded: true` (existing honesty)

### Remove

- “Connect verifier NFT to approve”
- Approve / Reject calling `validate()`
- Copy that says Agentic ID unlocks escrow

---

## 9. Client chain hooks (target)

| Hook | Purpose |
| --- | --- |
| `useMilestoneProof(addr, index)` | Read `milestoneProofRoots` |
| `useAuditRoot(addr, index)` | Read `auditRootHash` + `auditRecordedAt` |
| `useDisputeState(addr, index)` | Window / challenge / vote ends, bonds, tallies |
| `useCollabTicketBalance(addr)` | Voting weight (1 NFT = 1 vote) |
| `useChallenge(addr, index)` | `approve` stable + `challenge` |
| `useVote(addr, index)` | `vote(supportAlice)` |
| `useFinalize(addr, index)` | `finalizeMilestone` |
| `useResolve(addr, index)` | `resolveChallenge` |
| ~~`useIsVerifier`~~ | **Remove from unlock path** |

---

## 10. Data / DB

Neon + Drizzle (`proposals`, `votes`, `backers`, `milestones`) remain the off-chain index for explore/dashboard.

Optional additions (non-normative):

- Store `proofRootHash`, `auditRootHash`, `scorecardRootHash`, `evaluateProvider` on `milestones` for fast UI
- Canonical truth stays **on-chain**; DB is cache / UX

Do not use DB “operator review” as a substitute for `finalize` / challenge.

---

## 11. Config & env

| Env | Purpose |
| --- | --- |
| `OG_PRIVATE_KEY` | Relayer for Storage + proof + `recordAuditRoot` |
| `OG_INDEXER_RPC` / existing indexer URLs | Storage |
| `OG_COMPUTE_*` / Serving Router URL + key | **NEW** — 0G Compute |
| Fallback LLM key (optional) | Honest fallback path |
| `OG_STRICT_STORAGE` | Existing — fail hard if Storage degrades |
| Wagmi / chain config | Galileo `16602` first; mainnet `16661` addresses when Collab redeployed |

Update `src/lib/chain/config.ts` after contracts drop AgenticVerifier from constructor.

---

## 12. README / submission copy (UI)

Must say:

1. **Modules used:** Chain (Collab escrow + dispute), Storage (proofs + scorecards), Compute (rubric auditor).
2. **Not used:** Agentic ID / ERC-7857 — removed from money path; optimistic human dispute instead.
3. **Compute is advisory** — scorecard helps challengers and voters; it does not call `finalize`.
4. **Fallback Mode** is labeled when 0G Compute is unavailable.
5. **Storage degraded** caveat remains until SDK/Flow selector is fixed.
6. Relayer key signs Storage + audit root only.

---

## 13. Implementation order (this package)

1. Add `og-compute.ts` + scorecard schema + fallback.
2. Add `POST .../evaluate` → Storage scorecard → `recordAuditRoot` (after contract ABI exists).
3. Extend Collab ABI + hooks for dispute machine.
4. Rebuild `milestone-panel` / add `scorecard-panel` + `dispute-panel`.
5. Remove AgenticVerifier gate UI + README claims.
6. Wire auto-evaluate after successful proof POST (or explicit “Run AI audit” that always records a root).
7. Demo path: proof → scorecard → countdown → finalize **or** challenge → vote → resolve.
8. Mainnet addresses + explorer links when contracts redeploy.

---

## 14. Decision log (UI-relevant)

| ID | UI implication |
| --- | --- |
| Q1 | No bonding-curve pages |
| Q5 / Q18 / Q30 | No Agentic ID claim; strip verifier UX |
| Q6 / Q12 | Structured scorecard on submit / evaluate |
| Q10 / Q19 / Q32 | Finalize vs challenge-blocks-finalize vs immediate clear on Alice win |
| Q11 / Q22 / Q31 | Challenge CTA: anyone, bond **10** stable |
| Q14 / Q26 | Vote UI: 1 ticket = 1 vote, 3-day clock |
| Q21 / Q24 / Q25 / Q28 | Show audit root; relayer writes it; clock UI tied to audit time; fallback still writes root |
| Q27 | No `validate()` buttons |
| Q29 | No general-user admin pause UI required |
| Q33 | First withdraw UX unchanged |

---

## 15. One-sentence summary

**sprkclub-ui becomes the optimistic escrow front-end: server-side 0G Storage + Compute produce a public scorecard and audit root; the wallet UI runs challenge, ticket votes, and finalize — with no AgenticVerifier middle party.**
