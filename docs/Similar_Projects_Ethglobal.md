# Similar ETHGlobal projects: DAO + AI

Research dump for TokenFest. Scraped from the ETHGlobal showcase. Question: has anyone already shipped a **DAO-type product with AI integration**, and how close is it to TokenFest (event NFT crowdfunding + milestone payouts)?

**Source:** ETHGlobal Idea Validator pass, 28 Aug 2026.
**Listing:** [ethglobal.com/showcase](https://ethglobal.com/showcase)
**Verdict in one line:** 2 relevant projects (filtered); 1 prize winner; 1 non-winner scored 10. Focus is on event NFT crowdfunding + milestone escrow + 0G Storage proofs.

Worth scores (non-winners only): relevance 0–4, specificity 0–2, evidence 0–2, novelty 0–2. Relevance 0 → total 0; relevance 1 → cap 4. Winners are not scored — they are mandatory study.

---

## Index

| Project | Event | Winner? | Worth | Closest TokenFest piece | Showcase |
|---|---|---|---|---|---|
| Omniagent | ETHGlobal New York 2025 | Saga Best dApp on Saga Chainlet 1st | winner | AI writes proposal, chain executes | [omniagent-mxsn4](https://ethglobal.com/showcase/omniagent-mxsn4) |
| Construct | Open Agents | No badge | 10 | `validate()` rewritten as an agent on 0G | [construct-oycmy](https://ethglobal.com/showcase/construct-oycmy) |

---

## 1. Omniagent

- **Showcase:** https://ethglobal.com/showcase/omniagent-mxsn4
- **Event:** ETHGlobal New York 2025
- **Winner of:** Saga — Best dApp built on Saga Chainlet, 1st place
- **Worth:** winner (mandatory)
- **Repo:** listed as “Source Code” on the showcase page

### One-liner (listing)

AI-powered cross-chain DAO governance and treasury optimization platform.

### Project description (scraped)

AI-first DAO governance: automate proposal generation, treasury strategy, and on-chain execution.

- GPT-4 + real-time market and treasury data
- Cross-chain asset tracking
- Confidence-scored proposal creation
- Auditable on-chain execution
- Dynamic Labs wallet frontend

Claim: DAOs shift from manual governance to intelligent, scalable coordination.

### How it's made (scraped)

- Next.js 15 + Tailwind + shadcn/ui
- Dynamic Labs for wallet/session
- Wagmi + Viem
- Next.js API routes → OpenAI GPT-4 for proposal generation and confidence scoring
- Solidity via Hardhat 3 + Ignition, deployed on a Saga chainlet
- Biome + ESLint, GitHub Actions CI

### TokenFest overlap / diff

Overlap: “AI writes the proposal, chain executes it.” Diff: Omniagent is a **generic treasury copilot**. TokenFest’s proposal is an *event* with a sale price, goal, and yield rate — already a constructor, not an LLM essay.

### Why study

Full stack of AI-draft → confidence score → isolated-chain execution. Copy the confidence-score UI if an evidence agent returns APPROVE / ESCALATE.

---

## 2. Construct

- **Showcase:** https://ethglobal.com/showcase/construct-oycmy
- **Event:** Open Agents (also listed under ETHGlobal Cannes 2026 in some listing pages)
- **Winner of:** no prize badge on the project page
- **Worth: 10** — relevance 4, specificity 2, evidence 2, novelty 2
- **X:** founder post https://x.com/amjburge (Construct, autonomous escrow; low traction)

### One-liner (listing)

Autonomous construction escrow. AI plans the milestones, verifies the evidence, releases the money.

### Project description (scraped)

$200B/year construction for international development and disaster relief. 10–30% lost to ghost invoices, fake receipts, doctored photos, milestones that never existed. Construct attacks the **decision to release money**.

Loop:

1. Funder describes a project in plain English (or Ukrainian, Arabic, Swahili — six languages)
2. Claude generates structured milestones with **literal acceptance criteria** and confidence ratings: AI Verifiable / Partially Verifiable / Likely Needs Human
3. Funder reviews, locks, and deploys — funds a smart contract on **0G** in one transaction
4. Builder submits evidence as work progresses
5. Trust stack **before** any LLM judgment: EXIF, C2PA content credentials, Reality Defender deepfake detection, pricing oracle vs expected ranges
6. Claude Vision reads evidence against criteria → APPROVE or ESCALATE
7. On approve, an MPC wallet (Turnkey, via KeeperHub) signs `completeMilestone()` on-chain. No single party, including Construct, holds the key
8. Every project gets a wrapped ENS subname `yourproject.construct.eth` on Sepolia. Status, current milestone, escrow address live in text records. NFT transfer = handover to a successor; records repoint to a fresh escrow. One project identity, multiple escrows over its life

No private key on their servers. No human click on the happy path. Fees shown upfront.

### How it's made (scraped)

**Stack:**

- Solidity `MilestoneEscrow.sol` on **0G Galileo (chain ID 16602)**, Hardhat + ethers v6
- Express/Node ESM backend: `agent/` (Claude), `trust-stack/` (provenance), `storage/` (0G Storage + ENS), `keeperhub/` (MPC + ENS sync), `routes/`
- React 19 + TypeScript + Vite, wagmi v2, viem, RainbowKit

**Pipeline details:**

- Claude Sonnet tool-use for milestone generation
- Full spec uploaded to **0G Storage**; content hash baked into the escrow at deploy
- Funder funds escrow + agent fee from their own wallet (no custody)
- Raw image buffer preserved before `sharp` resize (sharp strips EXIF)
- `onlyOwnerOrAgent` modifier; agent address set at deploy; swap-ready for ERC-4337 when AA lands on 0G
- KeeperHub self-hosted because Galileo was not on the hosted instance; chain rows added via SQL
- After every 0G milestone release, MPC writes ENS text record deltas on Sepolia
- Translation is display-only; canonical milestone text never mutated

**Hacks they documented:** PublicResolver approval vs NameWrapper; handover writes *before* NFT transfer; patched KeeperHub 0.1 gwei min priority fee for Sepolia; poll contract state because 0G RPC indexer lags events.

**Partner justification:** 0G Storage network-level content hash is the lookup key. KeeperHub runs three workflows (completeMilestone on 0G, wrapped subname mint on Sepolia, setText on PublicResolver). ENS is portable identity across chains. Claude does planning *and* vision verification.

### TokenFest overlap / diff

**This is TokenFest’s money machine in another industry.**

| TokenFest today | Construct |
|---|---|
| Organizer `submitMileStoneInfo(ipfs)` | Claude writes criteria, hash on 0G Storage |
| Organizer `withdrawFunds` then **pauses** | Escrow holds until evidence passes |
| Human `onlyOperator validate()` | Vision model + provenance stack |
| AccessMaster operator | MPC agent signer |
| Event NFT tickets | Construction project NFT / ENS identity |

Diff: construction vertical, six-language UI, ENS project identity. Not events, not ticket sales, not yield share.

### Why study

Study this first. It is TokenFest’s `validate()` rewritten as an agent, already on 0G. Steal: content-addressed milestone spec, evidence-before-release, escalate-to-human on low confidence. Do not steal the construction vertical unless you have extra days.

---

## Patterns worth copying

1. **Evidence before release (Construct).** Trust stack (EXIF / C2PA / deepfake) runs *before* the LLM. Then vision vs literal criteria. Escalate, do not auto-pass, on low confidence.
5. **Agent wallet that mints (Artix).** If POAPs / tickets are agent-minted, AgentKit-style wallet on the organizer or protocol side, not the user.
6. **Confidence labels (Construct, Omniagent).** `AI Verifiable / Partially Verifiable / Likely Needs Human` is a better demo than a silent pass.

## Patterns not worth copying for Wave 3

- Telegram DAO launcher (DAO Wizard) — already a winning cliché
- “Agents vote so humans don’t have to” (ASAP) — TokenFest has no vote
- Five-persona treasury debate (AI Treasury Council product, not its storage loop)

---

## What this means for TokenFest

**DAO + AI is validated and competitive.** Agentic Ethereum 2025 produced a cluster of AgentKit-prize DAO tools (Wizard, ASAP, DAOCouncil, AI DAO Managers, Artix). Open Agents 2026 produced DAIO as a finalist plus several 0G treasury/agent-governance writes.

**Event NFT crowdfunding + milestone expense checks is not.** No TokenFest clone with AI showed up. Artix is DAO + NFT + agent wallet, but a meme contest. Construct is milestone escrow + AI, but construction aid.

Two readings of the empty slot: real opening (events still use a human operator), or unvalidated (hackathon teams pick a governance chatbot because it demos in 90 seconds). TokenFest already has Collab/Holder contracts, so the empty slot is usable — you are not starting from a Telegram bot.

**Do not pivot into another AI DAO.** Spend the remaining Wave 3 time replacing `onlyOperator validate()` with an evidence agent (Construct’s trick), persist the verdict on 0G Storage, write the root on 0G Chain.

**Demo kill-shot:** mint a ticket → organizer submits a fake receipt that fails → real receipt that passes → next tranche releases on explorer. Three minutes, one loop, 0G on screen.

---

## Page status

Prize claims and pages go stale. Each “Winner of” line above was read from the live showcase page at scrape time (28 Aug 2026). Re-open the link before putting a prize name in a pitch deck.
