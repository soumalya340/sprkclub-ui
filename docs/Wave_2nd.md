# 0G Bridge by AKINDO — Wave 2

- Source: [https://app.akindo.io/wave-hacks/Z4MlX4vreI72ol6pd?tab=products](https://app.akindo.io/wave-hacks/Z4MlX4vreI72ol6pd?tab=products)
- Wave ID: `o6XWZdgBLtrRNnjw`
- Wave hack ID: `Z4MlX4vreI72ol6pd`
- Started: 2026-07-08T23:00:46.000Z
- Submission deadline: 2026-07-23T23:00:00.000Z
- Judgement deadline: 2026-08-13T00:25:00.000Z
- Completed at: 2026-08-13T00:25:00.000Z
- Grant amount field: 0.000000000000000000 USDC
- Grant distribution mode: point
- Submissions scraped: 21
- Summary meta totalPoint: 100
- Scraped at: 2026-08-29 11:42 UTC
- Tool: Scrapling `Fetcher` against `api.akindo.io/public`

## Fields per product

- **Name** — product name
- **Product intro** — tagline + truncated description
- **Points** — judged `totalPoint` for this wave (0 if not judged yet)
- **Money** — `earnedAmount` / `totalFixedAmount` as recorded by Akindo (often $0 until credits/USDC are distributed)
- **Updates in this Wave** — submission progress comment for this wave

---

## 1. Axiom Protocol

- **Points:** 15
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/RDwg8dRJZT7k10KD

### Product intro

Axiom turns AI agents into ownable ERC-7857 iNFTs on 0G with TEE-secured and verifiable execution.

Axiom Protocol

**Verifiable AI Agent Operating System on 0G**

> Tokenize AI trading agents as ERC-7857 iNFTs with encrypted strategy logic that is TEE-rekeyed on every transfer, enabling ownership, verifiability, and on-chain execution.

---

Project Vision & 0G Fit

DeFi's agentic future is blocked by a **trust problem**. Trading bots execute black-box strategies with no cryptographic proof of what model ran, what inputs it received, or who authorized the decision. This has contributed to…

### Updates in this Wave

We just kicked off Wave 2, so this is an early progress report.

The backend took the biggest hit. Model and router config was scattered across files with IDs hardcoded in three places. I pulled it into @axiom/config as the single source of truth. Model selection and context windows now come straight from the 0G Compute Router's /v1/models endpoint, which finally killed the silent 32K clamp we'd been shipping.

The shared package grew. It now carries addresses, ABIs, EIP-712 types, and network config that both the frontend and backend import, so the two sides can't drift. I merged five skill routers into one file. Crypto and service modules got folded together too. Module boundaries are cleaner now.

Audit fixes landed this week. Nonce handling is off Number() and runs through a dedicated get-nonce flow with BigInt and toString, so no truncation. Royalty payments write on-chain through AxiomPaymentProcessor now. BPS gets set and earnings withdraw is wired up. MarketPage event parsing got reworked.

On ERC-7857 the full iNFT suite is live on 0G Galileo: AgentNFT, StrategyVault, TeeVerifier, PaymentProcessor, and MockUSDC. The missing events and methods are in, and the e2e parity matrix exercises them across royalty, compute-pay, earnings, authorize, delegate, revoke, data update, and proof cleanup, which is the part that gives me confidence the contracts actually do what the docs claim.

Reliability got attention. Timeouts and AbortSignals are in across the backend, on the chat stream, the strategy runner, and external fetches, with a next-tick retry on init failures. Verifier and signer rotation sits on-chain now. A one-day timelock guards it under OPERATOR_ROLE.

We rebranded the oracle as a software signer that mimics TEE behavior in a Node process with a cleartext key. No enclave behind it, and the docs say so plainly. The indexer streams events to a 0G DA sidecar via blob dispersal, so the audit trail is tamper-evident. I tightened .gitignore and pulled a leaked CI token out of the shell config.

The security report is done. STRIDE, fifteen findings, plus a runbook and architecture docs under docs/.

Here's where things stand. Contracts run on 0G Galileo testnet and the core backend and frontend work. A frontend review is coming this wave to firm up the responsive layout, error states, and payment UI, and to cut friction. Contracts get an optimization pass before mainnet for gas, limits, and the UX-facing surfaces.

Planned next: Aristotle mainnet deploy with verified bytecode, the contract optimization, the frontend full review to new one, a k6 load-test sign-off, and a two-to-three minute demo video.

---

## 2. 4lpha AI

- **Points:** 14
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

Shipped a real Galileo testnet (16602) trade-agent path:

- Per-user Policy Vault + sandbox pool/adapter, isolated from mainnet.
- Server-side consent/ledger/audit pipeline with 0G Storage-anchored proofs.
- GalileoTradePanel: preview/execute trades with slippage caps.
- GalileoAgentDeployPanel: 3-step signed deploy flow (consent -> wallet sig -> 0G Storage upload) + on-chain enable.
- Vault attestor script for the attestor role (dry-run by default).
- Closed a 10-item security audit (schema validation, RPC backoff, ledger pruning, ABI-parity test, etc).
- 30 automated tests, tsc/hardhat clean, plus a testnet agent rehearsal mode.

---

## 3. Knole

- **Points:** 13
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/peBBa8LqRTOmNXdw

### Product intro

Knole is a private AI journal that acts as a mirror, not an assistant

Knole

> **A private AI journal that acts as a mirror, not an assistant.**
> Understand your life through your own words — anonymised before inference, encrypted under your key, minted to your wallet, recoverable from 0G. **Live on 0G Aristotle mainnet.**

   

---

Must Visit First

- **Notion — Product Overview & Visuals** (the full story, visuals, architecture, 0G integration): https://comfortable-goal-205.notion.site/Knole-3869c0ce78768120b4bbce690981b6db
- **Proof Deck** (screenshots…

### Updates in this Wave

𝐊𝐧𝐨𝐥𝐞 — a private AI journal that acts as a mirror, not an assistant. It reflects people through their own words — the patterns they repeat, the contradictions they carry, the truths they avoid. ~30 features across 25 routes, live on 0G Aristotle mainnet.

━━━━━━━━━━━━━━━━━━━━━━━━━━
      ★  𝐌𝐔𝐒𝐓  𝐕𝐈𝐒𝐈𝐓  𝐅𝐈𝐑𝐒𝐓  ★

▸ Notion — full story, visuals, architecture, demand research:
https://comfortable-goal-205.notion.site/Knole-3869c0ce78768120b4bbce690981b6db

▸ Proof deck — real flow, screenshots, evals, on-chain proofs:
https://knole.me/proof-deck.html
━━━━━━━━━━━━━━━━━━━━━━━━━━

𝐓𝐇𝐄 𝐉𝐎𝐔𝐑𝐍𝐄𝐘 (𝐦𝐨𝐦𝐞𝐧𝐭𝐮𝐦)
• Wave 1 — shipped the memory engine, the 14-Day Mirror, Ask My Life, the Index, restore-from-chain, and a 21-suite eval gate on 0G Galileo testnet.
• Then — migrated fully to 0G Aristotle mainnet (16661): storage, anchoring, restore, iNFT, and pay-with-0G all live; sealed inference on, with full 0G fallback and no external LLM.
• This wave — perfected the architecture, now provable on-chain: real ERC-7857 (supportsInterface true for iNFT + Authorize + Cloneable, false for a control id; contract 0x6A3200…6B813), minted gas-free to the user's OWN wallet — not a central one; attestation-verified TEE for reflection AND live chat (gated on processResponse); and the full logged-in journey proven end-to-end — Privy login → mint → on-chain owner == the user.

𝐖𝐇𝐀𝐓 𝐖𝐄 𝐁𝐔𝐈𝐋𝐓
One memory engine (local MiniLM embeddings, LLM extraction, dedup/supersede, bi-temporal, RRF hybrid retrieval) behind Daily Reflection in 4 lenses, the day-15 Mirror, Ask My Life with cited receipts, Life Canvas, Future-Self, Wrapped, Year, On-This-Day, private Research (0G Qwen-Max), voice journaling, image gen, a Chrome extension, and a shareable card — plus a retention loop, anti-sycophancy + rumination guard + omission radar, SB243 crisis safety, a Stripe subscription + pay-with-0G, and a real installable mobile app (offline, voice-first).

𝐏𝐑𝐈𝐕𝐀𝐂𝐘 & 𝟎𝐆
Names stripped locally before any model → AES-256-GCM under a per-user key → 0G Storage → memory roots, reflection receipts, and tamper-evident recall Merkle-anchored on 0G Chain → recoverable byte-identical from 0G. Integration spans all five: Storage, Chain, Compute (TEE broker, TeeML), Agentic ID (ERC-7857), and Pay-with-0G.

𝐃𝐄𝐌𝐀𝐍𝐃 & 𝐑𝐄𝐀𝐂𝐇
Every feature maps to proven, funded demand — Rosebud ($6M), Stoic (4M users), Daylio (20M), a16z on private user-owned AI. Publicly launched: @knole_me on X, domain live at knole.me, open to everyone via guest journals — no signup.

𝐏𝐑𝐎𝐎𝐅
Verify it yourself at knole.me/verify — it reads the contract live on each load. 21-suite eval gate green in CI, 200+ public commits, solo-built.

𝐇𝐨𝐧𝐞𝐬𝐭 𝐬𝐜𝐨𝐩𝐞: verifiable third-party iNFT transfer awaits a TEE/ZKP oracle 0G hasn't shipped yet — mint, hold, evolve, and grant are real today.

---

## 4. Hanami

- **Points:** 12
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** ajanaku1/hanami
- **Product page:** https://app.akindo.io/products/Z4Mzz2wVrUQo8rA1

### Product intro

AI bouncer for NFT whitelists — TEE-attested screening on 0G, Merkle root for any EVM mint.

What it does

Hanami is an AI bouncer for NFT whitelists. A project mints an ERC-7857 iNFT with a persona they wrote — voice, taste, screening criteria. Applicants connect a wallet and have a 3–6-turn conversation with the bouncer. It approves or rejects. Every verdict lands on 0G Chain carrying a TEE attestation hash anyone can recompute. At close, the owner exports a Merkle root for any EVM mint contract. All three 0G modules are load-bearing: Compute for sealed inference, Storage for…

### Updates in this Wave

Hanami entered Wave 2 with a working mainnet product (three 0G modules integrated, both contracts verified on chain 16661, live at hanami-hazel.vercel.app). The Wave 2 focus was verifiability, durability, and production hardening — turning the attestation claim from "trust the README" into something anyone can recompute in a browser.

In-app attestation verification ("Verify on 0G"). Every decision screen now has a one-click check that pulls the inference's x_0g_trace, recomputes keccak256(requestId, provider, tee_verified) locally, and shows it matching the on-chain attestation hash byte-for-byte. No wallet, ~15 seconds. This was our highest-ROI feature — the attestation went from a server-side claim to a browser-verifiable proof.

Signed-enclave decision path via 0G Compute Direct broker. Alongside the live Router path, the decision turn can now route through the 0G Compute Direct broker (@0gfoundation/0g-compute-ts-sdk), which returns the provider's raw TEE signature over the response. The browser Verify panel can recover that signature to the provider's on-chain-registered teeSignerAddress — cryptographic proof the enclave signed the decision, with the Router out of the trust base. End-to-end wired and verified against mainnet (provider discovery, signer status, offline recovery). Ships disabled (OG_DIRECT_ENABLED=false) pending a 3 OG deposit in the Compute ledger.

On-chain reputation, live. Each approval now calls incrementRep on the bouncer iNFT via BouncerRegistry, so a bouncer accrues a verifiable track record that travels with the token across every campaign it runs. Previously declared on the contract but inert; now wired end to end.

Transcripts pinned to 0G Storage. The full conversation transcript is now content-addressed on 0G Storage at decision time, with its rootHash recorded on the decision record. Previously, only the reasoning hash was stored.

Privacy gate. A private campaign's per-applicant feed (wallets + decisions) now requires an owner signature to view; aggregate counts (approved/rejected/pending) stay public so the admin dashboard remains useful without signing.

Portrait durability. AI-generated portraits on 0G Storage can vanish before finalisation. Built a three-tier resolve path: disk cache → Turso/libSQL durable store → 0G indexer, with procedural SVG fallback on any load error. Portraits never render broken.

Backend hardening for production. Bound 0G Router calls so stalled inference can't hang a turn. Fixed a race that 500'd on concurrent chat opens. Made chat resilient to Render cold starts (keepalive + surfaced real errors in the UI). Hardened for 512MB free-tier limits.

---

## 5. Talos

- **Points:** 11
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** enliven17/talos
- **Product page:** https://app.akindo.io/products/eaML4dn8ru8klGzMp

### Product intro

Turn any AI agent into a tokenized, self-sustaining corporation — natively on 0G.

What it does

Talos is an operating system for autonomous "agent corporations." Launching
an agent deploys three things on 0G Chain at once: a `TalosRegistry` entry
(the agent's on-chain identity), a bonding-curve ERC-20 token unique to that
agent, and an ERC-7857 "Agentic ID" NFT representing ownership of the agent
itself. Buying the agent's token both invests in it and is the only way to
pay it for work — a buyer transfers however much of the token they choose to
commission a task, no fixed…

### Updates in this Wave

This Wave we finished wiring the ERC-7857 "Agentic ID" NFT into the genesis flow and verified it end-to-end on 0G Galileo testnet: a new Talos now mints its TalosAgentNFT automatically, and we confirmed on-chain ownership via a direct contract read against the deployed TalosAgentNFT. We added Privy for embedded-wallet / social login alongside our existing MetaMask/Coinbase/WalletConnect support, without touching the wallet-session auth we already had — Privy only replaces the connection layer. We also removed a design flaw from the commerce model: services used to require a fixed price set at registration; now a buyer pays however much of the agent's own token they choose per task, which better matches how agent-to-agent commerce actually works. While generating real transaction volume for this update we found and fixed a genuine concurrency bug — the operator wallet had no nonce serialization across its signed transactions, so back-to-back operator calls could collide and silently drop a transaction. Fixed by wiring viem's nonceManager into every signing wallet client. We then used the fix to deploy 5 new agents fully on-chain (registry, name, bonding-curve token, Agentic ID NFT each), executed real token purchases and real service-job payments across them, all verifiable on the 0G Galileo explorer.

Live app: https://talos-0g.vercel.app
Repo: https://github.com/enliven17/talos
Explorer (0G Galileo): https://chainscan-galileo.0g.ai
- TalosAgentNFT: 0xE0AA86abfb00A6E33EA4d94C00eA3B8E06C8477f
- TalosTokenFactory: 0x0fA9052a598799d8ef7061bd74915E92532E5DE9
- TalosRegistry: 0xE2b9765F1af22b3e874319952aA1ec3BE64cF056

---

## 6. LabelDAO – Decentralized AI Data Infra

- **Points:** 8
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

# Labelling DAO

Decentralized image labeling infrastructure on 0G Chain.

Live at **[annotations.paymebro.xyz](https://annotations.paymebro.xyz)**

## Features

- Smart contract for task lifecycle, submissions, reputation, and payouts
- Bounding-box annotator in the browser (wallet-gated submissions)
- Event indexer with Postgres for real-time stats and labeler history
- User progress persisted by wallet address across sessions/devices
- 5 real labeling tasks deployed with ~1K COCO 2017 images
- Fully containerized deployment with Traefik + HTTPS

## Stack

| Layer | |
|---|---|
| Frontend | React 19, TypeScript, Vite, wagmi |
| Annotator | react-bbox-annotator |
| Chain | 0G testnet (Solidity + Hardhat) |
| Storage | 0G Storage (ZIP archives) |
| Proxy | Express (image serving + event indexer) |
| DB | PostgreSQL |
| Infra | Docker Compose, Traefik |

## Prerelease

This is an MVP. Polygon segmentation, AI verification, automated payouts, and an open dataset marketplace are planned.

---

## 7. OptimIEra

- **Points:** 8
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** shrixvxv-prog/OptimIEra
- **Product page:** https://app.akindo.io/products/VwMOBBJ6EtQQ8dl6P

### Product intro

OptimIEra is a verifiable prompt-intelligence workspace.

What it does

OptimIEra is a privacy-first AI prompt optimization and verification DApp built on the 0G Galileo testnet.

Users can enter an AI prompt, analyze its weaknesses, and generate three improved versions: Balanced, Accuracy Focused, and Token Efficient. OptimIEra evaluates the original and optimized prompts across clarity, context, completeness, structure, safety, privacy, consistency, and token efficiency.

After selecting the best candidate, users can save it as an immutable version…

### Updates in this Wave

During the 2nd Wave, OptimIEra evolved from a prompt optimization concept into a complete verifiable prompt-intelligence platform.
We built the core Studio workflow for analyzing, scoring, optimizing, comparing, versioning, and verifying AI prompts. The deterministic Rules Engine identifies ambiguity, missing constraints, contradictions, safety risks, privacy concerns, structure issues, and token inefficiencies. It generates Balanced, Accuracy-focused, and Token-efficient candidates with transparent scoring and recommendations.
The platform now includes encrypted prompt and candidate persistence, PostgreSQL and Prisma data management, workspace and project organization, team roles, reviews, audit history, Prompt Registry workflows, immutable prompt versions, public-safe certificates, and the Proof Center.
Authentication supports both email/password and wallet-based SIWE login through MetaMask, Rabby, OKX Wallet, and other injected EIP-1193 wallets. Private prompt content remains encrypted, while public verification exposes only safe hashes and metadata.
We also completed local browser testing, API verification, database testing, responsive UI validation, documentation, safety scanning, and production build checks.
Live deliverables:
Local product: http://localhost:3000
GitHub: https://github.com/shrixvxv-prog/OptimIEra
Public documentation: https://branched-channel-4e3.notion.site/OptimIEra-Product-Vision-Technology-Hub-3a18ee65843481f596e2c2d8aa9ce515?pvs=74
Demo video: https://youtu.be/1-njMpxPJM4

---

## 8. Aevum

- **Points:** 7
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

# Aevum — Wave 2 Submission

**Core Smart Contracts — Fully Implemented, Tested, Deployed**

## Contracts (3 deployed to 0G Galileo Testnet)

**AevumRegistry** — Agent identity registry. Creates agents with auto-incremented IDs, manages memory pointers (0G Storage root hashes), handles ownership transfer. Registrar pattern allows AevumAgenticID to atomically create agents during NFT minting.

**AevumMemory** — Append-only memory log per agent. 4 data types (RAW, EMBEDDING, CONVERSATION, DOCUMENT), parent chaining for threads, per-entry ACL, paginated latest-first retrieval. Only hashes and pointers on-chain — no plaintext.

**AevumAgenticID** — ERC-7857 Agentic ID NFT. Minting creates registry agent atomically. Oracle-verified transfer (TEE must approve re-encryption). Cloning copies agent with same memory to new owner. Bitmap-based usage permissions per executor.

## Tests — 113 Passing, 90.07% Line Coverage

- 42 Registry tests (99% lines, 100% branches)
- 30 Memory tests (100% lines, 100% branches)
- 34 AgenticID tests (96% lines, 85% branches)
- 7 integration tests (full lifecycle, clone, multi-agent, ACL, transfer chains)
- Fuzz tests across all contracts

## Slither Audit — All Actionable Issues Fixed

- Renamed 10 shadowed `owner`/`name` variables
- Improved CEI reentrancy ordering in mint() and clone()
- Bumped Solidity 0.8.20 → 0.8.24 (fixes 3 compiler bugs)
- 28 remaining findings: OpenZeppelin library, false positives, by-design choices

## Deployment (Galileo Testnet, Chain ID 16602)

| Contract | Address |
|---|---|
| AevumRegistry | `0x406f997ea6b857432ade179e87fd00e94955ed26` |
| AevumMemory | `0xa79c2a02d56bb1145f3c03d17d4f94c4d2c5055b` |
| AevumAgenticID | `0xf9ba5e30218b24c521500fe880ee8eaad2897055` |

## Gas Costs

- AevumRegistry: 1.6M gas deploy
- AevumMemory: 1.6M gas deploy
- AevumAgenticID: 3.0M gas deploy

---

## 9. diversifi

- **Points:** 7
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** thisyearnofear/diversify
- **Product page:** https://app.akindo.io/products/A8zgdzjNjT0AZ6ez

### Product intro

AI advisor buys premium evidence on-chain before recommending wealth allocation decisions

What it does

DiversiFi is a risk-aware, values-driven treasury management agent that anchors every high-impact recommendation to **0G Storage** as verifiable evidence and records it on-chain through a `RecommendationLedger` deployed across five mainnets:

- 0G
- Arbitrum
- Celo
- HashKey Chain
- Robinhood Chain

All deployments use the same contract address: `0x3BCf7dFd68ce98880618c89A351168960724369C`.

The product evolved from an "AI intelligence marketplace" into a protection-first…

### Updates in this Wave

0G integration across all four 0G components — Chain, Storage, Compute, and DA — deployed and live on 0G mainnet (chain 16661). The RecommendationLedger contract (0x3BCf…369C) anchors evidence CIDs for every Guardian decision, with verified transactions on 0G Explorer (0x981086b4…).

What was built:
- 0G Chain: recommendation-ledger.service.ts adds ZERO_G_MAINNET_CHAIN_ID (16661) to the LEDGER_REGISTRY alongside Celo (42220), Arbitrum (42161), and HashKey (177). Chain-aware getLedgerChainForAction() routes savings decisions → Celo, yield decisions → Arbitrum, and evidence anchors → 0G.
- 0G Settlement: settlement-service.ts promotes ZERO_G to the default settlement rail via DEFAULT_SETTLEMENT_NETWORK (env-driven by SETTLEMENT_NETWORK). 0G mainnet RPC, USDC address, and explorer base configured alongside existing rails.
- 0G Storage: ZeroGAnchoringDecorator uploads encrypted evidence bundles (prompt + reasoning + sources) to 0G Storage per Guardian decision. CIDs stored on-chain via RecommendationLedger.
- 0G Compute: zero-g-provider.ts routes high-impact decisions through 0G's TEE-verified inference (Router API, deepseek-chat-v3-0324). Confidence-threshold gating ensures only meaningful decisions trigger TEE attestation.
- 0G DA: persistence-service.ts snapshots Guardian state to 0G DA once per loop cycle.
- Guardian loop: Records recommendations on 0G mainnet evidence anchor (heartbeat cron every 2h, auto-execution loop every 5min). Both produce verifiable 0G Explorer URLs surfaced in the in-app proof feed.
- Tests: 9 new tests cover 0G mainnet ledger entry, explorer URL construction, and ZERO_G vs ARC default switching. 650+ total tests pass.

Verification: pnpm test green (650+), Guardian heartbeat producing live 0G mainnet transactions, 0G Explorer links visible in proof feed. Demo video and X post included with this submission.

Deliverables: working Guardian flow on 0G mainnet (not just testnet — exceeded the Wave 2 goal), 3-min demo video, public X post with #0GBridge #BuildOn0G and 0G Explorer receipt links.

---

## 10. cognivern

- **Points:** 5
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** thisyearnofear/cognivern
- **Product page:** https://app.akindo.io/products/GL97GM0WNCjOaDBe

### Product intro

Privacy-first spend control for AI agents; encrypted policy enforcement, public decisions.

What it does

Cognivern is a spend control plane for autonomous AI agents. Institutions enforce budgets, approval thresholds, vendor policies, and chain restrictions with optional FHE confidentiality and on-chain verifiability.

- **Confidential policy evaluation:** Using Fhenix FHE on Arbitrum Sepolia, agents submit encrypted spend amounts and `ConfidentialSpendPolicy.sol` evaluates policy without revealing inputs. Only **Approve**, **Hold**, or **Deny** is exposed.
- **On-chain governance…

### Updates in this Wave

What we built:

  • GovernanceProof.sol — minimal event-only contract on 0G Galileo Testnet
  (chain ID 16602). Emits GovernanceDecision(workspaceId, agentId, actionType, a
  mount, currency, decision, timestamp) for every governance evaluation. No
  state storage — the event log IS the audit trail.
  • ZeroGProofService.ts — backend service (ethers v6) that posts proofs fire-
  and-forget. If 0G is unreachable, governance still works locally; the on-chain
  proof is an additional verifiability layer, not a dependency.
  • Demo interceptor wiring — both the unauthenticated demo path and
  authenticated demo-tier workspace path fire 0G proofs after each governance
  evaluation. The controller path (real workspaces) also posts proofs.
  • Public API endpoint — GET /api/governance/proof-info returns contract
  address, explorer URL, and network status. OpenAPI spec updated.

Deployed and verified on Galileo Testnet:

  • Contract: 0x723e444ee6D7da19fADe372f85DA06dD849bF1E0
  • Explorer: https://chainscan-galileo.0g.ai/
  address/0x723e444ee6D7da19fADe372f85DA06dD849bF1E0
  • First proof TX: 0x8db198a0c009720011c461c01515af1f99a4e0360921ea0d2e00d949e7
  8e6b0d (block 44739085, status success)
  • Multiple proofs verified on-chain (proofCount > 0, confirmed via RPC)

Live API: https://cognivern.thisyearnofear.com/api/governance/proof-info

Why we focused: The original plan spread across 5 components (Chain, Storage,
Pay, Agentic ID, Compute). We shipped one working integration rather than five
half-built stubs. On-chain governance proofs are the core value — every AI agentspending decision is now permanently verifiable on-chain without trusting our
server.

Cleanup: Removed all placeholder env vars for unimplemented features (0G Pay, 0GCompute, Agentic ID) and stale "Newton testnet" references. The codebase only
documents what's actually built.

---

## 11. ai-odds-maker

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

AI Odds Maker - Wave 2 Update

This wave, we built the complete foundation for AI Odds Maker, an autonomous prediction market protocol powered by 0G infrastructure.

Smart Contracts (Solidity):
- MarketContract: Binary YES/NO AMM with constant product pricing, 1% trading fees, and slippage protection
- LiquidityPool: Protocol-owned liquidity management for autonomous market-making
- OddsOracle: AI odds submission and market resolution with authorized agent system
- OddsMakerFactory: Market deployment, registry, and lifecycle management
- 232+ contract tests passing via Foundry

Agent (TypeScript):
- 0G Compute integration for AI odds generation from real-time data analysis
- 0G Storage client for market metadata, odds history, and audit trails
- Odds Maker Agent: Monitors markets every 30s, generates odds via AI, stores results on-chain
- Oracle Agent: Resolves expired markets using AI analysis with verifiable reasoning

Frontend (Next.js 14):
- Dashboard with live market grid and AI odds visualization
- Create Market modal with deadline selection
- Trade panel for YES/NO share purchasing with profit calculations
- Market detail view with tabs (trade, details, odds history)
- Wallet connect integration for 0G Galileo testnet

0G Integration:
- 0G Chain: All contracts deployed for Galileo testnet
- 0G Compute: AI inference for odds generation and resolution
- 0G Storage: Decentralized market memory and audit trails

GitHub: https://github.com/HushLuxe/ai-odds-maker

---

## 12. AILisency

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** nohypelabs/AILisency
- **Product page:** https://app.akindo.io/products/K8EvLepQXfQNAN7w3

### Product intro

Trust layer for AI agents with verifiable identity, reputation, and task escrow on the 0G blockchain

What it does

AILisency is a trust layer for AI agents on 0G blockchain. It gives every agent a verifiable identity, multi-metric reputation, and task escrow, so users can answer one critical question: can I trust this agent with my money, data, or code?

The product has three core surfaces:

* **Agent Registry** — browse registered agents with license levels from Bronze to Platinum, capabilities, wallet identity, DID, and a clear agent dossier.
* **Reputation Board** — view multi-metric trust…

### Updates in this Wave

Wave 2 Update - AILisency

What Changed From Wave 1 to Wave 2

1. Smart Contract - AgentRegistry.sol
- Contract deployed to 0G Galileo Testnet (chain ID 16600)
- Functions: registerAgent, getAgent, getAgentByOwner, updateMetadata, deactivateAgent
- Address configured via NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS env var

2. On-Chain Registration
- Agent registration now supports optional on-chain anchoring
- Flow: fill form, toggle "Anchor on 0G Galileo", sign wallet tx, saved to DB with tx hash
- Transaction hash stored in audit log for full traceability

3. Full Task Lifecycle
- Assign: any agent can accept an OPEN task
- Submit: performer submits proof of completion (URL or hash)
- Approve: creator approves, reputation auto-updates (completedTasks++, totalEarned, averageScore)
- Reject: creator rejects the submission
- Dispute: submitted work can be disputed
- All mutations run live via tRPC, no mock data

4. Auto-Reputation Updates
- Every approved task automatically updates the performer's reputation
- completedTasks, totalEarned, and averageScore update in real-time

5. 0G Storage Integration (Prepared)
- Utility client ready at src/lib/og-storage.ts
- Upload agent profile JSON to 0G Storage, root hash stored as metadataHash
- Just configure NEXT_PUBLIC_ZG_STORAGE_* env vars to enable

6. Auto-Seed Demo Data
- Demo data (10 agents, 18 tasks) auto-seeds on first request
- Idempotent: uses upsert, runs once per process
- Controlled by NEXT_PUBLIC_AILISENCY_WAVE1_DEMO_MODE

7. UI Updates
- "Wave 1 mode" labels replaced with "Wave 2 - Live" across registry, tasks, reputation pages
- Action buttons on task cards: Accept, Submit Proof, Approve, Reject
- On-chain toggle in registration page preview step

Technical Details

Network: 0G Galileo Testnet
Chain ID: 16600
Contract: AgentRegistry.sol (Solidity ^0.8.28)
RPC: https://evmrpc-testnet.0g.ai
Explorer: https://explorer-testnet.0g.ai
Storage SDK: @0gfoundation/0g-storage-ts-sdk (optional)

Files Changed (15 files, +816 lines)

contracts/AgentRegistry.sol (NEW)
contracts/agent-registry.ts, index.ts (updated)
src/hooks/use-write-tx.ts (updated)
src/server/api/routers/agent.ts, task.ts (auto-seed, lifecycle mutations)
src/app/registry/*, tasks/*, reputation/* (UI, action buttons)
src/lib/og-storage.ts (NEW)

Next Up (Wave 3)

Escrow contract settlement, full 0G Storage profile flow, 0G Pay integration, on-chain reputation derivation.

---

## 13. ApoloMind

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** SuryaXyz-art/Agentpolicypay
- **Product page:** https://app.akindo.io/products/K8Ezg6rn8UQ8oNGzN

### Product intro

Apolo Mind enables policy-controlled AI payments on 0G without full wallet access.

**Apolo Mind** is a programmable spending control layer for autonomous AI agents on 0G. It lets users give AI agents limited payment authority without giving them unlimited wallet control.

As AI agents become more autonomous, they will need to pay for APIs, research data, storage, compute, SaaS tools, and other digital services. But direct wallet access is risky. An agent could overspend, pay an unknown receiver, interact with unsafe contracts, or create actions that are difficult to…

### Updates in this Wave

In this wave, Apolo Mind was upgraded from a prototype into a polished AI-agent payment safety product with a live deployed frontend, stronger 0G-ready architecture, and a clearer demo flow.

Live deliverable:
https://agentpolicypay.vercel.app/

GitHub:
https://github.com/SuryaXyz-art/Agentpolicypay

Demo video:
https://youtu.be/wFMNqzXKm3w

Key updates completed in this wave:

1. Rebranded the project from AgentPolicy Pay to Apolo Mind with a dedicated logo, cleaner product identity, and a black, white, and red visual theme.

2. Built and deployed a live Vercel frontend with a professional Web3 dashboard UI.

3. Improved wallet connection support using Wagmi, Viem, and RainbowKit so users can connect with common wallets such as MetaMask, OKX Wallet, Rabby, WalletConnect, Coinbase Wallet, injected wallets, and Coin98.

4. Added a policy dashboard where users can view spending controls, active policy data, approved agents, allowed services, receipt activity, and demo proof flow.

5. Built the Create Policy page for defining max spend per transaction, daily limits, approval thresholds, and receipt requirements.

6. Built the Agents page for managing approved AI agents, service allowlists, revoked agents, and blocked services.

7. Added Pay Research, a Nous API-powered review flow that helps analyze research-related agent payment intent before approval.

8. Added Mind Vault, a private local context layer for saving payment reasoning, anonymized model views, proof hashes, and agent-payment memory.

9. Added Receipts, a proof surface where generated payment records can be reviewed, filtered, copied, and exported.

10. Added Agentic ID-ready profile UI for future verified AI-agent identity support.

11. Added a judge-friendly Demo route that walks through policy setup, agent approval, service allowlisting, approved payment flow, blocked payment flow, and receipt proof.

12. Captured and added live product screenshots to the README and Notion documentation.

13. Updated the Notion project page with a live screenshot gallery and clearer project narrative.

14. Improved typography using professional Inter and JetBrains Mono font handling.

15. Verified the project with lint, typecheck, build, smart contract compile, and tests during development.

The result is a cleaner, more complete hackathon deliverable that demonstrates how users can give AI agents useful spending power while keeping control through policies, allowlists, risk checks, receipts, and future 0G integrations.

---

## 14. Chamfer AI

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

WILL UPDATE

---

## 15. Creditfi 

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Product page:** https://app.akindo.io/products/K8EvOJWv0fpG8aDZ

### Product intro

The first AI-powered, reputation-based credit protocol for the autonomous agent economy.

CreditFi is a decentralized, reputation-based lending protocol built natively on the 0G Ecosystem. It allows autonomous AI agents and users to deposit collateral, receive an AI-computed credit score (ranging from 300 to 850), and borrow tokens instantly against their reputation.

Instead of treating every wallet equally, CreditFi rewards good financial behavior. As agents repay loans on time, their credit score increases. A higher credit score dynamically unlocks higher Loan-to-Value (LTV)…

### Updates in this Wave

CreditFi is the first AI-powered credit protocol for autonomous agents on the 0G Chain. In this wave, we delivered a premium, institutional-grade Next.js 16 Web3 app with a complete UI overhaul and live smart contract integrations.

Live Demo: https://0g-creditfi.vercel.app/                                                                                             GitHub: https://github.com/Cyptoboy777/Og-creditfi
video demo : https://youtu.be/EfsQMMBqnIA?si=9Sdrm11kNqo8yZ7s
🌟 Key Updates in this Wave:
Ultra-Premium Glassmorphic UI: Re-architected the main agent dashboard using Tailwind CSS and Framer Motion. Implemented a futuristic "cyber-finance" theme (deep space black, electric cyan, and violet gradients) with multi-layered glassmorphism to look trustworthy and modern.

3D-Pulsing Credit Score Engine: Built a dynamic <ScoreGauge /> component using CountUp and SVG gradients. Concentric ripples and circular indicators animate based on the agent's real-time credit score (300-850), mapping FICO-style credit tiers to LTV borrowing caps.

Gemini 2.5 Flash Risk Dossier: Integrated an interactive terminal-style "AI Examiner" panel. It reads the connected agent's live on-chain history (defaults, collateral, repaid amounts) and leverages Gemini 2.5 Flash via a secure server-side API to generate natural language underwriting audits.

Capital-Efficient Ledger Actions: Implemented full read/write tabs for position monitoring, deposits, withdrawals, borrowing, and debt settlement.

Safe LTV ceilings dynamically adjust based on on-chain credit scores (50% to 75% LTV).
Smart contract checks prevent withdrawals when active loans exist, protecting protocol solvency.
ERC-7857 Agentic ID Minting: Designed a dedicated card allowing agents to compile credit scores and transaction credentials into a unique identity NFT, preparing metadata for secure backup on 0G Storage.

Solvency & Security Checks:

Patched UI state logic ensuring failed transactions display correct error toasts instead of false success messages.
Deployed fully to the 0G Galileo Testnet (RPC chain 16602) with strict TypeScript compilation.
Enforced 100% test coverage with 28 passing unit tests verifying liquidations, interest math, and reentrancy blocks.

---

## 16. Credora

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Deliverable:** https://github.com/SavvySID/Credora
- **Product page:** https://app.akindo.io/products/Z4DknQ6xPIZQNx07

### Product intro

Privacy first credit intelligence for secure, trusted lending.

What it does
Credora is a decentralized credit intelligence platform that provides real-time, privacy-preserving creditworthiness assessments. It enables lenders, DeFi protocols, and institutions to access reliable credit data without exposing sensitive financial information.

The problem it solves
Traditional credit scoring is opaque, slow, and privacy-invasive. DeFi lacks trustworthy credit assessment, leading to high collateral requirements and exclusion of real-world borrowers. Credora…

### Updates in this Wave

In this wave, built a mvp, fully integrated 0G to make credit scoring and lending decentralized, verifiable, and scalable.

• 0G Integration – Loan, wallet, and activity data are now indexed and stored on 0G, enabling fast queries and verifiable records. Fallbacks ensure smooth use even if 0G is down.

• Credit Score Engine – Credit scores now leverage 0G for transparency, with badges showing “0G Verified” data.

• Loan Management – Repayments, extensions, and loan history create events stored on 0G, making lending auditable.

• Activity Feed – All actions are indexed in 0G with clear verification markers and optimized performance.

• User Experience – Improved UI/UX with tooltips, better cards, mobile responsiveness, and smooth navigation. 
UI rework in Progress.

Deliverable: https://credora-frontend-puce.vercel.app/

---

## 17. DevStation

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** linoxbt/dev-shipyard
- **Product page:** https://app.akindo.io/products/VwMOwqwgVcoQjger

### Product intro

The AI-powered developer console for building and shipping onchain applications.

What it does
DevStation is an AI-powered developer console designed for blockchain builders. It combines AI-assisted application generation/builder with blockchain development tools in a single workspace.

Developers can simply describe the application they want to build, and the AI agent generates the project while providing a live preview for rapid iteration. Once the application is ready, DevStation offers deployment tools, blockchain explorers, smart contract templates, transaction…

### Updates in this Wave

During this wave, DevStation evolved from a blockchain developer console into an AI-powered development workspace. The biggest addition is the AI application builder, which allows developers to describe an application in natural language and have an AI agent generate the project with a live preview for rapid iteration.

We also improved the developer experience by integrating project generation, blockchain tooling, smart contract templates, transaction inspection, and deployment workflows into a single interface. These updates significantly reduce the time required to go from an idea to a functional onchain application.

Live Demo: https://devstation.online
GitHub: https://github.com/linoxbt/dev-shipyard

---

## 18. FinPulse 0G

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **GitHub:** Hort1934/FinPulse-0G
- **Product page:** https://app.akindo.io/products/QlDrV0LxxhJ20QdO

### Product intro

AI crypto terminal leveraging 0G Chain and Storage for verifiable on-chain market intelligence.

What it does
FinPulse 0G is a Bloomberg-terminal-inspired AI command center designed for Web3. It provides a unified dashboard for real-time crypto market data (prices, ETF flows, BTC treasuries, news) and features an embedded AI agent. This agent isn't just a simple chatbot—it's a verifiable on-chain entity. Users can mint their personal AI broker as an Agentic ID (ERC-7857) on the 0G Chain, utilize 0G Pay for premium analytical deep dives, and anchor AI-generated market reports directly to 0G…

### Updates in this Wave

In this 2nd Wave, we successfully built the core foundation of FinPulse 0G and integrated it with the 0G ecosystem. 
Key updates include:
1. Developed the complete frontend Market Pulse dashboard (React/Vite) for real-time crypto intelligence visualization.
2. Built the backend infrastructure to handle API routing and AI agent context building.
3. Implemented Web3 integration on the 0G Galileo Testnet.
4. Deployed the 'Agentic ID' (ERC-7857) smart contract allowing users to mint their AI broker on-chain.
5. Integrated '0G Pay' micro-transactions, allowing users to pay for premium AI Deep Dives directly from their wallets.
6. Implemented a Proof system to anchor AI-generated market reports to the 0G Chain.

Deliverable URL: https://github.com/Hort1934/FinPulse-0G
Demo Video: https://youtu.be/wqFuk1GAbMM

---

## 19. Kavro Protocol

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

## 20. RecallMesh

- **Points:** 0
- **Money:** $0 recorded / not yet distributed (USDC)
- **Deliverable:** https://github.com/HackWithKiyomi/RecallMesh
- **Product page:** https://app.akindo.io/products/274kLWRKLfv81jV7

### Product intro

Verifiable memory infrastructure for AI agents on 0G.

What it does

RecallMesh is a decentralized memory infrastructure layer for AI agents built around the 0G ecosystem. It allows agents to create structured memory capsules, store important context, retrieve useful memory across sessions, and verify memory history through proof-based records.

The goal is to make AI memory portable, reusable, and trustworthy across applications instead of keeping it locked inside one centralized app.

The problem it solves

Most AI agents forget important context…

### Updates in this Wave

I improved RecallMesh and made it work around a clear testnet mode flow.

RecallMesh is now focused on 0G testnet usage, where users can test the product with wallet connection, testnet RPC, testnet contract setup, 0G Compute, and 0G Storage configuration. I removed confusion between demo and real usage by making the product flow centered on testnet mode.

I improved the frontend with a cleaner blockchain-style UI, dark and light theme support, better navigation, and more professional page layouts. The main sections now include Memory Vault, Agent Access, Proof Center, Integrations, Settings, Docs, References, and Roadmap.

The Memory Vault section now shows approved memories, memory categories, memory hash, storage root, vault status, and export options. The Agent Access section allows users to grant or revoke access for AI agents in a clearer way.

I also improved the Proof Center so users can see testnet activity such as memory extraction, user approval, vault creation, storage upload, chain registration, access granted, access revoked, and blocked access attempts.

The Settings and Integrations pages were updated to show testnet configuration status, including wallet connection, RPC URL, chain ID, contract address, compute status, storage status, and provider health.

Overall, this wave focused on making RecallMesh more polished, easier to use, and more ready as a 0G testnet product. The product now better shows how 0G Compute, 0G Storage, and 0G Chain can work together for user-owned AI memory and agent permission control.

---

## 21. sentinelAI

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

```text
What was built this wave:
- React + TypeScript frontend with glass-morphism UI, wallet connect (MetaMask), dashboard with portfolio stats, risk profile selector (Conservative/Balanced/Aggressive), and AI strategy generation panel showing allocation, protocols, risks, and entry/exit criteria
- FastAPI backend with portfolio service, strategy engine calling 0G Compute, and storage service logging to 0G Storage
- Solidity smart contracts with ReentrancyGuard, position management, and strategy hash tracking
- Hardhat config for 0G testnet (chain ID 16600)
- 10 meaningful git commits with clean architecture

URL: https://sentinel-ai.vercel.app

Status: Frontend deployed, contracts ready for testnet deployment once faucet tokens are received.
```

---
