# 0G Bridge by AKINDO — Wave 3

- Source: [https://app.akindo.io/wave-hacks/Z4MlX4vreI72ol6pd?tab=products](https://app.akindo.io/wave-hacks/Z4MlX4vreI72ol6pd?tab=products)
- Wave ID: `36XWZdgBLtrRNnja`
- Wave hack ID: `Z4MlX4vreI72ol6pd`
- Started: 2026-08-13T00:35:00.000Z
- Submission deadline: 2026-09-01T15:00:00.000Z
- Judgement deadline: 2026-09-10T15:00:00.000Z
- Completed at: still open / not completed
- Grant amount field: 0.000000000000000000 USDC
- Grant distribution mode: point
- Submissions scraped: 40
- Summary meta totalPoint: 0
- Scraped at: 2026-08-29 11:42 UTC
- Tool: Scrapling `Fetcher` against `api.akindo.io/public`

## Fields per product

- **Name** — product name
- **Product intro** — tagline + truncated description
- **Points** — judged `totalPoint` for this wave (0 if not judged yet)
- **Money** — `earnedAmount` / `totalFixedAmount` as recorded by Akindo (often $0 until credits/USDC are distributed)
- **Updates in this Wave** — submission progress comment for this wave

---

## 1. 0g Provider Observatory

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** hms1499/0g-provider-observatory
- **Product page:** https://app.akindo.io/products/K8zKmv9MPUQRvprMD

### Product intro

An independent measurement layer for 0G's inference network, published on-chain with evidence.

What it does

**An independent measurement layer for 0G's inference network.**

Every clock hour, a prober sends a fixed 15-probe suite to each service on a pinned roster, times
every call by its own clock, and publishes three numbers per service: **p50/p95** response time,
**error rate**, and **divergence** — how often its answers differed from other providers of the
same model.

The summary goes to a **write-once ledger on 0G mainnet**; the full transcript — every prompt,
response and timing…

### Updates in this Wave

**First submission — all of it built in Wave 3**, from an empty repo on 2026-08-21 to a contract
on 0G mainnet and a public dashboard. 89 commits, no earlier wave to diff against.

| | |
|---|---|
| Dashboard | https://og-provider-observatory.vercel.app |
| Repo | https://github.com/hms1499/0g-provider-observatory |
| `MeasurementRegistry` | https://chainscan.0g.ai/address/0xF2fC195A72Ed74e09530b31C568c1e0CBF6c0333 |
| Epoch 496540 on chain | https://chainscan.0g.ai/tx/0xec8f6a1e456d3194b9476c7f8e04e3bfcb5f0c2750d19de6f0c8f7cb1e3676a1 |

0G Aristotle mainnet · chain 16661

**Shipped**

1. **Two reconciled sources of truth** — the Router's list against the on-chain registry;
   verification mode is derived, not taken from the `verifiability` field, which overstates it.
   38 provider/model pairs, 6 operators.
2. **A 15-probe suite** with per-call provider pinning, a token profile measured over 353 real
   calls, and a roster fitted to the budget *before* anything is sent, so no run is cut mid-suite.
3. **Contracts** (Foundry) — write-once: no update, no delete, no owner override, and every record
   must carry a `storageRoot`. Testnet first, then mainnet on 2026-08-24 for 0.0098 0G, read back
   from the chain, not estimated.
4. **Two live epochs** paid for with real credit, 10 services each. The provider pin held on all
   153 successful calls — the design's riskiest assumption, now measured.
5. **Evidence on 0G Storage** — the full transcript of every run, its merkle root in the chain
   record, fetchable through the public gateway with no wallet and no SDK.
6. **Independent verification** — `pnpm verify` and the Verify panel refetch, rehash and recompute
   every published figure, sharing no code with the prober on purpose. VERIFIED on both epochs.
7. **Cross-run reproducibility** — two epochs of one pinned roster compared from published
   evidence. Latency is a ratio and never scored; neither run is treated as correct.
8. **The dashboard** — no backend, no database; every figure read from chain and Storage in your
   browser, grouped by exact model string, nothing averaged across a group.
9. **Measuring from the page** with the reader's own key (~$0.003), replaying the probes recorded
   in a published epoch — the only check that doesn't depend on our evidence at all. It needs a
   relay, since 0G's Router answers a browser only from an allowlisted origin; that relay holds no
   key, never touches the chain, and logs nothing. 83 lines.

**Findings worth reporting back to 0G:** the Router's origin allowlist and header stripping,
measured rather than assumed; the mainnet RPC intermittently reverting correct reads; the official
skill pointing at deprecated SDKs.

**Honest status:** two epochs on chain — depth is bounded by wall-clock time, one per hour. Within
one epoch the noise floor resolves only to 0% or 100%, so divergence is withheld rather than
published as zero where it could not be measured. Both limits are stated on the dashboard.

---

## 2. 4lpha AI

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** kann420/4lpha-0G
- **Product page:** https://app.akindo.io/products/BeGgkkK4qIBwAOMO

### Product intro

Autonomous Trading/LP workspace where an AI agent can trade for you without ever being trusted.

**4lpha AI** is an autonomous Trading/LP workspace where an AI agent can trade for you without ever being trusted. The user deposits once into a 0G Policy Vault; the agent only gets a bounded executor key, and every decision it makes is fenced by on-chain policy, anchored to a proof registry, and backed by a redacted audit bundle on 0G Storage.

**Website**: https://0g.4lpha.tech/
**Github**: https://github.com/kann420/4lpha-0G
**X**: https://x.com/4lpha_agent

Everything runs on 0G Galileo…

### Updates in this Wave

- Completed V4 mainnet routing. Buy/sell now routes to the retained V4 Swap vault, while LP mint/increase/stake and LP exit actions route to separate bounded Entry and Exit vaults. The app/server resolver prefers V4.1 and safely falls back to V4. Wallet-owned V4 deployment and guided V1/V2/V3 -> V4 migration are implemented.
- Shipped and verified the V4.1 LP automation path on 0G mainnet. V4.1 reuses the verified V4 Swap vault and adds independently bounded LP Entry/Exit policies, protect, rebalance, fee collection, W0G unwrap, and measured-proceeds forwarding/reinvestment.
- Completed a real V4 -> V4.1 operator migration on mainnet: LP NFTs were unstaked, transferred, imported, and restaked, with a resumable state artifact reaching the verified phase.
- Moved trading and LP execution beyond sandbox liquidity. The agent now uses public Zia/Oku liquidity on 0G mainnet; the project-owned Galileo 0G/mUSDC pool remains clearly labeled as test rehearsal only.
- Ported the audit/consent pipeline to mainnet execution: action-specific wallet signatures, nonces and replay protection, redacted audit bundles on 0G Storage, and ProofRegistry anchoring for audit, policy, model, and vault-action hashes. Transaction and storage evidence is exposed in the product UI.
- Security-hardened the split vault architecture with deny-by-default typed adapters, immutable recipients/targets, spend and exposure caps, cooldown, nonzero min-out, deadlines, balance-delta checks, pause/revoke controls, separate Entry/Exit policies, TWAP/price-impact/liquidity rails, and crash-safe sequence journaling.
- Wired the canonical ERC-7857 Agentic ID contract into the 0G mainnet flow. Minting, intelligent-data hashing, usage authorization/revocation, and delegated access are live on-chain. iTransfer/iClone remain intentionally disabled in the server flow until a real TEE/ZKP verifier is available.
- Added RainbowKit wallet onboarding and updated public documentation with the verified V4.1 routing matrix, deployed contracts, limitations, and reproduction commands.

---

## 3. ActionProof

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** tang-vu/actionproof-0g
- **Product page:** https://app.akindo.io/products/Wj6GJnJPdC08D1wj

### Product intro

Verifiable runtime firewall that proves autonomous onchain actions are safe before execution.

What it does

ActionProof is a verifiable runtime firewall for autonomous onchain agents. It accepts an exact transaction envelope, inspects calldata, simulates the action, applies deterministic security policies, and uses 0G Compute for an additional risk assessment. The resulting canonical report is committed to 0G Storage and bound to an EIP-712 attestation anchored on 0G Chain. An allow decision can execute only through the non-upgradeable ActionProofGuard; review or blocked decisions never…

### Updates in this Wave

ActionProof evolved from a hackathon prototype into a working, publicly verifiable pre-execution security product for autonomous onchain agents.

### Product and security core

- Shipped an exact transaction-envelope pipeline that decodes calldata, checks nonce/deadline/identity, simulates from the guard, and applies deterministic policy before execution.
- Added structured inspection for ERC-20/721 approvals and transfers, ownership/admin changes, proxy upgrades, delegate calls, malformed calldata, and unknown selectors. Deterministic hard blocks always override model output.
- Added tamper, expiry, replay, reentrancy, wrong-chain, wrong-target, wrong-value, and signature-binding defenses.
- Launched a public no-spend Instant Preflight API and transaction lab for arbitrary exact actions.

### Real 0G Galileo integration

- Deployed and source-verified ActionProofGuard, DemoCounter, DemoToken, and ReentrantTarget on 0G Galileo Testnet.
- Ran schema-validated risk assessment through 0G Compute and retained model/provider/request evidence.
- Uploaded canonical reports with the official 0G Storage SDK, verified returned roots, downloaded exact bytes, and independently recomputed the Merkle roots.
- Anchored EIP-712-bound verdicts on 0G Chain. A safe counter action executed once; an unlimited ERC-20 approval was deterministically blocked with no execution transaction; a one-byte calldata mutation failed action-hash and attestation checks.
- Registered ActionProof as official Galileo ERC-8004 agent 278 and bound owner, agent wallet, and registration URI evidence into the reports.

### Product-grade delivery

- Published a responsive console with guided Allow / Block / Break traces, seven fresh verification checks, and explicit read-only/testnet labeling.
- Added a typed TypeScript SDK, PostgreSQL lease queue, tenant API keys and quotas, transactional signed webhooks, remote KMS/HSM signer boundary, Prometheus metrics, policy packs, recovery runbook, threat model, and audit package.
- Validation passes strict TypeScript, 48 unit/integration tests, 31 Foundry tests including fuzzing, 12 Playwright journeys, builds, secret scan, and dependency audit.

Live product: https://actionproof.tangvu.dev
Demo video: https://youtu.be/nnSikbUxL4A
Source: https://github.com/tang-vu/actionproof-0g
Safe proof: https://actionproof.tangvu.dev/trace/ed065611-c0df-41eb-a4f0-83cad47de6cd
Blocked proof: https://actionproof.tangvu.dev/trace/eaebde96-8403-4f5c-8e7a-af4354c70890
0G Storage: https://storagescan-galileo.0g.ai/submission/146979 and https://storagescan-galileo.0g.ai/submission/146980

ActionProof remains experimental and unaudited. Public traffic is read-only; all demonstrated transactions use valueless Galileo testnet contracts. Mainnet broadcast remains deliberately disabled.

---

## 4. Aevum

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/3d4rDmE22sKLnV3p0

### Product intro

The memory layer for the 0G agent ecosystem — persistent, encrypted, verifiable AI agent memory.

ÆVUM // The Eternal Archive

**The memory layer for the 0G agent ecosystem.**

Aevum gives every AI agent on 0G persistent, encrypted, verifiable memory that survives across sessions, wallets, and ownership transfers.

What it does

- **Persistent AI memory** — AES-256-GCM encrypted, stored on 0G Storage
- **On-chain agent identity** — ERC-7857 Agentic IDs with transfer & clone
- **Verifiable inference** — every AI response includes TEE-attested proof
- **Multi-agent pipeline** — Memory →…

### Updates in this Wave

For **Wave 3**, the project transitions from the core smart contract layer (which is now standards-verifiable ERC-7857 and deployed to 0G Galileo Testnet) to building the **Off-Chain AI Agent Memory Pipeline** and **0G Storage Integration**.

Wave 3 shipped an end-to-end product on the real 0G stack (Chain + Storage + Compute + ERC-7857) and then, responding to Wave 2 judge feedback ("the Agentic ID isn't a real ERC-7857" + "ship new deployments"), refactored the Agentic ID into a standards-verifiable ERC-7857 implementation composed from the canonical 0G contracts.

## ERC-7857 Canonical Compliance

Vendored 0gfoundation/0g-agentic-id (MIT); AevumAgenticID now inherits ERC7857IDataStorageUpgradeable + ERC7857AuthorizeUpgradeable + ERC7857CloneableUpgradeable + OwnableUpgradeable (C3 MRO mirrors canonical AgenticID.sol, minus ERC-8004 custody which is Wave 4).

- supportsInterface(type(IERC7857).interfaceId) returns true against the real canonical ID — plus IERC7857Updatable, IERC7857Authorize, IERC7857Cloneable, IERC721, IERC165. Verified on-chain via cast
- Plain transferFrom/safeTransferFrom revert with ERC7857UseITransferFrom; transfers go through iTransferFrom/iCloneFrom with TransferValidityProof[] validated by an on-chain TEEDataVerifier
- register(...) mints the ERC-721, creates the AevumRegistry agent, binds IntelligentData[] + sealedKeys[], emits ITransferred(0x0, to, tokenId, entries)
- Authorization is the canonical allowlist (no bitmap); auto-clears on transfer via inherited _update
- Deployed behind ERC-1967 proxies (constructors call _disableInitializers); tests use the same pattern 1:1

## Live on 0G Galileo Testnet (chain 16602)

- AevumRegistry: 0x0Cc8644b633DED0bAE43b95b4e96f47c3fFf8901
- AevumMemory: 0xAe62c0dCf20e0961e3321e3B8F9A61049A856339
- TEEDataVerifier (proxy): 0x6964387692377F196c690AeCaf969507ff48E738
- AevumAgenticID (proxy): 0x7B3677Af0916Eb6Ad10C14d247366A018869F44E

Verify on explorer: supportsInterface(0x2afbede9) → true. OG_ORACLE is 0x0 until make set-oracle wires a TEE key (iTransferFrom reverts until then; register/authorizeUsage work now).

## Pipeline + 0G Storage + Frontend

- 3-agent pipeline (backend/src/agents/): MemoryAgent recalls + decrypts from 0G Storage; OrchestratorAgent runs 0G Compute TEE inference with proof envelope; PrivacyAgent redacts PII last
- 0G Storage: real @0glabs/0g-ts-sdk upload/download, AES-256-GCM, content-addressed, on-chain pointer via AevumRegistry.updateMemoryPointer
- Frontend v0.1: RainbowKit + wagmi, SIWE auth, Oracle chat with TEEProofBadge (✅/⚠️), AgentTransferPanel signing iTransferFrom/iCloneFrom/authorizeUsage via wagmi with on-device AccessProof + dev-oracle OwnershipProof

## Verification

- Foundry: 101/101 passing (via_ir=true) — Registry 42 + Memory 30 + refactored AgenticID 29 canonical-conformance cases
- Backend: tsc --noEmit clean; 36/36 Jest passing (7 suites, incl. real 0G Storage upload vs Galileo)
- Frontend: tsc --noEmit clean

---

## 5. Agentvault

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/27kXJq9v1fMK2AX2z

### Product intro

Give your AI agent a memory it can't lose — encrypted, portable, and owned by you.

What it does
AgentVault gives an AI agent a portable, wallet-owned identity and memory that isn't trapped inside one application or model. A user connects a wallet, signs in with SIWE, and registers a real ERC-8004 identity on the 0G Galileo testnet. From there they chat with an agent that retrieves relevant memories, sends only the necessary context to a 0G Compute Router model, and automatically extracts new facts worth remembering — preferences, projects, technical decisions. Everything is…

### Updates in this Wave

What we built this wave

We shipped a working end-to-end version of AgentVault on the 0G Galileo testnet:

Wallet-owned identity: SIWE authentication with an HTTP-only signed session, plus a real ERC-8004 registration transaction submitted from the browser to the official Galileo Identity Registry. The server verifies the receipt and binds the agent record to the signing address.
Encrypted memory vault: A deterministic vault-key derivation flow (signature-based, never costs gas) produces an AES-256-GCM key used to encrypt every message and memory, with the agent ID bound in as additional authenticated data so ciphertext can't be replayed across agents.
Chat with memory retrieval: Prompts are ranked against decrypted memories, sent to a configured 0G Compute Router model, and new preference/project facts are extracted and saved without blocking the reply.
Full memory management: search, filter, add, edit, delete, JSON import/export from the Memory screen, with every write producing a fresh encrypted snapshot.
Storage and on-chain verification: encrypted snapshots are pushed to 0G Storage Turbo; the Identity screen compares the latest storage root against the agentvault.memoryRoot ERC-8004 metadata field and can verify integrity on demand.
Root anchoring: an explicit "Anchor latest root" action writes the current snapshot root to the agent's on-chain metadata, without ever putting private memory content on-chain.
Production-readiness plumbing: a /api/health endpoint gating release on chain connectivity, registry availability, storage.backend === "og", compute configuration, and durable Postgres persistence, plus fail-closed storage behavior in production rather than silent fallback.

Live app: https://agentvault-one.vercel.app

---

## 6. AI Escrow

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/3dkBXrvNLuOWqa96

### Product intro

Trustless settlement for paid AI work

What it does
AI Escrow is a trust layer for paid AI work. A buyer creates a task with a title, desired outcome, explicit requirements, budget, and deadline, then locks a testnet ERC-20 into an on-chain escrow contract on 0G Galileo. An assigned agent runs the task — the app calls a serverless endpoint that requests a result and a 0–100 verification score from 0G Compute (falling back to an explicitly labelled local verifier if Compute isn't configured). The buyer reviews the result and score in…

### Updates in this Wave

What we built this wave

We shipped a working end-to-end AI Escrow flow on the 0G Galileo testnet — a trust layer for paid AI work where funds are locked before work starts and only released once the result is verified:

On-chain escrow contract deployed on 0G Galileo at 0x1670D38659452f6F7eb64c8536E8Bd9f9b555aF4, holding a test ERC-20 (eUSDC at 0x8CBc84E4eA37501B679ad701B7b2cfDf64d09472) with explicit task states (Draft → Funded → Accepted → In progress → Verifying → Paid/Retry/Refunded), a non-reentrant guard on all token-moving functions, and buyer-only controls for funding, agent assignment, release, retry, and refunds.
Full task lifecycle in the UI: task creation with title, desired outcome, requirements, budget, and deadline; wallet-based funding that switches to Galileo, approves the ERC-20, and locks it into escrow; agent assignment; and a task drawer showing requirements, verification result, score, transaction links, and retry/release/refund actions.
0G Compute integration via a Vercel serverless function (api/agent.mjs) that requests a result and a 0–100 verification score from the 0G Compute Router, with strict JSON validation and score clamping — and an explicitly labelled local verifier fallback so the demo still runs end-to-end when a funded testnet Compute key isn't available.
Deadline-aware refunds: expired, unreleased escrow can be reclaimed by the buyer automatically once the on-chain deadline passes.
Retry flow: a failing verification can be retried up to three times before the task must be resolved.
Deployment and verification tooling (scripts/deploy.mjs, scripts/verify-deploy.mjs, scripts/e2e-contract.mjs) to deploy contracts, confirm bytecode and token wiring, and exercise the live state machine end-to-end.
Security groundwork: no private keys or Compute credentials in the repo, public contract config kept separate from server-only Compute credentials, and result content kept off-chain with only hashes anchored on-chain.

Live app: https://ai-escrow-dusky.vercel.app/
Onchain escrow (0G Galileo Explorer): https://chainscan-galileo.0g.ai (contract 0x1670D38659452f6F7eb64c8536E8Bd9f9b555aF4)

---

## 7. ai-odds-maker

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** HushLuxe/ai-odds-maker
- **Product page:** https://app.akindo.io/products/8347W68G9FmxQGMR

### Product intro

AI-powered prediction markets with real-time odds generation on 0G infrastructure.

AI Odds Maker

AI-powered prediction markets with real-time odds generation on 0G infrastructure.

Overview

AI Odds Maker is a fully autonomous prediction market protocol that uses AI to generate and update odds in real-time. Built on 0G's modular infrastructure, it combines:

- **0G Chain** - Fast EVM-compatible L1 for market contracts and settlement
- **0G Compute** - Decentralized GPU network for AI odds generation
- **0G Storage** - Decentralized storage for market memory and audit…

### Updates in this Wave

# AI Odds Maker — Wave 3 Updates

AI-powered prediction markets on 0G: an autonomous agent generates + updates odds via 0G Compute (TEE-verified), settles on 0G Chain, writes audit trails to 0G Storage. Wave 2 judges flagged four gaps; Wave 3 closes all four with live proof on Galileo testnet (chain 16602).

**1. Real 0G Compute — LIVE (was Math.random() mock)**
Deleted `getMockResponse()`. Wired real `@0gfoundation/0g-compute-ts-sdk`: `createZGComputeNetworkBroker` → `ledger.depositFund(3 0G)` → `transferFund` (auto-acks TEE signer) → `getServiceMetadata` (returns `qwen/qwen2.5-omni-7b` at `compute-network-6.integratenetwork.work/v1/proxy`) → `fetch /chat/completions` → `processResponse` verifies the TEE signature via the `ZG-Res-Key` header. `npm run test:compute` ran 5 real inferences on Galileo, all TEE-verified; each call returns a `TeeProofEnvelope{chatId, verified, model}`. Ledger-fund tx: https://chainscan-galileo.0g.ai/tx/0xaa16d6cb0ce7ad2cd27965c8d7034e8dd9ef07eb6b13dc449c03975cc5e25eda

**2. Real 0G Storage — LIVE (was local temp dir)**
Replaced `simulateUpload()` (wrote to `agent/temp/`) with real `Indexer.upload(MemData)` + `downloadToBlob(proof=true)` from `@0gfoundation/0g-storage-ts-sdk`. `npm run test:storage` on Galileo: 4 real uploads + 3 Merkle-verified downloads. Real rootHashes `0xb1adca25…08f1`, `0xefe72c8b…5c42` (verifiable on https://storagescan.0g.ai).

**3. Live Galileo deployment (was missing)**
Four contracts deployed via `forge script` broadcast, deployer `0x6e73DEC7ac977F111bC4a6a67354998FB3184c4f`:
- MockUSDT `0xfF425c18b983A4A211890058b50F9c579ae711Bc`
- LiquidityPool `0x81DdE96A5d12711f23f842d9eB4738fc8AEf0034`
- OddsOracle `0x4f15817BF0A17688344CB3B670E67Fcb5164D04A`
- OddsMakerFactory `0x9c5a983Fa9C9cbF2CE862545337b05AF2514d017`

Explorer https://chainscan-galileo.0g.ai — oracle agent authorized, LP funded 50k USDT, marketMaker wired. Addresses in `contracts/deployments.json`.

**4. Test count aligned with reality (was inflated)**
85 Foundry tests, all green, doc count matches `forge test --summary` exactly: MarketContract(32) + OddsOracle(19) + OddsMakerFactory(20) + LiquidityPool(14).

**5. Agent settles on-chain (was stubbed)**
Replaced `"// For now, we just log"` with real `oracle.submitOdds()` + `oracle.resolveMarket()` on-chain txs. Audit-trail blob now captures the 0G Storage rootHash + on-chain settle tx hash + TEE proof envelope.

**6. Frontend TEE proof UI (new)**
Wired real wagmi v2 + RainbowKit wallet connection with the custom 0G Galileo viem chain (16602). New `TEEProofBadge` component renders ✅ "0G Compute TEE Verified" vs ⚠️ "Fallback" per odds update, reading the agent's attestation envelope. New `useOddsHistory` hook reads real on-chain `OddsOracle.getOddsHistory(market)` — the detail-view history tab reads live contract data instead of mock data.

---

## 8. BlockPilot

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/K8zeMKgqQtxo6kNB

### Product intro

Build it. Audit it. Document it. Test it. Ship it. All on 0G.

Why BlockPilot exists

Smart contract audits are slow, expensive, and out of reach for most solo builders and small teams. A single audit can take weeks and cost thousands of dollars — meanwhile bugs ship to mainnet and get exploited. BlockPilot fixes the incentive problem: instant, free, AI-powered security analysis, backed by a permanent on-chain record so anyone can verify a contract was actually checked.

What it does

- **AI Security Auditor** — paste code, get a full vulnerability…

### Updates in this Wave

Build the product fully

---

## 9. Brier

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/pemjapOMDiok7zLd

### Product intro

Agent-only prediction markets on 0G. The site shows everything and can execute nothing.

What it does

Brier is a binary prediction market where **only agents trade**. The website is an
observation deck: it renders every market, position and settlement receipt, and holds no
private key and no method that writes to the chain. Not a policy but the shape of the code —
a test fails if anybody adds a write path to the human pages.

Agents work through three published npm packages: `npm install @0g-brier/agent-kit
@0g-brier/protocol`. An agent reads a market's question from 0G Storage…

### Updates in this Wave

This Wave delivered Brier end to end: contracts live and verified on 0G Galileo, an SDK published to npm, and a full trade-to-settlement cycle run against the chain rather than simulated. Everything below can be clicked, installed, or re-run.

WHAT SHIPPED

Contracts, live on Galileo (16602). Fourteen deployed addresses, every one of them a clickable link to 0G's explorer, in the README: 
https://github.com/hevDev7/0g-brier#live-on-galileo-chain-16602 — the entry point is MarketFactory at https://chainscan-galileo.0g.ai/address/0xd6F9aE316ef729C6c79fbC8684a2b0e4B76D4133

Eleven source contracts, ~3,000 lines: DPM pricing, a curator-gated factory, commit–reveal settlement with slashing, and every economic parameter bounded at deployment.

All three 0G services, not one. Chain carries the contracts. Storage holds each market's question and each settlement receipt, addressed by Merkle root and re-verified on read. Compute runs TeeML inference for beliefs and settlement, and the provider address and attestation are carried into the receipt.

ERC-7857 Agentic ID, implemented rather than announced. The AgentRegistry token is a 0G Agentic ID with an on-chain data verifier that recomputes 0G Storage's own Merkle root in Solidity — so a token's dataHash is the file's address, and anyone can fetch those bytes and check it. The standard's private-data path needs a TEE oracle 0G has not published, so it reverts with a named error instead of returning isValid: true for something nothing can check.

ERC-8004. Brier identities link to the IdentityRegistry with ownership verified on both
sides, and resolver records are published to the ReputationRegistry — a settlement here is
readable by someone who has never heard of Brier.

SDK published to npm, three packages at 0.1.0:
https://www.npmjs.com/package/@0g-brier/agent-kit
https://www.npmjs.com/package/@0g-brier/protocol
https://www.npmjs.com/package/@0g-brier/zg-storage


PROVEN, NOT CLAIMED

A real committee settlement ran on Galileo: three resolvers, threshold two, commit–reveal, with the receipt anchored on chain and feedback landing in ERC-8004's registry. The no-show path was exercised too — a missed reveal window failed the market and slashed 5% from each resolver. A hundred-line agent using only the published packages traded a live market end to end, and its transcripts are printed in the docs.

910 tests pass: 331 Solidity (19 invariant), 398 frontend, 181 across the packages. The load-bearing ones are differential — the TypeScript DPM mirror against vectors generated by the Solidity library, and the Merkle root against 0G's reference implementation.

---

## 10. BudgetWise 0G

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** efekrbas/budgetwise
- **Product page:** https://app.akindo.io/products/gXm9jmePwtWmNV8D

### Product intro

AI-powered, decentralized budget tracking on 0G: fast, secure, verifiable.

Traditional budgeting apps are centralized, putting users' financial data at risk. Existing decentralized apps suffer from slow transaction times and expensive on-chain storage. 

**BudgetWise 0G** solves this by leveraging the 0G network for a seamless decentralized experience:
- **0G Chain (EVM):** Smart contracts track user budgets and aggregate total spending with near-instant finality.
- **0G Storage / DA:** Expense details are uploaded to 0G Storage. Only the lightweight Merkle Root…

### Updates in this Wave

In this wave, we evolved BudgetWise 0G from an initial concept into a fully functional decentralized application deployed on the 0G Galileo Testnet.

Key Deliverables & Updates:
1. Smart Contract Deployment: Deployed BudgetWise0G contract on 0G Galileo Testnet (Contract Address: 0xedE7332ad1459E462B0860d2FeA4c947c3eED55f, Chain ID: 16602).
2. 0G Decentralized Storage Integration: Implemented cryptographic Merkle root hash verification for every expense record, enabling transparent off-chain data availability with on-chain proofs.
3. 0G AI & Inference Advisor: Integrated AI financial advisory engine (Llama-3-70B architecture) to analyze spending patterns and provide actionable optimization tips.
4. Production Web App: Built and deployed a high-performance Next.js 15 app with real-time Web3 wallet integration, Bento KPI dashboard, interactive 3D telemetry, and responsive design.
5. ZK Audit & Architecture Visualizer: Added instant cryptographic JSON audit exports and an interactive 0G modular architecture inspector for end-users and node operators.

Live App URL: https://budgetwise-0g.vercel.app/
GitHub Repository: https://github.com/efekrbas/budgetwise
Contract Explorer: https://chainscan-galileo.0g.ai/address/0xedE7332ad1459E462B0860d2FeA4c947c3eED55f

---

## 11. ChainPilot AI

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** mnsr4u/konnex-popw-validator
- **Product page:** https://app.akindo.io/products/834d3GzoXFlkV8qP

### Product intro

AI-powered onchain copilot for discovering

What it doe## What it does

ChainPilot AI is an intelligent DeFi copilot that helps users discover yield opportunities, analyze protocols, track wallets, and execute onchain actions across multiple blockchains using natural language commands.

Users can ask things like:
- “Find the best stablecoin yield on Base”
- “Track smart money wallets buying AI tokens”
- “Bridge funds and stake automatically”
- “Summarize market sentiment for ETH”

The platform combines AI analytics, wallet intelligence…

### Updates in this Wave

a

---

## 12. Chamfer AI

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** ashishexee/chamfer-ai
- **Product page:** https://app.akindo.io/products/wKOxBJRDzh8xVjE88

### Product intro

AI-powered CAD on 0G — prompt to manufacturing files with decentralized compute & storage

What it does

Chamfer AI turns natural language into manufacturing-ready 3D models. Describe a part in plain English, get parametric STL/STEP/GLB files in under 15 seconds.

1. Analyze — LLM understands design intent from text or photos
2. Generate — Produces CadQuery Python code with adjustable parameters
3. Execute — Runs in a locked-down Docker sandbox (air-gapped, non-root)
4. Inspect — Validates geometry (volume, faces, edges, bounding box)
5. Deliver — Returns STL, STEP, GLB files with a…

### Updates in this Wave

will update

---

## 13. Conduit

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** Raakshass/agentpay
- **Product page:** https://app.akindo.io/products/vjmLRl9q9uZ7OP9wW

### Product intro

Permissionless state-channel micropayments enabling AI agents to pay for Web3 APIs in USDC.

The Problem: Software Can't Pay Software
AI agents operate at machine speed, yet they are walled off by human payment infrastructure. They can't hold credit cards, complete KYC, manage monthly subscriptions, or sit in checkout flows. Hardcoding API keys is a major security risk, and locking agents into free tiers severely limits their autonomy.

Executing an on-chain transaction for every API call introduces ~400ms latency, gas overhead, and confirmation waits into the hot path of…

### Updates in this Wave

Wave 3 Updates — Conduit

1. SDK v0.2.0 with On-Chain Channel Helpers (conduit-pay on npm)
Released conduit-pay v0.2.0, making the SDK fully self-sufficient. Agents no longer need to hand-build Anchor instructions. New features:
- openChannel(): Deposits USDC via the escrow program, derives PDA + vault, generates channel ID, returns everything ConduitSession.open needs
- claimRefund(): Crash-safety reclaim after timeout — trustless exit path
- deriveChannelPda() / generateChannelId() helper utilities
- DEFAULT_ESCROW_PROGRAM_ID constant for zero-config usage
- Discriminators are hardcoded (dependency-free), instruction data built with DataView for isomorphic compatibility
- @solana/web3.js + @solana/spl-token promoted from dev to real dependencies

npm: https://www.npmjs.com/package/conduit-pay

2. Production Deployment Pipeline
Deployed the full stack to production infrastructure:
- Gateway server deployed to Railway with pnpm monorepo build configuration (railway.json, nixpacks.toml)
- Web frontend deployed to Vercel (https://agentpay-rho.vercel.app/)
- Fixed native dependency compilation issues (Trezor wallet adapter's usb/tiny-secp256k1) for Vercel's build image by skipping node-gyp builds for browser-only deps
- Guarded RPC URL parsing so malformed NEXT_PUBLIC_RPC_URL can't crash builds

3. CI/CD Hardening
- Pinned Anchor CLI to v1.0.2 to match anchor-lang dependency, fixing version mismatch failures
- GitHub Actions workflow now builds and validates all packages on every push
- Filtered Railway builds to @conduit/gateway only, preventing cross-package native dep failures

4. Frontend Polish
- Added Framer Motion animations: Try-it API response fade/rise transitions via AnimatePresence
- Catalog header reveal animation on page load
- All animations respect prefers-reduced-motion for accessibility

5. Full SDK Documentation
- Rewrote SDK README with complete deposit→session→call→settle flow
- Added on-chain helpers API section documenting openChannel and claimRefund
- Updated dependency notes and quick-start examples

Live Links
- Frontend: https://agentpay-rho.vercel.app/
- GitHub: https://github.com/Raakshass/agentpay
- npm SDK: https://www.npmjs.com/package/conduit-pay
- Escrow Program (Solana Devnet): 8vH1iEpbwe31WGqSGd9a8qkKh7SCHW8MsaSULVsxskRw
- Registry Program (Solana Devnet): XGXadfKb7mru5wcr1yUZWSeBLVUY6NFDAriBUUMiLbk

---

## 14. Creditfi 

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/K8EvOJWv0fpG8aDZ

### Product intro

The first AI-powered, reputation-based credit protocol for the autonomous agent economy.

CreditFi is a decentralized, reputation-based lending protocol built natively on the 0G Ecosystem. It allows autonomous AI agents and users to deposit collateral, receive an AI-computed credit score (ranging from 300 to 850), and borrow tokens instantly against their reputation.

Instead of treating every wallet equally, CreditFi rewards good financial behavior. As agents repay loans on time, their credit score increases. A higher credit score dynamically unlocks higher Loan-to-Value (LTV)…

### Updates in this Wave

updating

---

## 15. Crucible

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** Professional50coder/crucible
- **Product page:** https://app.akindo.io/products/jamR6oaxzSMP6o1K

### Product intro

Crucible: one upload, verifiable model identity, on-chain.

What it does

Crucible gives every model fine-tuned on 0G a **birth certificate**.

You upload a dataset. Crucible validates it, converts it, prices the run, submits it to a 0G
Compute fine-tuning provider, watches the task through every state, retrieves the adapter from 0G
Storage, and acknowledges it on-chain before the 48-hour deadline that would otherwise cost you
the model and 30% of the fee.

Then it does the part nobody else does. It takes the four facts that answer *where did this…

### Updates in this Wave

What it is: One upload replaces 0G's 12-step CLI. Base model + dataset root + hyperparameters + TEE provider → canonical manifest → keccak256 → 0G Chain → ERC-7857-style Agentic ID. Verifiable with no wallet.

Core improvements: @crucible/core (147 tests, no key) validates exact 5-key training config, detects 3 dataset formats + mixed-format by line, round-trip converter (instruction↔chat byte-exact, refuses lossy text→*), fee estimator from live pricePerToken (reproduces 0G example), canonical JSON (recursive sort, no whitespace) + keccak. 48h deadline automated (+1h ack, +36h fallback). Locked-queue bug (May 2026) made unreachable - only acknowledgeModel, plus POST /jobs/:id/unlock.

0G integration: Compute - createZGComputeNetworkReadOnlyBroker (no wallet) + createTask/getTask/getLog/acknowledgeModel via 0g-compute-ts-sdk 0.9.0 against provider 0xA02b…1E31A09 (H200 TDX, signer 0x241… acknowledged). Storage - dataset 0xa5051ae7…9e7dbfd tx 0xc38e41… + manifest 0xc757a7e6…e1140 584B tx 0x8372e7… are the anchored bytes (hash of file = anchored value). Chain - Passport.sol 0x27087B5bD124f2a570eb22B6B5bbe05F5d83C1c7 Galileo 16602 source-verified v0.8.19/paris/200 (78,649 chars) block 49596815 gas 2,238,586; #1 0xb608a8… block 49597171, #2 0x60094f… block 49612106 (real adapter 93,642,469B); verifyManifest view returns true/tampered false. Mainnet 16661: NOT deployed - measured cost 0.008954+0.001311=0.010265 0G at 4 gwei, rehearsed to funding check (balance 0). Agentic ID - Passport.sol ERC-7857-style (authorizeUsage/revoke 100 cap, cleared on transfer, verifyManifest) 70 tests + also minted into 0G official registry 0x2700F6… as token 138 tx 0x6e38a4… - getIntelligentDatas(138)=0x0f46406e… verifies on our contract.

Agent workflow: Model Passport manifest (versioned, TEE attestationVerified:false honest), explicit state machine Init→...→Delivered→UserAcknowledged→Finished, queued for occupied provider, decryption only at Finished.

Developer: crucible doctor (no key), orchestrator (174 tests, job store/poller/SSE/daemon + unlock), web (310 tests, /new /jobs /passport /gallery) live at crucible-orpin.vercel.app (200 logged out, passport 1 SSR). Daemon proven 2026-08-16: b1807e85… delivered 08:53:57Z → 93,642,471B → ack tx 0x4e2c81… block 49716408. Verification: GET file?root=0xc757… → keccak → verifyManifest. FIELD_NOTES.md + ARCHITECTURE.md + 808 tests. Next: mainnet deploy + mint.

---

## 16. DataForge

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/q3mjWAOPpCgxwLx

### Product intro

DataForge is a decentralized data-bounty and provenance workspace on the 0G Galileo

What it does

**DataForge is a decentralized data-bounty and provenance workspace built on the 0G Galileo testnet.**

Requesters can create bounties for specific datasets, including images, audio, text, JSON, and CSV files. Contributors can find open bounties, upload matching data through their connected EVM wallet, and receive a verifiable 0G Storage root and transaction receipt.

DataForge also provides a **Proof Inspector** that lets users independently verify each contribution through…

### Updates in this Wave

## Updates in this Wave

This wave represents a major upgrade of DataForge from a frontend concept into a working, verifiable 0G Galileo testnet application.

The biggest update is the implementation of **real 0G Storage uploads**. Contributors can now connect an injected EVM wallet, switch to the 0G Galileo network, select a bounty, upload a compatible file, and complete a real wallet-signed upload through the official 0G Storage TypeScript SDK and 0G Turbo. The application only records a contribution after 0G returns both a real Merkle storage root and transaction hash.

We also implemented a complete **Proof Inspector**. Each stored contribution exposes its 0G Storage root, Galileo transaction hash, local SHA-256 fingerprint, filename, timestamp, and verification checks. Users can copy the storage root and independently inspect the transaction through ChainScan and the stored data through StorageScan.

DataForge now has **shared on-chain marketplace state** through a deployed DataForge escrow contract on Galileo. Bounties and submissions are no longer just local UI state. The contract supports bounty funding, contributor submissions, requester review, automatic settlement for accepted submissions, duplicate protection, disputes, expiry refunds, and administrative pause controls.

Another major update is the **escrow and payment flow**. Requesters fund the exact reward pool when publishing a bounty, and accepted contributions can trigger automatic Galileo settlement to the contributor. This gives the bounty marketplace a real economic layer instead of simulating rewards in the interface.

We also added **server-side data validation through 0G Compute** for supported text and structured files. Validation produces an explainable report and signed attestation that can be associated with the contribution. For binary media where reliable semantic validation is not currently available, DataForge deliberately fails closed rather than inventing a quality score.

The contributor workflow now includes a **25 MB file-size limit, bounty-specific file-type validation, and browser-side SHA-256 duplicate detection** before an upload transaction is initiated.

We added **dataset manifests** that can be exported as JSON. Each manifest contains collection metadata and the real provenance information for individual contributions, including their storage roots and transaction hashes.

The application also now includes live **Galileo RPC health monitoring**, wallet account/network change handling, responsive navigation, accessible loading/error/success states, reduced-motion support, keyboard focus states, and Escape-key modal handling.


**Live deliverable:**
https://dataforge-0g.vercel.app

**DataForge escrow contract:**
https://chainscan-galileo.0g.ai/address/0x6a440691ee49785BD9863F1232b0F054c94B8167

---

## 17. DEMON.OG

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** ty45-cyber/OG-DEMON
- **Product page:** https://app.akindo.io/products/q3mEALJQRujpGm3NL

### Product intro

Reversing Web3 Market Entropy with Verifiable 0G Intelligence.

Demon.0G filters market noise by calculating Shannon Entropy and Kelly Criterion position sizing in 0G Compute TEEs. High-conviction trades execute on 0G Chain, logging Merkle state proofs to 0G Storage while tokenizing agent ownership via ERC-7857.
Replaces noisy, copyable trading bots with verifiable, privacy-preserving AI agents that protect execution IP on-chain.
Configuring cross-origin communication between Next.js on Vercel and Python FastAPI on Railway, alongside aligning strict…

### Updates in this Wave

Key Technical Updates Completed
Direct 0G Galileo Testnet RPC Integration:

Wired up real-time Web3 polling directly to the 0G Galileo Testnet RPC ([https://evmrpc-testnet.0g.ai](https://evmrpc-testnet.0g.ai), Chain ID 16602 / 0x40da).

Added automated 10-second telemetry polling for live 0G block heights (eth_blockNumber) and network gas prices (eth_gasPrice).

Embedded native Web3 wallet connection logic via window.ethereum with automated prompt support to add/switch users directly to 0G Galileo Testnet.

End-to-End Market Tick & Inference Pipeline:

Integrated Next.js dashboard with the Python FastAPI high-frequency intelligence engine deployed on Railway ([https://herna-production.up.railway.app/api/v1/trade/tick](https://herna-production.up.railway.app/api/v1/trade/tick)).

Built a dynamic market simulator in the frontend to stream real-time price fluctuations, bid-ask spreads, and volume metrics into the TEE inference pipeline on demand.

Implemented structured response rendering for execution statuses, trade signals, broadcast counts, and raw JSON verification telemetry.

Frontend Dashboard Architecture & Resilience:

Refactored client-side state handling to gracefully render execution pipeline outputs while preventing frontend crashes during missing payload fields.

Configured CORS and HTTPS endpoints between Vercel and Railway infrastructure.

Deliverable URLs
Live Frontend Dashboard: https://og-demon.vercel.app/

Live Railway Backend Endpoint: [https://herna-production.up.railway.app/api/v1/trade/tick](https://herna-production.up.railway.app/api/v1/trade/tick)

Target Network Explorer: [https://chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)

---

## 18. Enterprise AI Vault

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** build-labz/Enterprise-AI-Vault
- **Product page:** https://app.akindo.io/products/o6mML3dWEiXnjxr9

### Product intro

Self-hosted enterprise AI with encrypted decentralized storage and confidential LLM inference.

What it does

Lets users upload a text file, which gets chunked, encrypted, and stored on the 0G Storage Network. A semantic search layer indexes the chunks, and a chat interface answers questions about the file using the 0G AI Router — with every upload's index anchored on-chain for verifiability.

The problem it solves

Most RAG systems store documents and embeddings on a centralized server — a single point of failure with no way to verify what data backs an AI's answer. Enterprise AI Vault…

### Updates in this Wave

This Wave, we built and shipped the full Enterprise AI Vault stack end-to-end across three services:

- **Main service (Node.js/Express):** implemented the `/upload` endpoint, which splits an uploaded text file into ~4096-character chunks along sentence boundaries, ECIES-encrypts each chunk, and uploads it to the 0G Storage Network via the indexer SDK, collecting a Merkle root hash per chunk. The full chunk index is then uploaded to 0G Storage and its root hash is written on-chain. Also implemented `/chat`, which embeds the user's query, retrieves the matching chunk(s), and passes them to the 0G AI Router for a grounded response.
- **Vector search service (Python/Flask):** built out `/process_chunks` and `/search` endpoints using Sentence Transformers (`all-MiniLM-L6-v2`) for embeddings and FAISS for similarity search, with SQLite for chunk metadata.
- **On-chain anchoring:** wrote and deployed the `AddressStorage` smart contract to 0G mainnet, which records the root hash of every uploaded chunk index along with a timestamp — giving anyone a way to independently verify what was stored and when.
- **Frontend:** built and deployed a live web UI for chatting with stored content.
- **Documentation:** wrote a full README covering architecture, setup/reproduction steps, and 0G integration details for all three sub-projects.

**Deliverables:**
- Live demo: https://eav.buildlabz.xyz/
- Repo: https://github.com/build-labz/Enterprise-AI-Vault
- Youtube video: https://www.youtube.com/watch?v=VjNwtLM4NgU&t=1s
- X post: https://x.com/buildlabz/status/2091993829536571395
- On-chain proof (AddressStorage contract, 0G Mainnet): `0xbFF753fd372784945C937fAd511E2E529184f2E0` — https://chainscan.0g.ai/address/0xbff753fd372784945c937fad511e2e529184f2e0

---

## 19. FairMate

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** bunnyyxtan/fairmate
- **Product page:** https://app.akindo.io/products/nPmDvBMZOcao1Jex

### Product intro

Provably fair chess vs Qwen on 0G, TeeTLS receipts, every move onchain, stake 0.1, win 0.2 0G

What it does

FairMate is verifiable 5+0 blitz chess against qwen3.7-max with real money on 0G Aristotle Mainnet (chain ID 16661). You stake exactly 0.1 0G, a journal-recorded win pays 0.2 0G, draws and aborted games refund automatically. Every model reply is served through 0G Router with Verified TeeTLS, its receipt binds the request and response hashes, and every move plus its receipt commitment is anchored on chain in the MoveJournal contract.

The problem it solves

Playing an AI for money…

### Updates in this Wave

FairMate went from zero to live on 0G Aristotle Mainnet in this Wave

- MoveJournal and ChallengePot contracts deployed on mainnet, chain ID 16661
- Live 5+0 blitz games against qwen3.7-max through 0G Router with Verified TeeTLS, every reply signed, hashed, and committed on chain with the move
- Real-money prize rail: exact 0.1 0G stake verified on-chain at admission, journal-recorded wins pay 0.2 0G, draws and aborts refund automatically, proven with live mainnet transactions
- Offline verifier that recomputes the full game record from public chain data, 604 of 604 checks pass on the featured game including a live refund drill
- Public evidence bundles, threat model, and a real-footage demo of the complete user flow

Live product: https://fairmate-cyan.vercel.app
Demo video: https://youtu.be/4X0w6P5TfrA
Code and evidence: https://github.com/bunnyyxtan/fairmate

---

## 20. GhostKey

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/o6mjdpO9di3XlL1Z

### Product intro

"Let agents act. Keep the keys."

What it does
GhostKey is a non-custodial permission layer that lets a wallet owner grant autonomous agents narrow, time-bound authority to act on their behalf — without ever handing over a private key. The owner creates a policy specifying the agent's address, a target contract, the exact allowed function selector, per-transaction and total spend limits, a transaction-count cap, and an expiry. Policies are signed and written on-chain to a deployed GhostKeyManager contract on 0G Galileo. An…

### Updates in this Wave

What we built this wave

We shipped a testnet-ready MVP of GhostKey — a non-custodial permission layer for autonomous agents — fully deployed on 0G Galileo:

Non-custodial policy system: Wallet owners create narrow, time-bound policies directly from their own wallet signature. GhostKey never stores or touches a private key.
Deployed GhostKeyManager contract on 0G Galileo (chain ID 16602) at 0x7BB1F95ed2d2869A1cf5E40aA1E9462B2B20778E, enforcing policy checks entirely on-chain: approved agent address, exact 4-byte function selector, action bitmask, per-transaction cap, total spend cap, transaction count, expiry, and a reentrancy guard.
Policy creation flow: owner specifies agent address, target contract, allowed action (SWAP/TRANSFER), function signature, spend limits, transaction count, and expiry; the app derives the selector and requests a wallet signature to write the policy on-chain.
Agent Console: a simulation surface where the owner can test how a given action/amount would be evaluated against an active policy, without submitting a real transaction to the target contract.
Overview and Activity screens: active policies, remaining budget, recent checks, and a browser-session activity log exportable as CSV.
0G Compute integration: an optional "Interpret with 0G" feature that turns a plain-language request (e.g. "let my trading agent swap up to 10 USDC for 6 hours") into a structured policy draft via a signed, server-side API route — the owner still has to review and sign the actual policy themselves.
Deployment tooling: scripts for contract compile/deploy/verify that check chain ID, deployed bytecode, and manager readability, so a stale or misconfigured address can't silently pass as valid.
Full local dev and Vercel deployment docs, environment variable separation (public VITE_* vs. server-only OG_* values, so the Compute credential never reaches the browser).

Live app: https://ghostkey-chi.vercel.app
Onchain manager (0G Galileo Explorer): https://chainscan-galileo.0g.ai (contract 0x7BB1F95ed2d2869A1cf5E40aA1E9462B2B20778E)

What we want to improve in future waves

The current manager is intentionally generic — it enforces accounting limits but can't decode every protocol's specific calldata (exact recipient, token, slippage, deadline). Priority for the next wave is protocol-specific calldata adapters and a target/selector adapter registry so limits can be enforced against real transaction semantics, not just amounts. Alongside that: indexing PolicyCreated/PolicyRevoked/execution events into a durable backend (Activity is currently browser-session only), an independent Solidity audit before any real-fund usage, a multisig/guardian pause switch, WalletConnect and mobile-wallet support, and delegated session keys with scoped rotation.

---

## 21. Hanami

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** ajanaku1/hanami
- **Product page:** https://app.akindo.io/products/Z4Mzz2wVrUQo8rA1

### Product intro

AI bouncer for NFT whitelists — TEE-attested screening on 0G, Merkle root for any EVM mint.

What it does

Hanami is an AI bouncer for NFT whitelists. A project mints an ERC-7857 iNFT with a persona they wrote — voice, taste, screening criteria. Applicants connect a wallet and have a 3–6-turn conversation with the bouncer. It approves or rejects. Every verdict lands on 0G Chain carrying a TEE attestation hash anyone can recompute. At close, the owner exports a Merkle root for any EVM mint contract. All three 0G modules are load-bearing: Compute for sealed inference, Storage for…

### Updates in this Wave

I changed course this wave.
My declared plan was to fund the Direct broker, add multi-bouncer campaigns, automate the old adversarial script, and deploy BouncerRegistry v2. Once I reviewed the Wave 2 feedback and the live product, that felt like the wrong priority. Hanami already had verified contracts, TEE-backed applicant interviews, and Merkle export. The bigger gap was earlier in the flow: an owner could create a bouncer without proving that its exact private intelligence behaved safely.
So I built a Bouncer Safety Report and made it part of the product.
An owner now signs one gasless request tied to the exact persona and lorebook they intend to mint. Hanami runs eight fixed scenarios through 0G Compute. The report passes only when all eight decisions match the expected result, and every response has verified TEE evidence. A wrong decision fails the report. Provider, storage, network, or attestation problems interrupt it instead, so the owner can resume without repeating completed scenarios.
A passing report is stored on 0G Storage. It includes the content hash, scenario names, decisions, and TEE status, but leaves out the persona, lorebook, simulated replies, hidden instructions, transcripts, and reasoning.
The safety check is enforced by the backend. Hanami will not prepare or index a new campaign unless the report belongs to the owner and matches the exact content being minted. New campaigns begin private. The Admin page applies the same check before publication, while campaigns that were already public continue working as clearly labelled legacy campaigns.
I also rebuilt the interface around this flow. Create now explains the safety step before the three wallet transactions, shows all eight results, and keeps confirmed steps intact if a later transaction fails. Landing, Applicant, Admin, Gallery, and Mine received the same responsive shell, clearer loading and error states, keyboard support, reduced-motion handling, and mobile layouts.
The Direct broker funding, multi-bouncer routing, adversarial CI job, and Registry v2 were not shipped this wave. They remain on the roadmap. I chose to close the launch-safety gap first because it changed whether Hanami was ready for real owners, not simply how much infrastructure it had.

Wave 3 code: https://github.com/ajanaku1/hanami/commit/130905c
Live 8/8 report: https://hanami-backend-ugak.onrender.com/api/safety-runs/6f56d744-2fe8-4e87-8497-c8df8c5ca56d
Full Wave 3 evidence: https://github.com/ajanaku1/hanami/blob/main/docs/wave3-submission.md

---

## 22. INTENTOS

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/zKmDBVAaBCg9g9jL

### Product intro

The Intent Layer for Autonomous AI

What it does

The problem it solves

Challenges I ran into

Technologies I used

How we built it

What we learned

What's next for

### Updates in this Wave

IN PROGRESS

---

## 23. Kavro Protocol

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** karagozemin/Kavro-Protocol
- **Product page:** https://app.akindo.io/products/jaMq329vPHlPZkPp4

### Product intro

Confidential AI-powered private credit infrastructure built on the 0G stack.

What it does

Kavro Protocol is a private credit clearing network where issuer, investor, underwriter, auditor, and settlement agents coordinate confidential RWA funding rounds. Sensitive documents and AI reports remain private while verifiable commitments and settlement are recorded on-chain.

The problem it solves

Private credit and RWA financing still depend on emails, spreadsheets, and centralized data rooms. Public blockchains improve transparency but expose confidential deal terms…

### Updates in this Wave

During this wave, Kavro evolved from a private credit coordination prototype into a production-oriented protocol with real 0G integration and a complete end-to-end funding workflow.

### Core protocol improvements
- Expanded the deal lifecycle from room creation to funding, repayment, and settlement.
- Added dedicated smart contracts for Deal Rooms, Agent Registry, Agent ID prototype, and Identity Registry.
- Implemented confidential bid commitments and permissioned auditor disclosure.

### 0G integration
- Integrated the official 0G Storage SDK for encrypted deal metadata, AI reports, audit logs, and sealed bid memory.
- Connected 0G Compute for AI-powered underwriting, risk analysis, allocation recommendations, and investor guidance.
- Deployed contracts on 0G Mainnet and verified the complete workflow through the 0G Explorer.
- Added real on-chain proof generation with Storage references, transaction hashes, and explorer links.

### AI agent workflow
- Built an underwriting swarm composed of specialized AI agents for risk assessment, compliance review, allocation planning, and critical validation.
- Added persistent agent memory for confidential deal context stored on 0G Storage.
- Introduced an Agent ID-ready architecture for future composable agent identities.

### Developer & demo improvements
- Implemented a complete issuer → investor → auditor → settlement demo flow.
- Added a Proof-of-Credit Packet that bundles deal metadata, AI reports, storage references, and on-chain proofs into a single judge-facing artifact.
- Improved the developer SDK, documentation, deployment scripts, and mainnet proof tooling.

---

## 24. Kenneth Madu

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/mVmjXJr8Jfq9AmWZ

### Product intro

AI agents that investigate where commercial demand is forming.

What it does

The problem it solves

Businesses often have stock they need to move quickly, from electrical and HVAC equipment to shelving, packaging, and cold chain infrastructure. The problem is finding who will actually need that stock next.

Traditional search returns links. Lead databases return contacts. Neither answers the important commercial questions: **where is demand forming, why does it exist, when is the buying window, who is involved, and what evidence proves it?**

Prime Layer…

### Updates in this Wave

## Updates in this Wave

This is our first submission in the 4th Wave.

We are introducing Prime Layer, a B2B demand-intelligence network that investigates where commercial demand is forming.

For this wave, we have a working end-to-end application and a deployed multi-agent intelligence network. A central orchestrator converts a business question into demand hypotheses and coordinates 10 specialist agents across web research, company intelligence, project intelligence, procurement, social signals, people and roles, media, verification, synthesis, and Prime Signals.

The agents investigate in parallel and return structured claims with evidence and source information. Prime Layer then clusters duplicate sources, evaluates evidence and demand signals, and synthesizes the strongest opportunities into actionable commercial recommendations.

The system is integrated with the 0G ecosystem. We use 0G Compute for LLM-assisted grading, 0G Chain for payments and contributor settlement, 0G Storage for anchoring evidence and readouts, and ERC-7857 Agentic ID for agent identity.

The key idea behind Prime Layer is simple: businesses do not need another list of leads. They need to know where demand is forming, why it exists, when the buying window is, and what evidence proves it.

Live application:
https://primelayernowlive.vercel.app/app

GitHub:
https://github.com/Jr-kenny/prime-layer

---

## 25. KITSUNE

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** SIDDHUX9/Kitsune
- **Product page:** https://app.akindo.io/products/Pv7noKeB1fEPOjod

### Product intro

0G Verifiable Agent Shell

What it does

**Kitsune** is a decentralized marketplace and infrastructure layer for **tokenized, verifiable AI agents**. It uses **ERC-7857 Agentic IDs** to turn AI agents into transferable on-chain assets with dynamic state and encrypted metadata.

Kitsune combines multiple 0G primitives into a single agent economy:

- **ERC-7857** for agent identity, ownership, and tokenization
- **0G Compute** for decentralized AI inference
- **0G Storage** for encrypted agent memory, prompts, and…

### Updates in this Wave

Kitsune is a decentralized marketplace and verifiable infrastructure layer for autonomous AI agents, built on the 0G ecosystem.

The core idea is to move AI agents from being centralized software services into owned, transferable, auditable, and economically autonomous on-chain assets. Kitsune implements the ERC-7857 Agentic ID token standard to give each agent a persistent on-chain identity, ownership, encrypted metadata, and dynamic state commitments.

Kitsune combines five core primitives:

• ERC-7857 Agentic ID - Tokenizes AI agents as transferable on-chain assets with dynamic state and encrypted metadata.

• 0G Compute - Provides the inference layer where agent requests are executed by compute workers.
• 0G Storage - Stores encrypted prompts, agent memory, execution history, and state commitments, providing persistent and auditable agent state.
• 0G Chain - Provides the EVM settlement and ownership layer for Agentic IDs, marketplace transactions, and escrow logic.
• 0G Pay - Provides the payment and escrow layer required for autonomous agent-to-user and future agent-to-agent transactions.

A creator can mint an ERC-7857 Agentic ID and publish the agent through the Kitsune marketplace. The Agentic ID references the agent's encrypted metadata, compute configuration, and dynamic state commitment.

When an agent is used, inference is executed through 0G Compute. Relevant execution data and state are committed to 0G Storage, while worker attestations provide a cryptographic link between the execution and the infrastructure that performed it.

The complete lifecycle is:

Mint Agent → Own Agent → List Agent → Execute Inference → Generate Attestation → Archive State → Verify → Settle Payment

This allows an AI agent to behave more like a programmable economic entity rather than simply being an API endpoint.

The platform currently has the Agent Marketplace, ERC-7857 Agentic ID minting, a 0G Audit Trail, and a technical whitepaper.

##Kitsune is live on "0G Aristotle Mainnet🚀".

AgenticID (ERC-7857 Token Standard):
https://chainscan.0g.ai/address/0x9162F031180dB91427e7B3DB8C075a89D27aD1a5

AgentMarketplace:
https://chainscan.0g.ai/address/0x28630af41364909C18f18809a015afcA96343240

##Testnet deployments 🧪:

AgenticID (ERC-7857):
https://chainscan-galileo.0g.ai/address/0x91EcD796b55B815719117A8530e3bed138c89bCb

AgentMarketplace:
https://chainscan-galileo.0g.ai/address/0x9F98Ea2fF6Cf828F8963448C9570A2F2F7D20627

Kitsune brings identity, ownership, compute, storage, verification, and payments into one decentralized architecture. Unlike other AI platforms, it gives agents verifiable identities, transferable ownership, persistent state, auditable execution, decentralized inference, and native payments.

Our vision is an open economy where AI agents can be created, owned, verified, transferred, monetized, and autonomously transact with other agents without centralized intermediaries.

The live product is available at:
https://kitsune.siddhu.info

---

## 26. LabelDAO – Decentralized AI Data Infra

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** cosmasken/lbel-dao
- **Product page:** https://app.akindo.io/products/rgaKV7XAKi77ZnZRd

### Product intro

The on-chain annotation marketplace

Labelling DAO

Decentralized image labeling infrastructure. Data requesters create labeling tasks, human labelers submit bounding-box annotations via smart contracts. Built on 0G (Storage + Compute + Pay).

What it does

Labelling DAO is a decentralized marketplace connecting data requesters with human annotators. Requesters upload datasets, define task specs (accuracy, consensus, reward), and deploy them as on-chain tasks. Labelers browse open tasks, draw bounding boxes using our web…

### Updates in this Wave

All three items addressed in this wave:

**Payouts now transfer real value.** The rewritten `LabelingTask` contract escrows the
full budget at task creation (70% annotator / 10% protocol / 20% ops) and pushes rewards
to labelers on acceptance via `payable(labeler).call{value}`, with a `pendingRewards`
pull-withdraw fallback for receivers that reject transfers. Covered by a 34-test suite
(all passing), and live on 0G testnet with 4 funded tasks holding ~0.25 0G in escrow.

**Acceptance is consensus-driven, no longer requester-controlled.** Items auto-accept
on-chain once `minConsensus` identical submissions match; otherwise a dedicated
arbitrator role decides. Requesters can only dispute or delegate — they cannot accept
or reject.

**Dataset roots verified.** 4/5 roots resolve from 0G Storage (verified by download +
image-count check); the fifth dataset's (ShipShape) storage expired on the network, so
we dropped it from the manifest rather than ship a broken link — all live tasks now
point to verified, resolvable roots.
### Contract (0x918D2509b7Ed7a136E34a3175ea55c18c532bcF2, 0G testnet)

- Full rewrite deployed; on-chain bytecode verified identical to local artifact.
- Escrow on `createTask`: `itemCount * rewardPerItem` + protocol fee (1/7) + ops fee (2/7).
- Push payout on acceptance; `pendingRewards` + `withdrawAnnotatorReward()` pull fallback.
- Consensus: `submitLabel` auto-accepts when `minConsensus` identical `labelDataUri`
  hashes match; losers rejected without reputation penalty.
- Roles: `arbitrator` (owner-settable), per-task `delegateTaskArbitration`,
  requester limited to `disputeSubmission`.
- 34/34 hardhat tests passing.

---

## 27. Lumen

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** OoJae/lumen
- **Product page:** https://app.akindo.io/products/zKgEr2WoqsOjjoxRO

### Product intro

Own your mind. Prove your privacy — the AI journal no one can read, enforced in hardware on 0G.

Own your mind. Prove your privacy.

Lumen is a private AI journaling companion built on 0G. Every AI journal says
"your data is encrypted." Lumen is the one that hands you the evidence — and
tells you where the evidence runs out.

The problem

There is a thing you have not typed into any app. Not because you forgot —
because you read the privacy policy, and it asked you to trust them.

Journaling is the most private thing you can do with software, and the category
where "trust us" is least…

### Updates in this Wave

OWNERSHIP, ON MAINNET

- Contracts deployed and source-verified at
  `0x0FD618664FFAc86ef734C0C46eFF23bD73CBd738`, same address on Aristotle
  (16661) and Galileo (16602). Zero admin keys: no owner, pause, upgrade, mint
  fee, verifier setter.
- Anchoring is compare-and-swap. Each anchor names the root it replaced, so
  the history replays as a chain that cannot be reordered or forked. Both writes
  are owner-only.
- Real mainnet activity, on the 0G explorer. Token #2, anchors 2, root
  `0x5a9b3eb5…23d17cb1`; mint block 42,066,838, anchors 42,067,154 and
  42,721,782 — all listed at
  chainscan.0g.ai/address/0x0FD618664FFAc86ef734C0C46eFF23bD73CBd738

VERIFICATION

- Per-request cryptographic verification — the declared goal, by another
  route. I declared it as a consequence of the wallet-signed Direct SDK; it
  did not need it. The gateway became a verbatim byte pipe, and the browser
  hashes the exact bytes it received, recovers the signer from the enclave
  signature, and compares it to the TEE signer registered on-chain — for every
  visitor, no wallet.

ENCRYPTED MEMORY ON 0G STORAGE

- Sign-to-unlock. One wallet signature derives a non-extractable AES-GCM key
  in WebCrypto: memory-only, never transmitted, with a recovery key for export.
  Ciphertext is AAD-bound to type, key version, wallet and slot, so a replayed
  envelope fails GCM auth instead of decrypting into the wrong place.
- Ciphertext-only local store. Open DevTools on the journal — every entry and
  embedding is base64; what sits beside them is bookkeeping.
- Save to 0G, user-signed. The wallet pays and submits the Log-layer
  transaction itself; Lumen is not in the storage path. The receipt offers
  "Verify on 0G" and "Prove I own it" (fresh download, local decrypt), and its
  rootHash restores the journal on any device with the same wallet — the exact
  root anchored on-chain above.
- On-device recall. MiniLM in a Web Worker. 0G has no embeddings model — I
  verified that live and disclosed it — so text never leaves the device to be
  indexed. Voice via whisper-large-v3 (TeeML).

NOT SHIPPED, AND WHY

- Browser-direct inference — investigated and rejected, not deferred. It
  removes one party from the plaintext audience while handing the provider your
  wallet address and IP, and publishing two things permanently on-chain: an
  enumerable roster of Lumen's users, and a timestamped record of when and how
  much you journal. Bad trade for a journal, so the gateway stays in the
  plaintext path — and the app, docs and `/proof` say so.
- Transfer. I declared "export/transfer". The companion is soulbound — a
  compliant ERC-7857 transfer needs a TEE re-encryption oracle, and 0G's
  reference oracle is an inert EOA with no signing service.

924 web tests + 20 contract tests, in CI on every push.

demo url: https://lumen-snowy-two.vercel.app/
github: https://github.com/OoJae/lumen
Demo Video: https://youtu.be/42mPyJmx7x0
X post: https://x.com/_OoJae/status/2093128401984815422?s=20

---

## 28. Maneki AI

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** maraitona/ManekiAI-Terminal
- **Product page:** https://app.akindo.io/products/GLXEzBgl3HWJP1BP

### Product intro

Explainable, risk-bounded AI agents that autonomously trade stock perpetuals on Hyperliquid, 24/7.

What it does

Maneki AI is an autonomous, explainable multi-agent trading platform for stock perpetuals on Hyperliquid. Users choose a market, decision style, capital allocation, and leverage; dedicated AI agents then monitor the market and manage trades around the clock.

Each decision cycle combines price structure, volume and open interest, funding rates, and live account exposure. Every entry, adjustment, and exit is logged with its reasoning.

The problem it solves

Active perpetual…

### Updates in this Wave

Maneki has expanded its integration with the 0G ecosystem beyond AI model access.

In this Wave, we integrated 0G-powered AI inference into Maneki's Agent decision workflow and introduced an 0G-based Credits acquisition path, allowing users to participate in Maneki through the 0G ecosystem.

We are also launching an 0G Early Bird program to encourage early users to experience autonomous trading Agents. Users depositing $1 worth of tokens through the 0G route can receive $10 worth of Maneki Credits, while users depositing $10 or more can receive $50 worth of Credits. The benefit can only be claimed once per wallet.

Maneki will record early participation time, deposit activity, product interactions and trading activity as part of the user's early participation history. These records may be considered for potential future ecosystem incentives, without any guaranteed token or airdrop commitment.

---

## 29. Mneme

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** itachi-exe/Mneme
- **Product page:** https://app.akindo.io/products/X4Kj7l2O6FMQXRrrD

### Product intro

Shared memory protocol for AI agents. One discovery, every agent benefits.

What it does
Mneme is a Collective Agent Memory Protocol built on 0G. Agents join named memory pools, write memories with cryptographic provenance, search semantically across the swarm's entire knowledge base, and inherit verified snapshots from previous swarms. Every write settles on 0G Chain with a transaction hash. Every fact is attributable, verifiable, and permanent. Think Wikipedia for AI agents.

---

The problem it solves
Every AI agent session starts at zero. No shared context, no…

### Updates in this Wave

Contracts: MemoryPool and MemoryPoolFactory deployed to 0G Galileo testnet. On-chain pool registry, ACL, and write receipts via Foundry. Snapshot contract for cross-swarm inheritance with full provenance.

SDK: TypeScript and Python SDKs shipped. Four calls: join pool, write memory, recall by meaning, inherit snapshot. Agent keys minted by the operator, verified on-chain, no header spoofing.

API: Hosted node handling dual writes to 0G Storage (episodic log + working memory KV), semantic search with BM25 + optional 0G Compute reranking, and on-chain receipt settlement via viem.

Console: Next.js control plane at https://mnemeog.xyz/app — wallet connect, pool creation, agent key management, live memory feed with content hashes and tx hashes, semantic search with AI reranking.

Live demo: https://mnemeog.xyz
Demo video: submitted in gallery
GitHub: https://github.com/itachi-exe/Mneme

Five real agents running in the research-swarm pool with 16 real memories written to 0G Storage and settled on Galileo.

---

## 30. OASIS

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** sidweb3/oasis-0g
- **Product page:** https://app.akindo.io/products/83mVj83R7FlKNK8xw

### Product intro

VERIFIABLE AI YIELD VAULT

What it does

**Oasis** is a verifiable AI yield optimization vault built on **0G Chain**. It uses AI running through **0G Compute** to make yield allocation decisions, with each decision backed by a **TEE attestation** and logged to **0G Storage** for an auditable trail.

Users can deposit native **0G** into the NativeVault, receive vault shares, and have capital managed through the **RebalanceExecutor**. The AI strategy determines how capital should be allocated, while the executor handles…

### Updates in this Wave

Oasis is a verifiable AI-driven yield optimization vault built on 0G Chain (Aristotle, Chain ID 16661). It combines AI inference, TEE attestations, decentralized storage, and smart-contract-based vault infrastructure to make autonomous yield allocation more transparent and auditable.

The core idea is to replace opaque, off-chain yield decisions with a verifiable workflow: 0G Compute runs the AI strategy, the execution produces a TEE attestation, the decision and reasoning are stored on 0G Storage, and a cryptographic root is recorded on-chain.

How it works:
Users deposit native 0G into the NativeVault and receive ov0G receipt shares representing their vault position.
The RebalanceExecutor orchestrates the yield strategy and controls allocation to registered YieldAdapters.
An AI model running through 0G Compute analyzes the strategy conditions and produces an allocation decision.
The compute response includes an x-worker-signature TEE attestation, providing cryptographic evidence of the execution environment.
The decision and reasoning are uploaded to 0G Storage, producing a 32-byte Merkle root.
The root is recorded on-chain, connecting the AI decision, stored evidence, and resulting rebalance transaction.

This creates a verifiable pipeline:

Deposit → AI Decision → TEE Attestation → Storage → Merkle Commitment → On-chain Rebalance

The strategy itself is tokenized through StrategyAgenticID, an ERC-7857-based asset. This allows the AI strategy to have an ownable identity and maintain a portable, auditable decision history. The architecture is designed so that strategy reputation can remain associated with the strategy rather than being locked inside a centralized platform.

Oasis is also modular. The YieldAdapter architecture allows additional yield protocols and strategies to be connected without replacing the core vault or AI orchestration layer.

Core Smart Contracts  0G Aristotle Mainnet:

NativeVault:
0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3
https://chainscan.0g.ai/address/0xBe08ACa91A346A4B49C31563Ab897FF42d8B5FF3

RebalanceExecutor:
0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d
https://chainscan.0g.ai/address/0x36F7CA0e8cE7326F577127cEB11c6884D22cb35d

DemoYieldAdapter:
0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E
https://chainscan.0g.ai/address/0xB71abFb4816Ed1b8BeC76330B6F97CB34Cd37F1E

StrategyAgenticID (ERC-7857):
0x78A8ba224b0972aa842438B184fc99BB6afd7950
https://chainscan.0g.ai/address/0x78A8ba224b0972aa842438B184fc99BB6afd7950

Live rebalancing transaction:
https://chainscan.0g.ai/tx/0x66dbcf103a410bacf0384f05484fb0f1d36164a308e9b071d9b7943696afa61c

Security: Oasis uses OpenZeppelin security patterns including ReentrancyGuard, SafeERC20, ERC-4626-style vault accounting, and access controls for sensitive operations.

Vision: Oasis aims to become an AI native yield infrastructure layer where strategies can autonomously manage capital while remaining verifiable, auditable, modular, and ownable.
live at - https://oasis-0g.vercel.app/

---

## 31. PIT

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/nPmjplVBlu0qGne6v

### Product intro

pit .

What it does

The problem it solves

Challenges I ran into

Technologies I used

How we built it

What we learned

What's next for

### Updates in this Wave

loading ..

---

## 32. ProofMind

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/o6mjv9EN3sq02a8Bl

### Product intro

ProofMind turns a document and a focused question into an inspectable, tamper-evident result

What it does
ProofMind turns a document and a focused question into an inspectable, tamper-evident result instead of a black-box answer. A user uploads a text-based document (the browser computes a SHA-256 hash before any analysis happens), asks a question like "find the biggest risks in this document," and picks a specialist agent — Security Auditor, Financial Analyst, or Research Agent. The result comes back with the exact evidence passages behind the finding, rationale for why each passage…

### Updates in this Wave

During this Wave, ProofMind was completed as a working end-to-end verifiable AI workspace and deployed to the 0G Galileo testnet environment.

  ProofMind allows a user to upload a document, ask a focused question, select a specialist agent, inspect the evidence passages used in the result, and
  create a tamper-evident verification proof. The application supports TXT, Markdown, JSON, CSV, and text-based PDF files. Files are validated client-side,
  limited to 10 MB, hashed with SHA-256 before analysis, and kept in the browser by default.

  The application includes three focused agents:

  - Security Auditor for access, permissions, governance, and implementation risks.
  - Financial Analyst for financial assumptions, ratios, and claims.
  - Research Agent for mapping conclusions back to source passages.

  The analysis layer supports an optional 0G Compute Router integration through a secure Vercel serverless API route. The Compute API key is kept server-
  side and is never exposed to the browser. When remote Compute is unavailable, ProofMind uses a deterministic local evidence scanner and clearly labels the
  result as local instead of falsely claiming remote AI provenance.

  A ProofRegistry smart contract was deployed on 0G Galileo testnet. It stores the proof hash, source document hash, result hash, creator address, and
  timestamp. The actual document content is not stored on-chain.

  The app also includes:

  - Dedicated Analyze, Proof History, Agents, and Public Verify pages.
  - Wallet connection and automatic 0G Galileo network switching.
  - Transaction receipt polling before marking a proof as anchored.
  - Public proof verification without requiring a wallet or account.
  - Verified share links containing an integrity-checked evidence package.
  - Searchable local proof history.
  - Evidence explorer modal with excerpts and source context.
  - Markdown verification report export.
  - Responsive mobile layout, favicon, loading states, empty states, validation messages, and accessibility-focused interactions.
  - Production documentation, environment configuration, deployment instructions, and security guidance.

  Live deliverable: https://proofmind-alpha.vercel.app

  0G ProofRegistry: https://chainscan-galileo.0g.ai/address/0x503199B159DbAC9212Ae28A8C8E6f26E06D5002b

  Deployment transaction: https://chainscan-galileo.0g.ai/tx/0xbc79edf18406096faaa19dbc5704908b0c6b64272b8a7b9fca37a94c4408386f

---

## 33. sentinelAI

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** 0xcoredev/sentinelAI
- **Product page:** https://app.akindo.io/products/peBr8RwDgTR28m1g

### Product intro

AI-powered DeFi portfolio risk management with 0G blockchain integration.

SentinelAI

AI-powered DeFi portfolio risk management with 0G blockchain integration.

Features

- **AI Risk Engine** - Real-time portfolio risk analysis powered by 0G Compute
- **Smart Strategies** - AI-generated rebalancing and hedging recommendations
- **On-chain Execution** - Strategies executed via smart contracts on 0G Chain
- **Immutable Audit Trail** - All activity stored on 0G Storage
- **Risk Scoring** - Dynamic portfolio risk assessment

Architecture

```
Frontend (React/Vite) → API…

### Updates in this Wave

Wave 3 closes all four Wave 2 judge demands on 0G Galileo (chain 16602) + ships a top-3 differentiator.

Wave 2 feedback: "storage returns fixed placeholder strings… verification always returns success… strategy engine falls back to a hardcoded response when the compute key is missing — which is the default… Contracts aren't deployed and the chain ID doesn't match 0G Galileo."

**1. Real 0G Storage — LIVE** (was placeholder strings + unconditional `return True`)
Deleted `"pending_0g_storage_upload"` + in-memory `self.logs` + unconditional `return True`. TS sidecar wraps `@0gfoundation/0g-storage-ts-sdk`: `Indexer.upload(MemData)` returns real `rootHash`; `downloadToBlob(proof=true)` Merkle-verifies; `verify()` re-downloads. `npm run test:storage` ran on Galileo: 2 real uploads + Merkle-verified download + `verify() → true`. rootHashes + txs in `deployments.json`.

**2. Real 0G Compute — code-closed, live run pending 24h faucet cooldown**
Deleted `_get_fallback_response()`. TS sidecar wraps `@0gfoundation/0g-compute-ts-sdk`: `processResponse(addr, chatID, content)` verifies TEE signature via `ZG-Res-Key`. FastAPI raises on sidecar failure. Provider: `qwen/qwen2.5-omni-7b`. Live run pending: new wallet needs one-time 3 0G `LedgerManager` deposit (SDK hard req); faucet IP-cooldown 24h.

**3. Contracts deployed + correct chainId** (was 16600, never deployed)
chainId 16600 → **16602** in `hardhat.config.js`/`config.ts`/`portfolio_service.py`. Deployed to Galileo: PortfolioManager `0x9824f294…Cda68`, RiskStrategy `0xb10b3d4C…da87`, SentinelAgentID (ERC-7857 proxy) `0x4404B324…48A9`. Oracles wired (verified via `cast call`). Deleted 3 hardcoded fake positions — `portfolio_service` reads real `PositionAdded` events via web3.py. `deployments.json` records all addresses.

**4. Test count (was 0) — 59 Hardhat tests passing**
PortfolioManager (21) + RiskStrategy (22) + SentinelAgentID ERC-7857 (16). Fuzz: risk bounds 0-100.

**5. ERC-7857 Agentic ID (top-3 differentiator)**
Vendored canonical 0G `0g-agent-nft` contracts. `SentinelAgentID` inherits `ERC7857Upgradeable` + 3 extensions (mirrors canonical AgentNFT). ERC-1967 proxy + `_disableInitializers()`. `viaIR=true`. `supportsInterface(IERC721) → true` verified on-chain. **Owning a token authorizes an EOA to submit AI strategies** — agent identity is a transferable NFT. Real `iTransferFrom` deferred to Wave 4 (TEE oracle wiring).

**6. Contract fixes + TEE anchoring**
Fixed 3 Wave 2 bugs (`updateRiskScore` `riskOracle`-gated; `generateStrategy` no longer conflates with `executed`; added `markExecutedFor`). `generateStrategy` takes `bytes32 proofHash` — every strategy anchors TEE attestation on-chain.

**7. Frontend** — Real wagmi v2 + RainbowKit on 0G Galileo. `TEEProofBadge` (✅/⚠️). `AuditTrail` real rootHash + per-row Verify.

---

## 34. SkillChain

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/NmReO4aqOCdog6mxD

### Product intro

SkillChain turns practical software work into portable, verifiable proof

**What it does**
SkillChain turns practical software work into a portable, verifiable credential. A learner connects a wallet, picks a track (Solidity, React, or AI Agents) and difficulty, then submits a solution — pasted code, an uploaded file, or a repository reference. The server runs deterministic assessment checks and, when a Compute key is configured, asks the 0G Compute Router for a strict-JSON review, scoring correctness, security, architecture, testing, and efficiency. Every accepted…

### Updates in this Wave

Wave 3 — Testnet foundation (completed)
Practical assessments and transparent rubric reports.
Wallet connection and 0G Galileo network switching.
Trusted-issuer credential authorizations.
On-chain credential claims and revocation support.
Public credential verification and shareable links.
Responsive production UI, Vercel deployment, security headers, and smoke testing.

---

## 35. SoSo Alpha Flow

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Deliverable:** https://x.com/thewhaletw
- **Product page:** https://app.akindo.io/products/o6X2nOPeBipB6Eg6

### Product intro

AI powered onchain research assistant for finding early market opportunities.

What it does

SoSo Alpha Flow is an AI powered onchain research assistant that helps users discover early crypto opportunities, track smart wallets, monitor market sentiment, and filter useful signals from market noise.

The problem it solves

Crypto data is scattered across many platforms, making it hard for normal users to find real opportunities before trends become crowded. Most users either miss early signals or follow low quality information.

Challenges I ran into

The biggest challenge…

### Updates in this Wave

a

---

## 36. TAWFIK AAHMED ABDO MUSAED QERAN

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Deliverable:** https://github.com/ta77130
- **Product page:** https://app.akindo.io/products/93kLWeoVlc8Zje2Z

### Product intro

Good

What it does

The problem it solves

Challenges I ran into

Technologies I used

How we built it

What we learned

What's next for

### Updates in this Wave

For the field or skill for which you are looking for tools (such as: writing, programming, design)

---

## 37. TILL

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/wKmDAQr1xik2l69j

### Product intro

till

Till

**The agent gets capability, not custody.**

Till is a bounded native-0G work account for autonomous agents. You mint it on 0G Aristotle, write on-chain policy, fund the vault, and authorize a device-local session. The session finishes useful work. It never receives the owner wallet.

Agents need compute, persistence, and a receipt. They do not need a hot wallet that can withdraw, approve, or sign anything. A prompt that says "do not spend more than five dollars" is not a constraint…

### Updates in this Wave

⏳

---

## 38. TRAIDE Keeper on 0G

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** NoBanks/traide-keeper-0g
- **Product page:** https://app.akindo.io/products/OVO4LEP4niGPZm6X

### Product intro

Verifiable AI agent receipts: hashed on 0G chain, stored on 0G Storage, provable by anyone.

The problem

AI agents self-report their track records. There is no way to know when numbers were locked in, whether they were cherry-picked, or whether they were edited after the fact.

What this is

TRAIDE Keeper anchors every AI decision receipt on 0G, using two 0G services natively:

- The TRAIDE engine emits a canonical JSON receipt; its sha256 is attested on 0G chain via the event-only TraideReceiptsRegistry (nothing to admin or rug)
- The full receipt payload is stored on 0G Storage and…

### Updates in this Wave

Everything below shipped inside this Wave (Aug 14), all live on Galileo, every claim clickable:

- Deployed the full TRAIDE DEX fleet (11 contracts) via canonical CREATE2; Router wired to on-chain-verified W0G (0x1Cd0690f...)
- Deployed TraideReceiptsRegistry: event-only attestation anchor at 0x6f529D5C34f78c28eb9a1E1a219e1cEfdA78c0d9
- Anchored a REAL receipt from the live TRAIDE engine: sha256 69614c5f... attested in tx 0x6fe04c26... (block 49367373)
- Stored the full receipt JSON on 0G Storage: root 0xe4ae323a..., retrieved with merkle-proof verification, downloaded bytes hash-match the on-chain attestation
- Zero-dependency verify script (stdlib only): PASS against live chain state
- Public repo: https://github.com/NoBanks/traide-keeper-0g
- Demo video (public): https://www.youtube.com/watch?v=9ucnXVCVwUw
- Live registry on explorer: https://chainscan-galileo.0g.ai/address/0x6f529D5C34f78c28eb9a1E1a219e1cEfdA78c0d9

Two 0G services in production use (chain + Storage). Wave 4 plan: route benchmark model decisions through 0G Compute/Inference. Wave 5: mainnet + external verifiers + cost benchmarks.

---

## 39. TrustLens

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/X4Kj2paOnu08oLB2

### Product intro

TrustLens is a local-first evidence verification workspace for the 0G Galileo

**What it does**
TrustLens answers one practical question about a file: does it have a traceable provenance record? A user drags in a file (PDF, image, audio, video, or generic — up to 25 MB), and the browser computes a SHA-256 fingerprint locally using `crypto.subtle`. TrustLens runs an integrity preflight — checking for empty files, readable structure, MIME type, and filename-extension consistency, plus duplicate-fingerprint detection — and reports the result in plain safe/warning/danger…

### Updates in this Wave

Shipped a working, local-first evidence verification tool on 0G Galileo. Files are hashed client-side (SHA-256, never uploaded) and run through an integrity preflight — empty-file, structure, MIME, and extension checks, plus duplicate detection — shown in plain safe/warning/danger states. A connected wallet can publish just the fingerprint (not the file) to the deployed TrustLensRegistry contract at 0xfCeBC49a588487AcC50f995B7541ac64B5617eE2 on Galileo, and anyone can look it up publicly. Local workspace history is searchable and exportable, with automatic network switching, account-change handling, and clear loading/error/empty states throughout.

Live app: https://trustlens-cyan.vercel.app

---

## 40. VeriAgent

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** GauravKarakoti/VeriAgent
- **Product page:** https://app.akindo.io/products/Vwv4w4D13TlpLvJn

### Product intro

now your agent. Verify every inference.

What it does
VeriAgent is a decentralized registry and reputation protocol for AI agents on 0G. It uses ERC-7857 Agentic ID to tokenize AI agents with their full model metadata and encrypted secrets, 0G Storage to store model fingerprints and inference logs, 0G Compute to run verifiable inference checks, and 0G Pay for agent-to-agent payments. Users can register an agent, submit verification challenges, and get an on-chain trust score that anyone can query before interacting with the…

### Updates in this Wave

Core MVP & First 0G Integrations

Twitter Post: https://x.com/GauravKara_koti/status/2091916820500603077?s=20

- Summary: In this wave, we moved from concept to a working MVP. We deployed the first version of our Agent Registry and Trust Score contracts to the 0G testnet, implemented ERC-7857 Agentic ID minting, and built a basic verification oracle using 0G Compute and 0G Storage.

What We Built This Wave
- AgentRegistry.sol
  - Functions: registerAgent, updateAgentMetadata, transferAgent, getAgentDetails
  - Stores agent metadata hash, owner, and verification status on-chain.
- ERC-7857 Agentic ID Integration
  - Implemented minting of ERC-7857 tokens for registered agents.
  - Token metadata includes model hash, compute provider ID, and encrypted API key reference.
  - Metadata is uploaded to 0G Storage; only the content hash is stored on-chain.
- Verification Oracle (Python FastAPI)
  - Accepts agent ID and sample input.
  - Calls 0G Compute to run inference on the agent’s model.
  - Returns output hash and stores the result on 0G Storage for later challenge evidence.
- Frontend Scaffold
  - Wallet connection via ethers.js.
  - Basic agent registration form.
  - Agent list view pulling data from the 0G Chain.
- Testnet Deployment
  - Deployed AgentRegistry and TrustScore contracts to 0G testnet.
  - Explorer links:
    - AgentRegistry: 0x... (replace)
    - TrustScore: 0x... (replace)

0G Components Used
- 0G Chain - Smart contract deployment, agent registry, on-chain metadata hash
- 0G Storage - Storing encrypted model metadata and verification logs
- 0G Compute - Running verifiable inference checks
- Agentic ID (ERC-7857) - Tokenizing AI agents with full metadata

Challenges & How We Overcame
- Metadata schema design: ERC-7857 requires careful handling of encrypted secrets. We used a JSON schema with an encrypted apiKey field and a public modelHash field.
- Compute latency: 0G Compute calls can take 10–20 seconds. We added a job queue in the backend and return a pending status to the frontend.
- Storage cost management: Uploading full inference logs for every request is expensive. We implemented a sampling strategy — only store logs for verification challenges, not routine calls.

Traction & Metrics
- 3 test agents registered on testnet.
- 20+ verification requests processed by the oracle.
- On-chain activity: 5 transactions on 0G testnet explorer.
- Feedback from 2 developer friends: registration flow is clear, but trust score display needs improvement.

---
