# Sprkclub × 0G Wave 3 — Milestone Proof & Verification Integration

Status: approved for planning
Date: 2026-08-28
Deadline: 2026-08-30 20:30 IST (0G Bridge Buildathon, Wave 3)

## 1. Problem & Context

Sprkclub is a milestone-governed crowdfunding platform (NFT tickets +
staked creators + DAO-style operator validation) already implemented in
`smartcontracts/contracts/TokenFestCollab.sol` and `TokenFestHolder.sol`,
targeting Polygon. `LLM1_DISCUSSION.md` describes a 4-chapter product
narrative where Chapter 4 ("Proof-Before-Payout") is currently
aspirational: milestones are submitted as a bare IPFS-hash string
(`submitMileStoneInfo`) and approved by a human `onlyOperator` calling
`validate()`, with no verifiable proof trail and no on-chain record of
what was actually reviewed.

`Og_Hack.md` sets the competitive context: 0G Wave 3 scores 40% on
visible progress, 30% on 0G integration depth, 20% on code quality, 10%
on traction/communication. The winning pattern it documents is: an
artifact is produced → stored on 0G Storage (content-addressed, returns
a Merkle root hash) → that root hash is written into a contract on 0G
Chain → the resulting mainnet contract address and explorer trail *is*
the integration proof. Agentic ID (ERC-7857) is optional and only scores
well when the wrapped agent is genuinely owned/transferable/licensable —
not decorative.

This spec turns Chapter 4 of the product narrative into that exact
technical pattern, using pieces Sprkclub already needs anyway (a real
proof trail, a real verifier), rather than building a separate demo
contract to satisfy the buildathon checklist.

## 2. Goals

- Creators upload real milestone proof (receipts, photos, delivery
  logs) which is content-addressed on 0G Storage; the resulting root
  hash is recorded on-chain against the specific milestone.
- The `onlyOperator` validation gate is replaced by an on-chain
  ownership check against a new ERC-7857 "verifier agent" token
  (`AgenticVerifier`), so the right to approve/reject milestones is
  itself an owned, transferable asset — not a hardcoded role list.
- `TokenFestCollab` and `TokenFestHolder`, the concrete `AccessMaster`,
  and `AgenticVerifier` are deployed fresh to 0G mainnet (chain ID
  16661) as Sprkclub's primary chain going forward.
- Submission checklist in `Og_Hack.md` is satisfiable end-to-end: a
  mainnet contract address, real explorer activity (deploy + at least
  one milestone-proof-record transaction + one verifier-agent mint),
  and an honest README section on the stubbed oracle.

## 3. Non-Goals (Wave 3)

- Prediction markets — explicitly Phase 2 in `LLM1_DISCUSSION.md`.
- 0G Compute — not used this wave (Storage + Chain + Agentic ID only,
  per explicit decision). No AI inference is added to the verification
  flow; the AgenticVerifier's "judgment" remains the existing human
  operator behind the token, wrapped so the *right to judge* is an
  owned asset. A future wave could put real inference behind it.
- Real TEE/ZK-verified `verifyProof()` oracle — stubbed and documented,
  per `Og_Hack.md`'s explicit guidance that an honest stub beats a
  silent fake.
- Migrating existing Polygon deployment history/state — this is a
  fresh deployment, not a migration script.
- Rewriting the crowdfunding core logic (staking, minting, refunds,
  claimback) — unchanged except where noted below.

## 4. Architecture

```
Creator prepares milestone proof files (receipts, photos, logs)
        │
        ▼
Backend service (Node/Go) — the ONLY thing that talks to 0G Storage
   POST /milestones/:proposalAddr/:index/proof  (multipart upload)
        │  ZgFile.fromFilePath → merkleTree() → indexer.upload()
        ▼
0G Storage (mainnet indexer: indexer-storage-turbo.0g.ai)
        │  returns Merkle root hash (bytes32)
        ▼
Backend calls submitMileStoneProof(index, rootHash) as proposalCreator
        │
        ▼
TokenFestCollab / TokenFestHolder on 0G Chain (mainnet, 16661)
   mapping(uint256 => bytes32[]) public milestoneProofRoots;
   event MilestoneProofRecorded(uint256 indexed milestoneIndex, bytes32 rootHash);
        │
        ▼
Operator wallet (must hold the AgenticVerifier NFT) reviews the proof
(via backend-served download of the file at rootHash) and calls
validate(result, proposalRejectedStatus) — unchanged signature/logic,
new authorization check only
        │
        ▼
unlocks next milestone tranche (existing withdrawFunds flow)
   OR triggers _proposalRejection() → existing claimback/refund flow
```

### 4.1 Contracts (`smartcontracts/contracts/`)

**`TokenFestCollab.sol` / `TokenFestHolder.sol`** (both, parallel changes):

- Remove `string[] public mileStone` and `submitMileStoneInfo(string)`.
  Replace with:
  ```solidity
  mapping(uint256 => bytes32[]) public milestoneProofRoots;
  event MilestoneProofRecorded(uint256 indexed milestoneIndex, bytes32 rootHash);

  function submitMileStoneProof(bytes32 rootHash) external onlyProposalCreator {
      milestoneProofRoots[numberOfMileStones].push(rootHash);
      emit MilestoneProofRecorded(numberOfMileStones, rootHash);
  }
  ```
  Indexed by `numberOfMileStones` (already tracked, incremented in
  `withdrawFunds`), so proof-then-withdraw stays the natural sequence:
  submit proof for the *current* milestone before the operator can
  `validate()` and the creator can `withdrawFunds()` for it.
- `onlyOperator` modifier changes from an `IACCESSMASTER.isOperator()`
  check to also require the caller **holds the AgenticVerifier NFT**
  (see 4.2). Exact shape:
  ```solidity
  modifier onlyOperator() {
      require(
          flowRoles.isOperator(_msgSender()) &&
          agenticVerifier.balanceOf(_msgSender()) > 0,
          "TokenFestCollab: User is not authorized"
      );
      _;
  }
  ```
  This keeps `AccessMaster` as the coarse allowlist (prevents randoms
  from ever holding the role meaningfully) while the NFT becomes the
  actual bearer instrument — matches "transferable if Sprkclub ever
  licenses out milestone review."
- Constructor gains one more address parameter (`agenticVerifierAddr`)
  appended to the existing `contractAddr` array pattern used for
  `token`/`flowRoles`, keeping the constructor shape consistent with
  current conventions rather than adding a new positional parameter.

**New `contracts/AgenticVerifier.sol`** (ERC-7857, based on
`0gfoundation/0g-agent-nft`, `eip-7857-draft` branch):

- Minimal ERC-721 + encrypted-metadata pattern from `Og_Hack.md` Part B:
  `mint(recipient, encryptedURI, metadataHash)`, `transfer(from, to,
  tokenId, sealedKey, proof)`.
- `metadataHash` / `encryptedURI` point at an 0G Storage blob containing
  Sprkclub's verifier rubric (the criteria an operator is supposed to
  apply when reviewing a milestone proof) — encrypted, uploaded once at
  deploy time via the same backend pipeline as milestone proofs.
- `IOracle.verifyProof()` — **stubbed to `return true`**. README must
  state this plainly (see §7) with a paragraph on the real design (TEE
  decrypt + re-encrypt + attestation via 0G Compute, not built this
  wave).
- One token minted at deploy time to the Sprkclub operator wallet.
  Whoever holds it is the only address `validate()` will accept.
  Transferring it hands off milestone-review authority — this is the
  "genuinely transferable" story required for Agentic ID to score.

**`AccessMaster`**: `IAccessMaster.sol` interface already exists; no
concrete implementation is present in the repo today. This spec
requires writing/locating the concrete `AccessMaster.sol` (role
management for `isOperator`) since both existing contracts depend on it
and none currently ship it — this was already a gap, not something this
integration introduces, but it blocks deployment either way.

### 4.2 Backend service

No existing server scaffold was found under `smartcontracts/api/` beyond
Go contract bindings (`api.go`, `config`, `contracts`) — confirm during
planning whether to extend that Go service or add a small Node service
using `@0gfoundation/0g-storage-ts-sdk` (TS SDK is what the doc's code
samples use; Go SDK — `0g-storage-client` — is the alternative if
staying in Go is preferred for consistency with the existing `api/`).
Either is viable; the interface below is language-agnostic.

Responsibilities (per `Og_Hack.md`'s "Node only, browser read-only"
constraint):
- `POST /proposals/:addr/milestones/:index/proof` — accepts file
  upload, runs the 4-line 0G Storage upload, calls
  `submitMileStoneProof(rootHash)` on-chain using a signer, returns
  `{ rootHash, txHash }`.
- `GET /proposals/:addr/milestones/:index/proof` — reads
  `milestoneProofRoots` from chain, downloads the file(s) via
  `indexer.download` (or `downloadToBlob` if encrypted) server-side,
  streams to the operator's browser for review.
- Holds the mainnet 0G signer key (env var, never exposed to frontend).
- One-time deploy-time script: uploads the verifier rubric blob, mints
  the `AgenticVerifier` token to the operator wallet.

### 4.3 Frontend (`front-end/`)

- `launch/` flow: add a milestone-proof upload step (calls the backend
  upload endpoint instead of any direct 0G SDK usage — browser stays
  read-only per the doc's warning about Node-only filesystem APIs).
- `explore/ongoing-proposals`: show milestone status per proposal —
  proof submitted (root hash + link to backend-served file) / pending
  operator review / validated / rejected. Pulls `milestoneProofRoots`
  and `Validate` events via the existing ABI-reading pattern already
  used elsewhere in the app (`ProposalProvider.tsx`).
- New minimal "operator review" view (can be unstyled/internal-only for
  Wave 3): lists proposals with a submitted-but-unvalidated proof,
  lets the connected wallet (if holding `AgenticVerifier`) call
  `validate()`.

### 4.4 Deployment target

- New `og` / `og-mainnet` network entries in `hardhat.config.ts`:
  `chainId: 16661`, `url: "https://evmrpc.0g.ai"`, `accounts:
  [PRIVATE_KEY]` — following the same pattern as the existing
  `maticmum`/`polygon` entries, added alongside them (Polygon entries
  are left in place, just no longer the deploy target used).
- Deploy order: `AccessMaster` → `AgenticVerifier` (mint verifier token)
  → stablecoin (mock ERC20, since sDai has no 0G deployment — reuse
  `contracts/mocks` if a mock ERC20 already exists there) →
  `TokenFestCollab`/`TokenFestHolder` instances (via the existing
  `scripts/launch/launch.js` pattern, extended to pass the new
  `agenticVerifierAddr` constructor arg).
- 0G mainnet has no faucet — gas must be bought/bridged ahead of the
  deploy window (`Og_Hack.md` §"one thing to budget for").

## 5. Data Flow Summary

| Step | Actor | Action | On-chain? |
|---|---|---|---|
| 1 | Creator | Uploads proof files via frontend | No |
| 2 | Backend | Uploads to 0G Storage, gets root hash | No (Storage tx only) |
| 3 | Backend | Calls `submitMileStoneProof(rootHash)` | Yes — 0G Chain |
| 4 | Operator (AgenticVerifier holder) | Reviews file (backend-served download), calls `validate()` | Yes — 0G Chain |
| 5 | Contract | Unlocks `withdrawFunds` or triggers rejection/refund | Yes — 0G Chain (unchanged existing logic) |

## 6. Error Handling & Edge Cases

- **Proof submitted but operator never validates**: unchanged from
  existing behavior — funds stay paused; existing `intiateRejection()`
  path (post-`fundingEndTime`, goal unmet) is unaffected since it's a
  pre-funding-completion path, not a stuck-milestone path. A stuck
  post-funding milestone has no automatic timeout today and this spec
  does not add one — out of scope, flag as a known gap in README.
- **AgenticVerifier token transferred mid-review**: new holder gains
  `validate()` rights immediately; old holder loses them. No pending-
  review state is tracked, matches existing simple boolean model.
- **Backend signer runs out of 0G gas mid-upload**: upload call fails
  before `submitMileStoneProof` is reached — no partial on-chain state,
  since the Storage upload and the contract call are sequential, not
  atomic. Acceptable for Wave 3 scope; a production version would want
  a retry/reconciliation job, explicitly deferred.
- **Duplicate proof submission for the same milestone index**: allowed
  by design (`milestoneProofRoots[index]` is an array, push-only) —
  mirrors the existing `mileStone` array's append-only pattern, lets a
  creator resubmit corrected evidence without a new contract call path.

## 7. Documentation & Submission Requirements (from `Og_Hack.md`)

The implementation plan must produce, not just the code:

- README section: architecture diagram (the flow in §4), which 0G
  modules are used (Chain, Storage, Agentic ID) and how, explicit
  "Agentic ID's `verifyProof` oracle is stubbed to `return true`" 
  statement with the real-design paragraph.
- Mainnet contract addresses + 0G Explorer (`chainscan.0g.ai`) links
  for `AccessMaster`, `AgenticVerifier`, one deployed
  `TokenFestCollab`/`Holder` instance, recorded after at least one real
  milestone-proof-record transaction and one `validate()` transaction.
- Local deployment / reproduction steps.
- Demo video (≤3 min), X post with required tags — process items, not
  build items, but listed here so the implementation plan's final step
  accounts for them rather than treating "code done" as "submission
  done."

## 8. Testing

- Extend existing `test/dreamstartercollab.test.ts` and
  `dreamstarterholder.test.ts` (Hardhat/Waffle, already in place) with:
  - `submitMileStoneProof` emits `MilestoneProofRecorded` with correct
    index/hash, reverts for non-creator.
  - `validate()` reverts when caller lacks the `AgenticVerifier` token
    even if `AccessMaster.isOperator()` is true; succeeds when caller
    holds the token.
  - `AgenticVerifier.transfer()` moves `validate()` rights to the new
    holder (integration test spanning both contracts).
- New unit tests for `AgenticVerifier.sol` itself: mint, transfer with
  stubbed oracle returning true, `ownerOf` checks.
- Backend: manual/scripted smoke test against 0G testnet (Galileo,
  chain ID 16602) before mainnet deploy, per `Og_Hack.md`'s "build on
  testnet, redeploy to mainnet" guidance — same SDK code, swapped RPC/
  indexer endpoints.

## 9. Open Items for Implementation Planning

- Confirm backend language (extend existing Go `api/` vs. new Node
  service) — flagged in §4.2, not decided here since it's an
  implementation-plan-level call, not an architectural one.
- Locate or write the concrete `AccessMaster.sol` — currently missing
  from the repo entirely; blocks any deployment regardless of this
  integration.
- Confirm whether a mock ERC20 stablecoin already exists under
  `contracts/mocks` or needs to be written for the 0G deploy.
