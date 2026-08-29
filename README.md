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
| `/launch/create-proposal` | Create proposal |
| `/launch/convert-proposal` | Convert passed proposal |
| `/explore/ongoing-proposals` | Voting proposals |
| `/explore/crowdfunding-events` | Crowdfunding list |
| `/explore/crowdfunding-events/[id]` | Event detail |
| `/dashboard/crowdfunding-events` | Backed events |
| `/dashboard/started-events` | Started events + operator queue |
| `/proposal/[id]` | Proposal detail |
| `/milestones` | 0G milestone proofs + operator review |

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
| `POST /api/proposals/:id/actions` | `vote`, `convert`, `stake`, `mint`, `withdraw`, `dispute`, `claimback`, `submit-milestone`, `review-milestone` |

Every mutation re-reads the proposal server-side and checks the rules there —
creators cannot vote on their own proposal, only backers can dispute, minting
requires the creator to have staked, and so on. The client never decides.

**On the trust boundary:** these routes take the caller's wallet address from
the request body and validate its *shape* only — they do not prove key
ownership. That is deliberate and safe for what they guard, which is off-chain
bookkeeping. Everything that moves value or unlocks funds is enforced on-chain
by `onlyProposalCreator` / `onlyOperator`, which a forged address here cannot
bypass. Add a SIWE signature check before treating this as an authorization
boundary in its own right.

## Wallet connection

Real wallets via RainbowKit over the WalletConnect protocol, configured in
`src/lib/chain/wagmi.ts`. The old five-slot demo wallet switcher is gone:
`useAddress()` now returns the connected account, and "who is the operator" is
answered on-chain by `AgenticVerifier.balanceOf(caller) > 0` rather than by a
hardcoded address.

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

Milestone delivery is proved on 0G rather than by a trusted link. A creator's
proof file is hashed into a **0G Storage** Merkle root, that root is recorded on
**0G Chain**, and only the holder of an **ERC-7857 AgenticVerifier** NFT can
validate the milestone and unlock the next tranche.

## Architecture

```
Creator's proof file
        │
        ▼
POST /api/milestones/:proposalAddr/:index/proof   (Node runtime, server-side)
        │
        ├─► 0G Storage ──► Merkle root (bytes32)
        │
        ▼
submitMileStoneProof(rootHash)        on SprkClubCollab / SprkClubHolder
        │                              (gated by onlyProposalCreator)
        ▼
milestoneProofRoots[milestoneIndex] ──► read back by the UI
        │
        ▼
Operator holding AgenticVerifier NFT + AccessMaster FLOW_OPERATOR_ROLE
        │
        ▼
validate(pass, reject)  ──►  unpause next tranche / reject / clear
```

The browser never calls 0G Storage directly: the SDK's upload path signs a
transaction with a server-held key and its download path uses Node filesystem
APIs. All Storage access goes through the API routes.

## 0G modules used

| Module | How it is used |
|---|---|
| **0G Chain** | `SprkClubCollab`, `SprkClubHolder`, `AgenticVerifier`, `AccessMaster` and a mock stablecoin are deployed on Galileo (chain `16602`). Proof roots and `validate()` calls are real transactions. |
| **0G Storage** | Milestone proof files are content-addressed by Merkle root via the turbo indexer. See the known limitation below. |
| **Agentic ID (ERC-7857)** | `AgenticVerifier` is an ERC-721 whose metadata points at an encrypted 0G Storage rubric blob. `validate()` requires `verifier.balanceOf(caller) > 0`, so the right to review milestones is a transferable on-chain asset. |

0G Compute and 0G DA are **not** used — they are not claimed anywhere in this repo.

## Deployed addresses (0G Galileo testnet, chain 16602)

| Contract | Address |
|---|---|
| `AccessMaster` | `0x1c1A950C00bfEFFef4a9C0FF580a2bd2135B6C27` |
| `MyToken` (mock stablecoin) | `0x0A550c1ad0Db4543a186C146DAb64D97eF27DAD0` |
| `AgenticVerifier` | `0xdF48680B583b5B8e45Bf44850D6BFa1ec45a595D` |
| `SprkClubCollab` | `0x24C495F703E6B9ccd93694eDb51611eb68B09Fb5` |
| `SprkClubHolder` | `0x8855e29BcD98AA1F63f93d44E0169D3704c95101` |

Explorer: <https://chainscan-galileo.0g.ai>

Example `submitMileStoneProof` transactions recording real 0G Storage Merkle
roots on-chain:

- [`0xa12eb18d…`](https://chainscan-galileo.0g.ai/tx/0xa12eb18d24747aff3ae5bead94ddc8a4f5a85c3d2d88e8226dcec92331ed2ef7)
- [`0x5d4ee8cf…`](https://chainscan-galileo.0g.ai/tx/0x5d4ee8cff43bf6021334e1ee040d7a607b85656a9abfae54f2cab341789bf5c4)

Contracts live in `deps/sprkclub-smartcontract` (Foundry, `forge test` → 26 passing).

## Known limitations — read this

Two things are deliberately not what they might appear. Both are stated here
rather than hidden.

**1. `AgenticVerifier.verifyProof()` is a stub that always returns `true`.**
ERC-7857's entire value is oracle-verified re-encryption on transfer: a real
implementation decrypts inside a TEE (or proves via ZKP), generates a fresh key,
re-encrypts for the recipient, and returns a proof the contract verifies. This
build does not do that. The production design would run attestation on 0G
Compute (Intel TDX / NVIDIA H100–H200) and replace the stub. The NFT-gated
`validate()` path is genuine; only the transfer-time re-encryption proof is not.

**2. 0G Storage uploads currently degrade to root-only.**
`@0glabs/0g-ts-sdk@0.3.3` (latest published) encodes `Flow.submit` as selector
`0xef3e12dc`. That selector is **absent from the Flow implementation currently
deployed on Galileo** (proxy `0x22E03a…5296` → impl `0xF99cccc…292F`), so every
upload transaction reverts regardless of `msg.value`. The network itself is
healthy — its storage nodes report chain `16602` and ~148k submissions, and
`submissionIndex()` agrees.

The Merkle root is computed locally by the same SDK and is correct, so the
on-chain proof trail is real and verifiable. What is missing is retrieval of the
original bytes from a storage node. Responses carry `degraded: true` when this
happens and the UI says so explicitly. Set `OG_STRICT_STORAGE=1` to turn the
degraded path into a hard failure once a fixed SDK ships — no other code change
is needed.

## Environment

Create `.env.local`:

```bash
OG_PRIVATE_KEY=<hex key, funded on 0G; server-side only, never NEXT_PUBLIC_>
NEXT_PUBLIC_OG_NETWORK=testnet          # or "mainnet"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<id> # optional; enables WalletConnect QR
# OG_STRICT_STORAGE=1                   # fail instead of degrading on Storage errors
```

Neon credentials (`DATABASE_URL` and friends) live in `.env`. Both files are
gitignored.

`OG_PRIVATE_KEY` signs Storage uploads and `submitMileStoneProof`, so it must be
the proposal creator's key for the on-chain write to pass `onlyProposalCreator`.

## Reproducing the flow

```bash
npm install
npm run dev
```

Then:

1. Open `/milestones` and connect a wallet on 0G Galileo.
2. As the proposal creator, upload a proof file — the response returns the 0G
   Storage Merkle root and the on-chain transaction hash.
3. As the AgenticVerifier NFT holder, approve or reject the milestone. A wallet
   without the NFT sees `validate()` revert, which is the gate working.

To verify from the command line:

```bash
# Read the proof roots recorded on-chain
curl "http://localhost:3000/api/milestones/0x24C495F703E6B9ccd93694eDb51611eb68B09Fb5/0/proof"

# Upload a proof file (Storage + on-chain record)
curl -F "file=@./README.md" \
  "http://localhost:3000/api/milestones/0x24C495F703E6B9ccd93694eDb51611eb68B09Fb5/0/proof"
```

### Mainnet

Contracts are **not** deployed to 0G mainnet (chain `16661`) — it needs real 0G
with no faucet. The config is ready: deploy with the Foundry script in
`deps/sprkclub-smartcontract`, fill `MAINNET_DEPLOYMENT` in
`src/lib/chain/config.ts`, and set `NEXT_PUBLIC_OG_NETWORK=mainnet`.
