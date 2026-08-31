# Sprkclub UI

Next.js App Router port of the dark Sprkclub demo UI (DAO + NFT proposals, voting, crowdfunding).

## Stack

- Next.js (App Router) + React 19
- Tailwind CSS v4 (`src/styles.css`)
- Zustand (client state, hydrated from the API)
- Neon Postgres + Drizzle ORM (proposals, votes, backers, milestones)
- RainbowKit + WalletConnect (real wallet connection)
- Radix UI + lucide-react + sonner
- wagmi + viem (real wallet on 0G Chain)
- `@0glabs/0g-ts-sdk` (0G Storage, server-side only)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local Next.js server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run db:generate` — regenerate SQL from `src/lib/db/schema.ts`
- `npm run db:migrate` — apply migrations to Neon
- `npm run db:seed` — load the demo proposals (skips ids that already exist)
- `npm run abi:sync` — re-export contract ABIs from the Foundry build

## App routes

| Path | Page |
|------|------|
| `/` | Home |
| `/launch` | Create proposal |
| `/explore/ongoing-proposals` | Voting proposals |
| `/explore/crowdfunding-events` | Crowdfunding list |
| `/explore/crowdfunding-events/[id]` | Event detail + milestone escrow |
| `/dashboard/crowdfunding-events` | Backed events |
| `/dashboard/started-events` | Started events + milestone escrow |
| `/proposal/[id]` | Proposal detail |
| `/faucet` | Testnet stable faucet helper |

UI components live under `src/components`; shared lib under `src/lib`.



---

# Data & wallets

## Neon Postgres

Off-chain app state lives in Neon, not `localStorage`. Four tables
(`src/lib/db/schema.ts`): `proposals`, `votes`, `backers`, `milestones` —
addresses stored lowercased, votes unique per `(proposal, wallet)`, and children
cascade on proposal delete.

```bash
npm run db:migrate   # create tables
npm run db:seed      # load the four demo proposals
```

Reads and writes go through Route Handlers:

| Route | Purpose |
|---|---|
| `GET /api/proposals` | All proposals with votes, backers and milestones joined |
| `POST /api/proposals` | Create a proposal (attributed to the connected wallet) |
| `GET /api/proposals/:id` | One proposal |
| `POST /api/proposals/:id/actions` | `vote`, `convert`, `stake`, `mint`, `withdraw`, `dispute`, `claimback`, `submit-milestone` |
| `POST /api/milestones/:addr/:index/proof` | Upload proof → 0G Storage → `submitMileStoneProof` |
| `POST /api/milestones/:addr/:index/evaluate` | 0G Compute scorecard → Storage → `recordAuditRoot` |
| `GET /api/storage/:rootHash` | Download proof/scorecard bytes by root |

Every mutation re-reads the proposal server-side and checks the rules there —
creators cannot vote on their own proposal, only backers can dispute, minting
requires the creator to have staked, and so on. The client never decides.

**On the trust boundary:** these routes take the caller's wallet address from
the request body and validate its *shape* only — they do not prove key
ownership. That is deliberate and safe for what they guard, which is off-chain
bookkeeping. Everything that moves value or settles disputes is enforced on-chain
(`onlyProposalCreator`, `onlyRelayer` for audit roots, wallet-signed
`challenge` / `vote` / `finalizeMilestone` / `resolveChallenge`). A forged
address here cannot bypass those gates. Add a SIWE signature check before
treating this as an authorization boundary in its own right.

## Wallet connection

Real wallets via RainbowKit over the WalletConnect protocol, configured in
`src/lib/chain/wagmi.ts`. `useAddress()` returns the connected account.
Milestone unlock is **not** gated by an AgenticVerifier NFT — anyone may
challenge, ticket holders vote, and anyone may finalize after a clean window.

WalletConnect QR and mobile wallets need a free project id from
[cloud.walletconnect.com](https://cloud.walletconnect.com):

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your id>
```

Without it the app still works — the WalletConnect option is dropped from the
list and injected wallets (MetaMask, Rabby, Trust, Safe) are used instead.

The wallet list is built explicitly with `connectorsForWallets` rather than
`getDefaultConfig`, and `next.config.ts` aliases a handful of `@x402/*` modules
to `src/lib/chain/x402-stub.ts`. Both work around the same thing: the Coinbase
Smart Wallet connector bundled in `@wagmi/connectors` lazily imports optional
payment packages that aren't installed. They never execute — the bundler just
has to resolve them.

---

# 0G integration

Optimistic milestone escrow on **0G Chain + 0G Storage + 0G Compute**.
**Agentic ID / ERC-7857 is not used** on the money path.

A creator's proof is stored on 0G Storage and rooted on-chain. The server grades
it with 0G Compute (or honest **Fallback Mode**), stores the scorecard, and the
relayer calls `recordAuditRoot` to start a 7-day dispute window. Anyone may
`challenge` (10 stable bond); ticket holders `vote`; anyone may `finalize` or
`resolveChallenge`. The AI scorecard is **advisory** — it never unlocks funds.

## Architecture

```
Creator's proof file
        │
        ▼
POST /api/milestones/:proposalAddr/:index/proof
        ├─► 0G Storage ──► proof Merkle root
        └─► submitMileStoneProof(rootHash)     (creator / helper key)
        │
        ▼
POST /api/milestones/:proposalAddr/:index/evaluate
        ├─► 0G Compute rubric scorecard (else Fallback Mode)
        ├─► 0G Storage ──► audit Merkle root
        └─► recordAuditRoot(index, root)       (relayer only)
        │
        ├── no challenge ──► finalizeMilestone()
        └── challenge(bond) ──► vote ──► resolveChallenge()
```

The browser never calls 0G Storage directly. Relayer signs Storage +
`recordAuditRoot` only. Dispute txs are wallet-signed via wagmi.

## 0G modules used

| Module | How it is used |
|---|---|
| **0G Chain** | `SprkClubCollab` (+ factory), `AccessMaster`, mock stablecoin on Galileo `16602`. Proof roots, audit roots, challenge / vote / finalize are real txs. |
| **0G Storage** | Proof files and scorecard JSON are content-addressed by Merkle root. See degraded-upload caveat below. |
| **0G Compute** | Advisory rubric scorecard via Serving Router (`og-compute.ts`). Labeled **Fallback Mode** when the router/key is unavailable — still writes an audit root. |

**Not used:** Agentic ID / ERC-7857. Do not claim it in submissions.

Contract sources: `deps/smart_contracts` (mirrors sibling `sprkclub-smartcontract`).
Verifier compute/sanitize patterns were reused from `deps/sprkclub-verifier`
for the advisory scorecard path (not the old `validate()` bot).

## Deployed addresses (0G Galileo testnet, chain 16602)

Optimistic dispute deploy (no AgenticVerifier on money path):

| Contract | Address |
|---|---|
| `AccessMaster` | `0x1c78C8D3EF0506bF4d6Af08E8C1b41D150A57CF3` |
| `SprkToken` (stablecoin) | `0x0E92016aF2fddC74D9709E9c26E1D95d2DC7f311` |
| `SprkClubCollabFactory` | `0xCF7D80C69E93B8a728059EB605586c4373F71514` |
| `SprkClubCollab` (sample) | `0x84eFcd6291168f3E3C618a28757eFB4B4344FC0F` |
| Relayer / Creator / Deployer | `0xF0258C922928eB7B37C1B28201609Efa2437e29d` |

Explorer: <https://chainscan-galileo.0g.ai>

## Known limitations — read this

**1. 0G Storage uploads may degrade to root-only.**
`@0glabs/0g-ts-sdk@0.3.3` can fail `Flow.submit` on the current Galileo Flow
implementation. The Merkle root is still computed locally and recorded on-chain;
responses carry `degraded: true` and the UI badges **Degraded Storage**. Set
`OG_STRICT_STORAGE=1` to fail hard instead.

**2. Compute is advisory.** The scorecard helps challengers and voters. It never
calls `finalize`. Fallback Mode is labeled when 0G Compute is unavailable.

## Environment

Create `.env.local`:

```bash
OG_PRIVATE_KEY=<hex key, funded on 0G; server-side only, never NEXT_PUBLIC_>
# Prefer the on-chain relayer key for recordAuditRoot; for demo collabs where
# the same key is creator+relayer, one key covers proof submit + audit root.
NEXT_PUBLIC_OG_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<id>   # optional
OG_COMPUTE_API_KEY=<0G Compute router key>  # optional — without it, Fallback Mode
# OG_COMPUTE_BASE_URL=https://router-api-testnet.integratenetwork.work/v1
# OG_COMPUTE_MODEL=qwen2.5-omni
# OG_STRICT_STORAGE=1
```

Neon credentials (`DATABASE_URL` and friends) live in `.env`. Both files are
gitignored.

## Reproducing the flow

```bash
pnpm install
pnpm dev   # start yourself — do not expect agents to boot servers
```

Then:

1. Open a crowdfunding event / started-events dashboard on 0G Galileo.
2. As creator, submit a milestone proof — Storage root + on-chain proof.
3. AI audit runs (Compute or Fallback Mode) and `recordAuditRoot` starts the window.
4. Challenge with bond, vote with tickets, or finalize after 7 days.

```bash
# Read proof roots
curl "http://localhost:3000/api/milestones/0x84eFcd6291168f3E3C618a28757eFB4B4344FC0F/0/proof"

# Upload a proof
curl -F "file=@./README.md" \
  "http://localhost:3000/api/milestones/0x84eFcd6291168f3E3C618a28757eFB4B4344FC0F/0/proof"

# Run evaluate / read scorecard
curl -X POST "http://localhost:3000/api/milestones/0x84eFcd6291168f3E3C618a28757eFB4B4344FC0F/0/evaluate" \
  -H "content-type: application/json" \
  -d '{"proposalTitle":"Demo","proposalDescription":"…"}'
```

### Mainnet

Contracts are **not** deployed to 0G mainnet (chain `16661`) yet. Deploy with
the Foundry script in `sprkclub-smartcontract`, fill `MAINNET_DEPLOYMENT` in
`src/lib/chain/config.ts`, and set `NEXT_PUBLIC_OG_NETWORK=mainnet`.
