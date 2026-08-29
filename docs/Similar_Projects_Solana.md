# Similar Solana projects: legends.fun and MetaDAO

Research dump for TokenFest. Only two Solana products are worth sitting with: **legends.fun** (discovery + proof-of-traction) and **MetaDAO** (futarchy launchpad + unruggable treasury). Everything else in the Colosseum Arena that looks like “NFT tickets” or “milestone crowdfund” is a thin hackathon clone. These two are live products with real mechanism design.

**Sources:** official sites and docs, Colosseum Copilot project page for legends.fun, Galaxy / Messari / Helius write-ups on MetaDAO. Scraped 28 Aug 2026.

**Verdict in one line:** legends.fun is how Solana *discovers* products before they raise. MetaDAO is how Solana *holds the money* after they raise. TokenFest is neither. TokenFest is how an *event* raises, pauses, and releases cash in tranches. Steal mechanism pieces, not the product.

---

## How they sit relative to TokenFest

```
pre-raise attention              capital formation                 event operations
legends.fun  ------------------  MetaDAO  -----------------------  TokenFest
lock SOL to back a listing       ICO + market-governed treasury    NFT tickets, 20% stake,
weighted traction, hunter fees   monthly budget cap, PASS/FAIL     milestone pause, operator
                                 TWAP                              validate()
```

- **legends.fun** never holds an event treasury. It scores *belief* with locked SOL.
- **MetaDAO** never sells tickets. It sells **ownership coins** and then refuses to let the founder walk with the bag.
- **TokenFest** already has the third column on EVM (`TokenFestCollab` / `TokenFestHolder`). The interesting question is which of their *trust tricks* you should steal for 0G Wave 3.

Neither product is AI. If TokenFest adds an evidence agent, that is a third thing, not a clone of these two.

---

# 1. legends.fun

- **Site:** https://www.legends.fun
- **Hunt:** https://www.legends.fun/hunt
- **Proof of Traction:** https://www.legends.fun/proof-of-traction-protocol
- **God Mode:** https://www.legends.fun/l/godmode
- **X:** [@legendsdotfun](https://x.com/legendsdotfun)
- **Telegram:** https://t.me/legendsdotfunhub
- **Colosseum Arena:** https://colosseum.com/projects/explore/legends.fun
- **Repo (on-chain programs):** https://github.com/anselsol/legendsdotfun-programs
- **Pitch:** https://www.loom.com/share/6e7303d83473455bb22f7df4ca3951f5
- **Technical demo:** https://www.loom.com/share/e2ac69af5308481db1cb6141fa65ae4d

### What it is

Product Hunt for Solana, with capital attached. Builders list products. The crowd does not just upvote. Real backers **lock 1 SOL for 30 days**, keep earning yield via an LST, and get 5× vote weight. Invite-only **Hunters** scout early and get paid when that product later ICOs on a partner launchpad.

One-liner they use: “The next Solana billion dollar company is on legends.fun.”

Colosseum Copilot one-liner: “A discovery and traction platform for Solana builders using a liquid staking token to back projects.”

### Colosseum record

| | |
|---|---|
| Hackathon | Cypherpunk (started 25 Sep 2025) |
| Tracks | Consumer Apps, DeFi, Undefined |
| Prize | Honorable Mention — Undefined |
| Cluster | Solana Token Launchpads |
| Team | Sofian (@depitchsofian), ANSEL (@ansel_sol / github `anselsol`) |
| Stack tags | Solana, Anchor, Rust |
| Problem tags | builder invisibility, investor discovery friction, lack of project traction metrics |
| Solution tags | liquid staking token, curated builder database, investor scouting dashboard |

They are a **winner in the Arena sense** (honorable mention), not a track-prize winner. That still put them in Copilot’s winner-adjacent set.

### What they claimed at Cypherpunk

From the Arena description (scraped via Copilot):

**Early traction**

- 20,000+ unique visitors, average visit 4m17
- 5,000+ accounts (X + email)
- 400+ listed products

**Ecosystem**

- 22 Superteam / ecosystem partners
- 8 OG mentors, including Product Hunt’s Head of Curation and 4 Colosseum winners
- God Mode tested with Foundation Capital and Alliance
- Scouts / inbound from top profiles including Coinbase

**On-chain**

- Program live on mainnet
- Proof of Traction mechanism validated
- 141 `legendsSOL` LST holders in 72 hours

Treat those as *their* numbers at submit time, not independently audited TVL.

---

## Product surface

Four products on one site:

1. **Legends board** — public catalog of Solana products. Traction section on every listing: live upvotes, program on-chain activity, backer engagement. All of it is supposed to be verifiable on-chain, not a Google Sheet.
2. **Proof of Traction** — the economic layer. Lock SOL, get weight, get yield.
3. **The Hunt** — invite-only scouts who list products early and take a cut when those products raise.
4. **God Mode** — paid / gated intelligence dashboard for VCs, launchpads, angels. Filter 500+ products, weekly traction refresh, founder cards. Positioned as “stop digging Discord / Twitter / pitch decks.”

Also on the nav: Mentors, Pitch Roast, Communities, Live programs. Those are social/ops, not the money machine.

---

## Proof of Traction — how the money actually works

Their thesis, quoted from the protocol page:

> Upvoting is a nice signal of support, but committing capital is the real endorsement.
> On Legends, real backers lock their SOL for 30 days, receive early-backer rewards, and boost their yield through our LST integrations.
> It's not just a vote. It's skin in the game.

### SOL lock

- Lock **1 SOL for 30 days** → **5× upvote weight**
- During the lock you hold **`legendsSOL`**, a yield-bearing LST issued with **Sanctum**
- You can still earn staking yield while the SOL is “used” as a backing signal
- Access to product-side rewards if the team offers them: NFTs, vouchers, loyalty points

This is the opposite of TokenFest’s 20% organizer stake. Here the **crowd** posts the bond, not the founder. The lock is small (1 SOL) and time-boxed (30 days). It is a *signal*, not escrow for a $100k event.

### Vote weights

| Role | Weight | Who |
|---|---|---|
| Vibers | 1× | Community members discovering / supporting products |
| Mentors | 5× | Industry experts and hackathon winners helping surface gems |
| Backers | 5× | Users who locked 1 SOL |

Not every vote is equal. Influence scales with engagement and capital. Mentors are humans with reputations (Product Hunt curator, Colosseum winners), not agents.

### What you see on a listing

- Live upvotes (weighted)
- Program on-chain activity
- Backer engagement
- Off-chain traction the owner updates (waitlist, signups, revenue, X followers) — they ask for a weekly refresh so God Mode is not stale

The on-chain part is the lock + weights. The off-chain metrics are still self-reported. That gap matters if you ever copy “traction” into TokenFest: self-reported attendee counts are as fake as self-reported waitlists unless something like POAP / ticket NFT is the source of truth.

---

## The Hunt — how scouts get paid

Invite-only. Not open “anyone list anything.”

### Four steps

1. **Get selected.** Cohort-based, timed challenges. “Can you find winners before everyone else?” No essays. Small cohorts, limited seats. Fail a round → priority for the next one.
2. **Find products early.** List them on Legends with your invite code.
3. **Earn position.** First hunter on a product locks **Bucket 1** (30% of that product’s hunter rewards). Everyone else fights over the remaining 70%.
4. **Get paid.** When the product goes to ICO **through a partner launchpad**, hunters claim. Reward is a share of ICO fees, pre-sale access, or both. Terms depend on the launchpad partner. Bucket position does not change when the partner’s terms change.

### Buckets

| Bucket | Seats | Share of hunter rewards |
|---|---|---|
| 1 — First Hunter | 1 | 30% |
| 2 — Early backers | 10 | 40% |
| 3 — Mid | 50 | 20% |
| 4 — Late | 200 | 10% |

> One product. One First Hunter. The rest back the bet.
> The First Hunter locks Bucket 1 permanently. Everyone else competes for the remaining 70% across Buckets 2–4.

First Hunter also has to **lock 1 SOL for 30 days** to lock the top bucket. Same primitive as Proof of Traction.

### What hunters get besides cash

- Real upside (fees / pre-sale), not points
- Seasonal leaderboards, snapshot per season, homepage visibility
- Private channel with other scouts and the Legends team

**This is not TokenFest revenue share.** TokenFestHolder’s `yieldSubmission()` pays NFT holders from event profit. Hunt rewards are a **finder's fee on someone else’s ICO**. legends.fun is upstream of MetaDAO-style raises; it does not run the raise.

---

## God Mode

Private dashboard. Pitch: Solana’s VCs, launchpads, and angels scout here instead of spreadsheets.

Claimed testers / “trusted by”: Colosseum, Foundation Capital, Alliance, star.fun, Renaud Partners, Superteam, Cyrene, Soar.

Features they advertise:

- Filter 500+ products (category, stage, activity)
- Traction metrics the owner updates weekly
- Founder cards / backgrounds
- Watchlist

This is a **B2B intelligence product** sitting on top of the same listings. TokenFest has no equivalent. You do not need one for Wave 3.

---

## What legends.fun is not

- Not a DAO. No on-chain vote on spending. Weighted upvotes ≠ Governor.
- Not an escrow. Locked SOL goes to an LST, not to the founder’s event wallet.
- Not tickets. No NFT that is both a receipt and a refund claim.
- Not AI. Mentors are people. Scouts are people. God Mode is a filter UI.
- Not MetaDAO. They may *feed* launchpads (including, in principle, a MetaDAO ICO) but they do not govern treasuries.

Colosseum clustered them with **token launchpads**. That is directionally right (they live next to ICOs) and mechanically wrong (they do not issue the token). They are the **pre-launch attention market**.

---

## TokenFest overlap / what to steal

| | TokenFest | legends.fun |
|---|---|---|
| Job | Fund a single event | Surface a startup before it raises |
| Receipt | ERC-721 / 721A ticket | LST lock + weighted upvote; later maybe ICO fee share |
| Who posts the bond | Organizer, 20% of goal | Crowd, 1 SOL / 30 days |
| Who gets paid if it works | Organizer (milestones) and optionally holders (yield) | Hunters (finder's fee) and LST yield for backers |
| Failure | `claimback` refund | Lock expires; you still have yield; no event refund because there was no event fund |
| Signal quality | Sale of tickets = capital at risk | Lock + mentor weight = capital + reputation at risk |
| AI | None yet | None |

**Steal:** capital-weighted signal. TokenFest’s README talks about “idea board → vote → stake.” legends.fun actually ships the cheap version of that: lock money to back an idea, don’t just click like. A TokenFest “proposal” that has 200 vibes and 0 locked SOL is a vibes list. A proposal that required even a small lock (or the organizer’s 20% *before* minting opens) is their Proof of Traction.

**Do not steal:** the Product Hunt UX, God Mode, hunter buckets, or LST integration as the 0G demo. Judges will not watch you filter a catalog for three minutes.

**Mapping onto existing functions**

- `stake()` is already closer to legends.fun than it looks — except TokenFest makes the *organizer* stake, which is the correct party for an event (the person who can steal the bag). Keep that.
- If you ever add an “idea board,” require a small lock or a ticket-hold to upvote. That is legends.fun’s 5× backer weight, applied to Scenario 3 in the TokenFest README.
- Mentors 5× ≈ your `AccessMaster` operator, except they weighted humans instead of giving them a pause button. You already have the stronger primitive (`validate()`). Don’t dilute it into a leaderboard.

---

# 2. MetaDAO

- **Site:** https://metadao.fi
- **Docs:** https://docs.metadao.fi
- **Transparency:** https://metadao.fi/transparency
- **API:** https://api-docs.metadao.fi/introduction
- **Programs:** https://github.com/metaDAOproject/programs
- **Token (META):** `METAwkXcqyXKy1AtsSgJ8JiUHwGCafnZL38n3vYmeta`
- **Legacy METAC:** `METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr` (one-way migration, no fees)

### What it is

A Solana fundraising and governance protocol that replaces token voting with **futarchy** (Robin Hanson, 2007): every proposal opens a pair of conditional prediction markets. The proposal executes only if traders price the “enacted” world above the “not enacted” world.

It started November 2023 with ~65 people and a $10k treasury. It is now two products:

1. **Decision markets as a service** — other Solana orgs run proposals through it (Jito fee switch, Flash revenue-to-stakers, Sanctum’s full governance, Drift, ORE, …). Docs say **96 proposals across 14 organizations** as of the current overview page.
2. **Ownership-coin launchpad** — public ICOs where funds, mint authority, and IP go into a market-governed treasury. Team gets a **monthly budget cap**. Anything above that is a market. Branded **unruggable**.

Colosseum Copilot has **no MetaDAO slug**. MetaDAO is not a hackathon submission. The Arena only has things *built on* it (Superfan, Futard Trade). For TokenFest, study the **protocol**, not those.

Founders: Proph3t and Kollan House. Paradigm-backed. META listed on Coinbase (May 2026 per Solana Compass). MiCA white paper filed in Ireland (DTI BQ53DH590).

---

## Why they exist (their own framing)

From the welcome doc:

Crypto tokens are usually done poorly:

- Hidden OTC / insider deals → nobody trusts the float
- Token has no claim on treasury or IP → revenue accrues to a Labs entity (Uniswap frontend, Unibot/Trojan)
- High FDV, low float, 2–3 year vest → structurally lower prices over time

Their three principles:

1. **Fair launch early** — high-float ICO, grow into the valuation, don’t launch at a $1B FDV with 8% circulating
2. **Real ownership and unruggability** — IP, funds, and mint authority controlled by decision markets
3. **Pay-for-performance** — team tokens unlock as a multiple of ICO price, not on a calendar

They contrast five raise paths: VC + token warrants, VC and never token, Pump/Believe creator fees, a normal ICO (Metaplex-style, founder discretion over cash), and MetaDAO. Only the last is “purpose-built for a long-term crypto-native business.” Pump is called out as terrible: $10k–$100k median, snipers, no intrinsic value.

---

## Decision markets — the core loop

There is no vote. There is trading.

### Lifecycle of a proposal

1. **Anyone** can create a proposal. It can spend USDC from the treasury, mint new tokens, update metadata, or change how much liquidity the treasury provides. One proposal live at a time.
2. **Spam gate:** holders must stake tokens for it to go live. Default **200,000–1,500,000** tokens (1–15% of the 10M ICO supply), depending on DAO version. Stake is returned. **No lockup, no slashing.** Pure anti-spam.
3. The project **moves half its spot liquidity** into two conditional markets for **3 days**:
   - **PASS** — “value of the token if this proposal is enacted”
   - **FAIL** — “value of the token if it is not”
4. Conditional trades **revert if the condition is not met**. Buy PASS ORE at $20: if the proposal passes you bought ORE at $20; if it fails you bought nothing.
5. **24-hour delay** before TWAP recording starts, so the market can price in the news.
6. **Lagging TWAP** decides. A raw end-of-window price is snipable (even a 1% validator could 100× the pass price in their slots). Observation into the TWAP can only move a capped amount per update. Example from the docs: start $500, max $5/minute, spot $550 → 10 minutes before the observation catches up.
7. Compare TWAPs:

| Proposal type | Pass if |
|---|---|
| Team-sponsored | PASS TWAP ≥ FAIL TWAP **− 3%** (easier for the team; they have context) |
| Anyone else | PASS TWAP ≥ FAIL TWAP **+ 3%** (conservative default) |

8. If it passes, the governance **executor runs immediately**. No extra timelock. Mint goes straight to the address named in the proposal. If it fails, nothing is minted, nothing is spent.

Mint authority is the **governance program**, not a human. META has **no hard cap**. That sounds scary until you see that every mint is a public 3-day market. There is no silent inflation, no scheduled emissions.

**Honest caveat from their own ownership-coins page:** MetaDAO is in beta. The team currently has an **override** of decision markets in extreme scenarios, “similar to Polymarket’s backdoor into the oracle.” They say they have not used it and expect it to go away. That is the same class of honesty TokenFest should use if `validate()` stays mocked or if an AI oracle is stubbed.

### How a holder actually trades (from their docs)

**Bad proposal.** Project has $1M treasury, $1.2M mcap. Founder proposes sending all cash to himself. Spot dumps to $900k. Decision markets still show $900k on both sides. You sell PASS (overvalued if the rug happens) and buy FAIL (next proposal is a liquidation, ~11% to NAV). You are hedged.

**Good proposal.** $10M revenue, $100M mcap. New business line you think is +$5M revenue → +$50M mcap. If PASS already trades at $150M, do nothing. If PASS is $110M, buy. If $200M, sell.

This is why they claim markets beat token voting on capture. A whale can vote yes with idle tokens. A whale who *buys PASS* is taking the other side’s money if they are wrong.

---

## The ICO — how a project actually raises

Docs warn the launch mechanism is still experimental.

### What founders must file to get listed

From [Getting Listed](https://docs.metadao.fi/how-launches-work/create):

- Name, short pitch, long pitch
- Token name + ticker (they like memorable tickers: Omnipair / OMFG)
- Images
- **Minimum raise** — miss it, everyone is refunded. Recommend buffering for the 20% LP seed
- **Monthly team budget** — cannot exceed **1/6 of the minimum raise**. Spends above it need a proposal. Can be changed later via governance
- **Performance package** (optional) — up to **12.9M tokens**, five equal tranches at **2× / 4× / 8× / 16× / 32× ICO price**, minimum **18 months** from ICO, price measured on a **3-month TWAP** (so the real unlock is +3 months)
- **IP list** the founders assign to the project entity: domains, software, social accounts

Intake is still a Typeform + Telegram with Kollan House. They are trying to automate listing itself via a MetaDAO proposal.

### Sale mechanics

- Investors get **4 days** to commit USDC
- **Discretionary cap:** founder chooses how much of committed USDC actually goes to the project (believers can participate without the project over-raising)
- **10M tokens** distributed to participants
- Everyone pays the **same price per token** (same FDV)
- Allocation is not plain pro-rata. Your USDC grows an accumulator every second it stays in: `accumulator += committed_amount × elapsed_seconds`. Share = your accumulator / total. A **fill boost** extra-rewards people who committed while the pool was still empty. Earlier + when empty → larger allocation for the same dollars
- Founders may still give **guaranteed allocations** to funds / angels they want in (soft commits before the raise). That is the one insider path they admit

Why not other sale types (they cite Vitalik’s 2017 sales post): FCFS gets sniped; capped pro-rata gets gamed (if 2× oversubscribed everyone puts 2×); uncapped over-raises; Dutch auctions are too complicated.

### If the sale succeeds

1. All USDC → market-governed treasury
2. Mint authority → that treasury
3. Treasury seeds **20% of the USDC + 2.9M tokens** into LPs (buy below ICO, sell above)
4. Team may draw only the configured monthly budget
5. Larger spends or new issuance → proposal

### If it misses minimum

Everyone is refunded USDC. Same instinct as TokenFest `intiateRejection()` + `claimback` when `fundsInReserve < crowdFundingGoal`.

### Team incentives

Optional performance package, not a time vest:

- 5 tranches: 2×, 4×, 8×, 16×, 32× ICO
- ≥ 18 month cliff (founder can set longer)
- 3-month TWAP so you cannot spike a candle and dump
- Example from docs: Alice allocates 10M to the package, $1M raise → $0.10 ICO. At 24 months the token is 10× ($1) and holds a 3-month TWAP → she unlocks three tranches (6M). A year later at $2 she unlocks another 2M.

MetaDAO itself skipped this at launch and figured incentives later via a market.

---

## Unruggable — what that word actually means

Not “the token goes up.” Two protections, from their investor page.

### Mechanistic: treasury rugs

Solana 2021 ICOs they cite:

| Project | Raised | What happened |
|---|---|---|
| Parrot | $85M | team walked with $72M |
| UXD | $57M | insiders walked with $46M |
| Mango | $70M | founders suing each other |
| Aurory | $108M | token −99.5%, cash unclear |

On MetaDAO the cash sits in a treasury the team cannot unilaterally drain. Anyone can propose **return capital**. Messari’s example: $1M raise, $50k/month cap → a thief gets one month; holders recover ~95%.

Treasury is a **Squads 1/1 smart account** whose signer is the futarchy DAO. Visible in Squads UI.

### Legal: revenue rugs

Uniswap Labs keeps frontend revenue. Unibot team built Trojan, $206M fees, kept it off `$UNIBOT`. MetaDAO launch wraps IP (domains, socials, software) in an entity that decision markets control, so tokenholders can compel a transfer or sue a team that siphons revenue.

**Ownership coin** = those two things: treasury under markets, key IP under markets. There is no share certificate. “What’s good for the token is good for the token holder” because the market *is* the decision.

Galaxy (Aug 2026) on the legal stack: MetaLex partnership. LLC owns assets and legally recognizes only on-chain futarchy. Members implement market outcomes; they do not hold residual equity in the traditional sense.

---

## STAMP — private capital before the ICO

**Simple Token Agreement, Market Protected.** Colosseum instrument. https://www.colosseum.com/stamp

Replaces SAFE + token warrant dual structures. Token is the sole economic unit.

**New startups:** Cayman SPC via MetaDAO UI → investor signs STAMP, sends stables → funds only for product/opex → ICO → remainder + IP to DAO treasury → investor files Delivery Notice for tokens.

**Existing cap tables:** terminate SAFEs/convertibles, migrate to token-only, same market protections.

Key numbers:

- Investor reserve ≤ **20%** of all project tokens, fixed, not renegotiated
- Team allocation **10–40%**
- Tokens **24-month linear unlock** from Delivery Notice

This is how Colosseum and MetaDAO are actually glued. legends.fun is also in the Colosseum orbit (Arena + God Mode testers). The Solana “serious raise” path looks like: get seen on legends.fun → maybe STAMP seed → MetaDAO ICO.

TokenFest has no legal wrapper and no private-round instrument. For a hackathon that is fine. For a real event business it is a hole MetaDAO already filled.

---

## Bid wall (deprecated, still instructive)

Used in one raise, then dropped. Excess above `20% LP + minimum` sat in a program that bought tokens at **NAV per token** and burned them. 1% fee to MetaDAO. 90-day expiry, leftover USDC back to treasury. You could not game it by burning elsewhere first (that *raised* NAV).

It is the same instinct as TokenFestHolder yield + refund: give holders a **NAV-linked exit** so the token is not a pure greater-fool. They deprecated it. Current design relies on the 20% LP + monthly cap + liquidation proposals instead.

---

## META token

- Fair launch, **10M** at genesis, **no private sale, no insider allocation** at launch
- No hard cap; mint only via governance
- 1:1000 split happened historically (unit bias); treat current supply as live on explorer
- Protocol take: **25 bps** on Futarchy AMM volume (Messari). After an ICO, 2M tokens + 20% of USDC seed that AMM
- Docs: 96 proposals, 14 orgs, as of the overview page

---

## Scale (external, not docs)

Treat as snapshots, not eternal truth:

- Messari (Sep 2025): 81 proposals across 13 orgs at that time; MetaDAO itself 31, Island DAO 9, Drift 8, mtnCapital 7, ORE 7
- Alea / launch track (early 2026): 8 ICOs, $25.6M raised, ~$390M committed, ~95% refunded as oversubscription
- Dune / blocmates (late Aug 2026): Umbra $3M final vs $155M committed (207×, 10.5k contributors); Solomon $8M; Ranger $8M; Loyal $2.5M; Avici $3.5M; etc. Ownership-coin market cap ~$154M, treasuries ~$34M (01Resolved, 23 Aug 2026)
- MetaDAO treasury itself ~$11.9M, $240k monthly spend cap, ~41–50 months runway; META-040 passed to put up to $2M into Solomon’s USDv

Oversubscription with a discretionary cap is the point: believers can show up without forcing the project to hold more cash than it can govern.

---

## TokenFest overlap / what to steal

| | TokenFest | MetaDAO |
|---|---|---|
| What’s funded | One event | A company / protocol |
| Receipt | Event NFT | SPL ownership coin |
| Raise asset | Stablecoin ERC-20 | USDC |
| Goal miss | Anyone `intiateRejection`, holders `claimback` | Auto-refund USDC |
| Who releases money | Organizer withdraws ≤ 20%, then **pauses**; operator `validate()` | Team monthly cap; anything else PASS/FAIL TWAP |
| Organizer bond | 20% of goal, staked before mint | Performance package + cannot drain treasury |
| If founder rugs | Stake is in the refund pool (`crowdFundingGoal * 20% + fundsInReserve`) | One month of burn, then holders liquidate |
| Who is the oracle | AccessMaster operator (a person) | Lagging TWAP of two markets |
| AI | None yet | None |
| Legal | None | Entity + IP assignment + STAMP |

**This is the Solana cousin of TokenFest’s “don’t let the organizer run with the bag.”** Different oracle. Same fear.

TokenFest’s pause-after-withdraw is a **human-gated tranche**. MetaDAO’s monthly cap is a **time-gated drip**. Both refuse to hand over 100% on day one. MetaDAO’s version does not need an operator key. TokenFest’s version does not need a liquid token and a 3-day market to pay a venue deposit. For *events*, a human or an evidence agent is the right oracle. For *companies*, markets are the right oracle.

**Steal**

1. **Unruggability as the pitch, not “DAO.”** MetaDAO’s investor page is four ruined ICOs and then the mechanism. TokenFest’s README is slogan. Wave 3 copy should be: organizer cannot take more than 20% without a new proof; holders can `claimback` if the goal fails or the proposal is rejected.
2. **Monthly/tranche cap named in the constructor.** You already cap each `withdrawFunds` at 20% of goal. Say it in the UI the way they say “monthly budget.”
3. **Public, address-level destination.** MetaDAO proposals name the recipient before trading. TokenFest `withdrawFunds(wallet, amount)` already takes a wallet — show it, hash the milestone spec, put that hash on 0G Storage (Construct’s trick + their transparency).
4. **Honest override.** They disclose the team backdoor. If you keep `onlyOperator` or stub an AI oracle, put it in the README.
5. **Performance unlocks, not time vests** — only if TokenFestHolder yield ever becomes a team allocation. 2×/4×/… on a TWAP is how you pay organizers for a *successful* event without letting them dump on mint morning.

**Do not steal**

- Futarchy as the event `validate()` step. A 3-day PASS/FAIL market to release the next catering invoice will not demo in a 3-minute video and will not have enough traders to be honest.
- Ownership coins as tickets. Tickets need to be cheap, many, and burnable/refundable. Ownership coins are the company.
- Guaranteed angel allocations. That fights the “fair NFT mint” story.
- Building a MetaDAO clone on 0G in 48 hours. Superfan spent a Cypherpunk on *using* MetaDAO for music. You do not have a futarchy AMM.

**Mapping onto existing functions**

| MetaDAO | TokenFest |
|---|---|
| Miss minimum → refund | `intiateRejection` + `claimback` |
| Monthly budget | `withdrawFunds` cap at 20% of goal, then `pause` |
| Proposal to spend more | next `validate(true)` unpause |
| Liquidation proposal | `intiateRejectionByOperator` / `OperatorApproveRefund` + `claimback` |
| Stake 200k to propose | organizer `stake()` 20% |
| Performance package | Holder `yieldBasisPoints` is the *backer* yield, not the team’s. Different direction |
| Lagging TWAP oracle | operator, or later an evidence agent whose output hash is on 0G |

The operator is the thing MetaDAO killed. If Wave 3 has a point, it is **killing the operator without becoming a prediction market**: evidence in, hash on 0G Storage, unpause. That is MetaDAO’s *goal* (no human key on the bag) with Construct’s *oracle* (model + provenance), sitting on TokenFest’s *state machine* (pause / validate / claimback).

---

## The two of them together, and TokenFest

Solana’s serious path for a new project, as of this scrape:

1. Get listed and backed on **legends.fun** (lock SOL, hunters, God Mode so a fund actually sees you)
2. Optional **STAMP** seed (Colosseum) so you have runway before the public sale
3. **MetaDAO ICO** — USDC in, ownership coins out, treasury and mint under decision markets
4. Live under a monthly cap; markets decide everything else

TokenFest is a different object: a **finite event**, tickets as receipts, milestones as physical/operational work (venue, lineup, AV), refunds if the night does not happen.

| Question | legends.fun | MetaDAO | TokenFest |
|---|---|---|---|
| Is this thing real? | Lock + on-chain program stats | 4-day USDC book + oversubscription | Ticket mint against a goal |
| Can the operator steal? | N/A — they never hold the raise | No, except disclosed override + one month of burn | Yes, unless pause + stake + claimback hold |
| Who says work happened? | N/A | Markets on *value*, not on *work* | Operator today; evidence agent if you ship it |
| What does the buyer hold? | LST + upvote | Ownership coin | Event NFT |
| AI | No | No | Open slot |

**legends.fun’s lesson:** belief is not a like. TokenFest’s idea-board scenario should not be a free vote.

**MetaDAO’s lesson:** the bag is the product. TokenFest already designed for that (20%, pause, refund). The README does not say it as sharply as MetaDAO’s four dead ICOs. The remaining hole is the oracle: they used markets because the decision is “does this mint make META more valuable.” Your decision is “did the organizer spend this tranche on the event.” Markets cannot see a receipt. An operator can lie about a receipt. An evidence agent plus a content-addressed hash is the version of unruggable that fits an event.

---

## Links to keep

**legends.fun**

- https://www.legends.fun
- https://www.legends.fun/proof-of-traction-protocol
- https://www.legends.fun/hunt
- https://www.legends.fun/l/godmode
- https://colosseum.com/projects/explore/legends.fun
- https://github.com/anselsol/legendsdotfun-programs

**MetaDAO**

- https://docs.metadao.fi
- https://docs.metadao.fi/governance/overview
- https://docs.metadao.fi/how-launches-work/sale
- https://docs.metadao.fi/benefits/ownership-coins
- https://docs.metadao.fi/token/mechanics
- https://www.colosseum.com/stamp
- https://www.galaxy.com/insights/research/the-state-of-onchain-futarchy
- Messari: *MetaDAO: Self-Enforced Tokenholder Rights*

Pages and prize claims go stale. Re-open the docs before putting a number in a pitch.
