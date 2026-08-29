# Sprkclub — Current UI Flow

This documents the UI flow as it exists in `front-end/src/` today. It does
not describe planned features (0G Storage proof upload, AgenticVerifier
review UI, etc.) — those are tracked separately. Where a screen is a mock
or disconnected from the chain, that is called out explicitly.

## Stack

- Next.js App Router (`front-end/src/app/`)
- Wallet connection: Thirdweb (`ConnectWallet` in `Nav`, `ThirdwebProvider`
  in `layout.tsx`), `activeChain="mumbai"` (Polygon Mumbai testnet),
  wallets: MetaMask, Coinbase Wallet, WalletConnect, embedded wallet.
- Direct on-chain calls elsewhere use raw `ethers.js` + hardcoded ABI
  imports (`src/abi/TokenStarterCollab.json`, `src/abi/MyToken.json`), not
  Thirdweb's contract hooks — the two wallet/contract layers aren't unified.
- Shared client state: `ProposalProvider` (`src/ContextProviders/ProposalProvider.tsx`)
  — a single in-memory React context holding one `proposal` object (title,
  description, price/NFT, funding goal, type, date) plus a `votes` /
  `votesPercentage` pair. **This holds no on-chain data and there is no
  reset for it** — it's form state passed between screens, not a proposal
  registry. Only one "proposal" can exist in the app's memory at a time.

## Top-level navigation (`components/common/Nav/index.tsx`)

Three dropdown menus plus a wallet-connect button, rendered on every page
via `layout.tsx`:

- **Launch**
  - Create Proposal → `/launch/create-proposal`
  - Convert Proposal → `/launch/convert-proposal`
- **Explore**
  - Ongoing Proposals → `/explore/ongoing-proposals`
  - Crowdfunding Events → `/explore/crowdfunding-events`
- **Dashboard**
  - Crowdfunding Events → `/dashboard/crowdfunding-events`
  - Started Events → `/dashboard/started-events`

**Gap:** the Dashboard menu's two links point at `/dashboard/...` routes.
No `dashboard` directory exists under `front-end/src/app/` — these are
dead links (404 in a real run).

Home page (`app/page.tsx`) is a static hero: the Sprkclub wordmark/logo
and the tagline "A Dao + NFT where people make their dreams real." No
links, no dynamic content.

## Launch flow

### Step 1 — Create Proposal (`/launch/create-proposal`)

Component: `components/launch/CreateProposal/index.tsx`

A Formik form collecting: title, description, price per NFT, funding
goal, proposal type (radio: "Sprkclub Collab" / "Sprkclub Holder" —
matching the two contract variants), and a "valid till" date.

On submit: calls `setProposal(values)` into `ProposalProvider`'s context
and shows a success toast ("`<title>` has been created"). **No contract
call happens here.** This step only stores the form data in memory for
the next screen to read.

### Step 2 — Proposal Summary (`/launch/convert-proposal`)

Component: `components/launch/ProposalSummary/index.tsx`

Reads `proposal` from context. If nothing was set in Step 1, shows an
empty-state animation ("No ongoing proposal") — meaning this route is
unusable unless visited immediately after Create Proposal in the same
session (context isn't persisted, so a page refresh loses it).

If a proposal exists: displays title, description, and a **hardcoded**
"✅ 55% of voters love your proposal" line (not read from anywhere — no
voting mechanism exists on-chain or elsewhere in this component). A
"Launch" button opens a modal containing `ConvertModal`.

### Step 3 — Convert Modal (inside the Step 2 modal)

Component: `components/launch/ConvertModal/index.tsx`

Another Formik form, pre-filled from the Step 1/2 proposal data, adding:
stablecoin choice (USDT / USDC / MATIC — a plain dropdown, not tied to
any real token address), starting date, ending date.

On submit ("Launch crowdfunding" button): shows a "Proposal Converted"
toast. **No contract deploy, no `TokenFestCollab`/`TokenFestHolder`
instantiation, no on-chain call of any kind happens.** The entire Launch
flow (Steps 1–3) is a UI mock — it collects proposal parameters but never
submits them anywhere. There's no code path from this flow to the actual
constructor calls used in `scripts/launch/launch.js`.

## Explore flow

### Ongoing Proposals (`/explore/ongoing-proposals`)

Component: `components/explore/Ongoing/index.tsx`

Reads the same single `proposal` from context (so this only ever shows
whatever was last entered in the Launch flow — not a list, and not
sourced from chain). Displays title, description, price/NFT, funding
goal, valid-till date, and "Created by: `<connected wallet address>`"
(via Thirdweb's `useAddress()` — this is just the current visitor's
address, not necessarily the actual proposal creator).

Below that: a like/dislike (👍/👎) radio-button "vote" form. Submitting
increments an in-memory `votes.likes`/`votes.dislikes` counter in
`ProposalProvider` and shows a toast. **This is entirely client-side and
resets on refresh — there is no on-chain or persisted voting mechanism**,
despite `README.md`'s narrative describing community voting as core to
proposal validation.

### Crowdfunding Events (`/explore/crowdfunding-events`)

Component: `components/explore/Crowdfunding/index.tsx`

This is the **only screen in the app with real contract wiring**. On
mount it:
- Hardcodes an ERC20 token address (`0x8563F7...`) and a
  `TokenFestCollab`-shaped contract address (`0x2D47f9...`) — not derived
  from anything created in the Launch flow, not read from an env var.
- Builds `ethers.Contract` instances for both using
  `window.ethereum` as the provider (MetaMask-style injected wallet —
  separate from the Thirdweb `ConnectWallet` used in `Nav`; a user must
  have both connected/compatible for this page to work).
- Reads `salePrice`, `crowdFundingGoal`, `totalSupply` from the staking
  contract to compute a funding total.

Still gated behind the same `proposal` context check as other Explore
pages (shows "No Crowdfunding Event" empty state if nothing was set in
Launch), so in practice a user must have gone through Create Proposal
first, even though this page's actual contract interaction is against
the hardcoded addresses, unrelated to that proposal's data.

UI states, based on local component state (not all read from chain):
1. **Not staked**: "Stake Token" button → calls `handleStake()`, which
   `approve()`s the ERC20 for a hardcoded `2000000000000000000` (2
   tokens) and calls `stakingContract.stake(...)` with that same
   hardcoded amount — **not** derived from `crowdFundingGoal * 20%` as
   the contract's actual staking requirement is (`TokenFestCollab.sol`'s
   `stake()` requires exactly 20% of `crowdFundingGoal`). This will
   revert against a real deployment unless the funding goal happens to
   make 2 tokens equal 20%.
2. **Staked**: "Mint NFT" button → calls `handleMint()`, which
   `approve()`s the sale price then calls `stakingContract.mintTicket()`
   — this call is correct relative to the contract (`mintTicket()` takes
   no arguments in `TokenFestCollab.sol`).
3. **Minted**: shows three buttons — "Withdraw Funds", "Dispute",
   "Claimback" — **none of these have `onClick` handlers**. They render
   but do nothing when clicked. This is where operator/creator/refund
   actions (`withdrawFunds`, `claimback`, and any dispute mechanism)
   would need to be wired up; today they're visual placeholders only.

A funding-progress bar renders once staked, but its width is a hardcoded
`5%` and the displayed value is a fixed `2/5 ETH` — not computed from
`totalFunding`/`crowdFundingGoal` despite those being fetched.

**Gap:** there is no `TokenFestHolder` path anywhere in the frontend —
`Crowdfunding` only imports and calls against `TokenStarterCollab.json`'s
ABI, even though Create Proposal's form offers a "Sprkclub Holder"
radio option. Selecting Holder in Step 1 has no effect on which contract
this page talks to.

## Operator / validation actions — no UI at all

`TokenFestCollab.sol`/`TokenFestHolder.sol`'s `validate()` (operator
approves/rejects a milestone) and `submitMileStoneInfo()` (creator
submits milestone proof) have **no corresponding UI anywhere in
`front-end/src/`**. These are on-chain-only actions today — an operator
or creator would need to call them directly via a script or block
explorer; there is no page, button, or form in the app for either.

## Flow diagram (current, as implemented)

```
                         ┌─────────────┐
                         │  Nav (all   │
                         │   pages)    │──────► ConnectWallet (Thirdweb)
                         └──────┬──────┘
                                │
        ┌───────────────┬──────┴───────┬────────────────┐
        ▼               ▼              ▼                ▼
   Home ("/")      Launch          Explore          Dashboard
                                                    (dead links,
                                                     no routes exist)
        │               │              │
        │               ▼              │
        │     ┌─────────────────┐      │
        │     │ Create Proposal │      │
        │     │  (form only —   │      │
        │     │  no chain call) │      │
        │     └────────┬────────┘      │
        │              │ setProposal() into React context
        │              ▼               │
        │     ┌─────────────────┐      │
        │     │ Proposal Summary│      │
        │     │ (/convert-      │      │
        │     │  proposal)      │      │
        │     └────────┬────────┘      │
        │              │ opens modal   │
        │              ▼               │
        │     ┌─────────────────┐      │
        │     │  Convert Modal  │      │
        │     │ (form only —    │      │
        │     │ no chain call)  │      │
        │     └─────────────────┘      │
        │                              │
        │              ┌───────────────┴───────────────┐
        │              ▼                                ▼
        │   ┌────────────────────┐          ┌───────────────────────┐
        │   │ Ongoing Proposals  │          │ Crowdfunding Events    │
        │   │ (reads same        │          │ (only screen with real │
        │   │  context proposal; │          │  chain calls — hard-   │
        │   │  fake like/dislike │          │  coded contract addrs, │
        │   │  vote, in-memory   │          │  stake()/mintTicket()  │
        │   │  only)             │          │  wired; Withdraw/      │
        │   └────────────────────┘          │  Dispute/Claimback     │
        │                                    │  buttons are inert)   │
        │                                    └───────────────────────┘
        │
        ▼
  (static hero, no
   further navigation)
```

## Summary of gaps

- Launch flow (Create Proposal → Proposal Summary → Convert Modal) never
  calls a contract — it's a disconnected UI mock.
- Dashboard nav links point to routes that don't exist.
- `Ongoing Proposals`' voting is fake and in-memory; no on-chain voting
  exists anywhere in the contracts either.
- `Crowdfunding Events` talks to hardcoded contract addresses unrelated
  to whatever was entered in Launch, uses a wrong hardcoded stake amount
  instead of computing 20% of the funding goal, and has three dead
  buttons (Withdraw Funds, Dispute, Claimback).
- `TokenFestHolder` (the yield-sharing contract variant) has no frontend
  path at all — only `TokenFestCollab` is wired.
- No UI exists for milestone submission or operator validation
  (`submitMileStoneInfo`, `validate()`) — both are on-chain-only actions
  today.
- Two separate wallet/provider layers are in play (Thirdweb's
  `ConnectWallet` in `Nav`, raw `window.ethereum` + `ethers.js` in
  `Crowdfunding`) that aren't unified — a user could connect via Thirdweb
  and still have `Crowdfunding`'s direct `window.ethereum` calls behave
  independently.
