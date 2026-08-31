# 0G Milestone Proof & Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Sprkclub's IPFS-string milestone submission and human-only `onlyOperator` validation with a real 0G Storage proof trail (Merkle root hashes recorded on-chain) and an ERC-7857 "AgenticVerifier" NFT that gates who may call `validate()`, then deploy the full stack fresh to 0G mainnet (chain ID 16661).

**Architecture:** Creator uploads milestone proof files to a Go backend, which uploads to 0G Storage and writes the returned root hash into `TokenFestCollab`/`TokenFestHolder` via a new `submitMileStoneProof` function. `validate()` becomes gated on holding the new `AgenticVerifier` ERC-7857 token instead of a plain `AccessMaster` role check. Frontend adds upload + review UI. Everything deploys to 0G mainnet as the primary chain.

**Tech Stack:** Solidity 0.8.17 / Hardhat / TypeChain / Waffle (existing), Go + gin (existing `smartcontracts/api/`), `@0gfoundation/0g-storage-client` (Go SDK, keeps backend single-language), Next.js/TypeScript frontend (existing).

**Spec:** `docs/superpowers/specs/2026-08-28-0g-milestone-verification-design.md`

## Global Constraints

- Solidity version stays `0.8.17` (existing `hardhat.config.ts`, all contracts already pinned there).
- 0G mainnet: chain ID `16661`, RPC `https://evmrpc.0g.ai`, Storage indexer `indexer-storage-turbo.0g.ai`, no faucet — gas must be funded manually before deploy tasks run.
- 0G testnet (Galileo) for dev/test: chain ID `16602`, RPC `https://evmrpc-testnet.0g.ai`, Storage indexer via testnet config, faucet at `faucet.0g.ai` (0.1 0G/wallet/day).
- Backend is Go, extending the existing `smartcontracts/api/` gin service — no new language/runtime introduced.
- Browser never talks to 0G Storage directly (Node/Go-only SDK calls) — frontend always goes through the backend.
- `AgenticVerifier.verifyProof()` is stubbed to `return true`; this must be stated plainly in the README, not hidden.
- Existing crowdfunding logic (staking, minting, refunds, claimback, withdrawFunds) is unchanged except where a task explicitly says otherwise.
- Test files currently reference the pre-rename contract names `DreamStarterCollab`/`DreamStarterHolder`, which no longer exist — this is fixed in Task 1 before any other work, since every later contract task depends on a runnable test suite.

---

## Task 1: Fix stale contract names in existing tests

**Files:**
- Modify: `smartcontracts/test/dreamstartercollab.test.ts`
- Modify: `smartcontracts/test/dreamstarterholder.test.ts`

**Interfaces:**
- Consumes: existing `TokenFestCollab`, `TokenFestHolder`, `AccessMaster`, `MyToken` contract factories (already correctly named in `contracts/`).
- Produces: a passing baseline test suite that Task 3 and Task 5 extend.

The test files currently call `ethers.getContractFactory("DreamStarterCollab")` / `"DreamStarterHolder"` and assert against revert strings like `"DreamStarterCollab: ..."`, but the actual contracts and their revert strings say `TokenFestCollab`/`TokenFestHolder`. This predates this feature — running `npm test` today fails at the first `getContractFactory` call with `HH700: Artifact for contract "DreamStarterCollab" not found`.

- [ ] **Step 1: Confirm the current failure**

Run: `cd smartcontracts && npx hardhat test 2>&1 | head -30`
Expected: FAIL — `HH700: Artifact for contract "DreamStarterCollab" not found. This may be because the contract name...`

- [ ] **Step 2: Fix `dreamstartercollab.test.ts` contract factory names**

In `smartcontracts/test/dreamstartercollab.test.ts`, replace every occurrence:
- Type import: `DreamStarterCollab` → `TokenFestCollab` (from `"../typechain-types"`)
- Variable type annotation `let dreamstarter: DreamStarterCollab` → `let dreamstarter: TokenFestCollab`
- `ethers.getContractFactory("DreamStarterCollab")` → `ethers.getContractFactory("TokenFestCollab")`
- Revert string assertions: `"DreamStarterCollab: ..."` → `"TokenFestCollab: ..."`, `"DreamStarterCollab__ProposalRejected()"` → `"TokenFestCollab__ProposalRejected()"`, `"DreamStarterCollab_ClaimedNotPossible()"` → `"TokenFestCollab_ClaimedNotPossible()"`

Cross-check each replacement against the actual strings in `smartcontracts/contracts/TokenFestCollab.sol` (custom errors at lines 11-12, require strings throughout) — the test's revert-string text must byte-match the contract's.

- [ ] **Step 3: Fix `dreamstarterholder.test.ts` contract factory names**

Same substitutions in `smartcontracts/test/dreamstarterholder.test.ts`: `DreamStarterHolder` → `TokenFestHolder` everywhere (import, type annotations, `getContractFactory` calls), and revert strings `"DreamStarterCollab: ..."` / `"DreamStarterCollab__ProposalRejected()"` / `"DreamStarterCollab_ClaimedNotPossible()"` → the `TokenFestHolder`-prefixed equivalents, matched against `smartcontracts/contracts/TokenFestHolder.sol` lines 11-13 and its require strings (note: `TokenFestHolder.sol`'s own `_transferFunds` still says `"TokenFestCollab: Not Enough Funds!"` verbatim in the contract itself — line 187 — so that specific assertion, if the test has one, should match `TokenFestCollab:`, not `TokenFestHolder:`; do not "fix" the contract, only make the test match what the contract actually says).

- [ ] **Step 4: Run the full suite and verify it passes**

Run: `cd smartcontracts && npx hardhat test`
Expected: PASS — all existing `describe` blocks green, no `HH700` errors.

- [ ] **Step 5: Commit**

```bash
git add smartcontracts/test/dreamstartercollab.test.ts smartcontracts/test/dreamstarterholder.test.ts
git commit -m "fix: update stale DreamStarter contract names to TokenFest in tests"
```

---

## Task 2: Add `submitMileStoneProof` and drop the IPFS-string milestone field in `TokenFestCollab.sol`

**Files:**
- Modify: `smartcontracts/contracts/TokenFestCollab.sol`
- Test: `smartcontracts/test/dreamstartercollab.test.ts`

**Interfaces:**
- Produces: `mapping(uint256 => bytes32[]) public milestoneProofRoots`, `event MilestoneProofRecorded(uint256 indexed milestoneIndex, bytes32 rootHash)`, `function submitMileStoneProof(bytes32 rootHash) external`. These are consumed by Task 6 (backend) and Task 8 (frontend read).

- [ ] **Step 1: Write the failing test**

Add to `smartcontracts/test/dreamstartercollab.test.ts`, inside the `"DreamStarter Collab ,WithStaking with CrowFunding Goal Reaches"` describe block, replacing the existing `"withdraw funds by creator and submit milestone"` test's milestone-submission assertions (keep the withdraw-funds portion, replace only the `submitMileStoneInfo` part):

```typescript
        it("withdraw funds by creator and submit milestone", async () => {
            let prevBalance = await token.balanceOf(creator.address)
            await dreamstarter.connect(creator).withdrawFunds(creator.address, withdrawAmount)
            let afterBalance = await token.balanceOf(creator.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(withdrawAmount)

            expect(await dreamstarter.pause()).to.be.true
            expect(await dreamstarter.numberOfMileStones()).to.be.equal(1)

            /// Milestone Proof Submission (0G Storage root hash)
            const rootHash = ethers.utils.formatBytes32String("root-hash-1")
            await expect(dreamstarter.connect(creator).submitMileStoneProof(rootHash))
                .to.emit(dreamstarter, "MilestoneProofRecorded")
                .withArgs(1, rootHash)

            const stored = await dreamstarter.milestoneProofRoots(1, 0)
            expect(stored).to.be.equal(rootHash)
        })

        it("submitMileStoneProof reverts for non-creator", async () => {
            const rootHash = ethers.utils.formatBytes32String("root-hash-x")
            expect(dreamstarter.connect(buyer).submitMileStoneProof(rootHash)).to.be.revertedWith(
                "TokenFestCollab: User is not proposal creator"
            )
        })
```

Note: `numberOfMileStones` is `1` at this point (incremented by the preceding `withdrawFunds` call), so the proof is recorded under index `1`, matching the "current milestone" indexing described in the spec.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd smartcontracts && npx hardhat test --grep "submit milestone"`
Expected: FAIL — `dreamstarter.submitMileStoneProof is not a function`

- [ ] **Step 3: Implement in `TokenFestCollab.sol`**

Remove the existing milestone-string state and function:
```solidity
    string[] public mileStone; /// @notice  store the ipfs hash 
```
and:
```solidity
    function submitMileStoneInfo(
        string memory data
    ) external onlyProposalCreator {
        mileStone.push(data);
        emit MileStoneSubmitted(data);
    }
```
and the now-unused event:
```solidity
     /**
     * @dev Event emitted when a milestone is submitted.
     */
    event MileStoneSubmitted(string data);
```

Replace with:
```solidity
    mapping(uint256 => bytes32[]) public milestoneProofRoots; /// @notice 0G Storage Merkle roots per milestone index

    /**
     * @dev Event emitted when a milestone proof root hash is recorded.
     */
    event MilestoneProofRecorded(uint256 indexed milestoneIndex, bytes32 rootHash);

    /**
     * @dev Records a 0G Storage Merkle root hash as proof for the current milestone.
     * @param rootHash - Merkle root hash returned by 0G Storage for the uploaded proof file(s).
     */
    function submitMileStoneProof(
        bytes32 rootHash
    ) external onlyProposalCreator {
        milestoneProofRoots[numberOfMileStones].push(rootHash);
        emit MilestoneProofRecorded(numberOfMileStones, rootHash);
    }
```

Place the mapping declaration where `string[] public mileStone` was (near line 40), and the function where `submitMileStoneInfo` was (near line 220-228).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd smartcontracts && npx hardhat test --grep "submit milestone|submitMileStoneProof"`
Expected: PASS

- [ ] **Step 5: Run full suite to check nothing else references removed symbols**

Run: `cd smartcontracts && npx hardhat test`
Expected: PASS, no leftover references to `mileStone` or `submitMileStoneInfo` or `MileStoneSubmitted` anywhere in the test file (grep to confirm: `grep -n "mileStone\b\|submitMileStoneInfo\|MileStoneSubmitted" smartcontracts/test/dreamstartercollab.test.ts` should return nothing).

- [ ] **Step 6: Commit**

```bash
git add smartcontracts/contracts/TokenFestCollab.sol smartcontracts/test/dreamstartercollab.test.ts
git commit -m "feat: replace IPFS milestone string with 0G Storage root hash proof in TokenFestCollab"
```

---

## Task 3: Same change in `TokenFestHolder.sol`

**Files:**
- Modify: `smartcontracts/contracts/TokenFestHolder.sol`
- Test: `smartcontracts/test/dreamstarterholder.test.ts`

**Interfaces:**
- Produces: identical `milestoneProofRoots` mapping, `MilestoneProofRecorded` event, `submitMileStoneProof(bytes32)` function on `TokenFestHolder` — same shape as Task 2, kept parallel per the spec's "both, parallel changes" instruction.

- [ ] **Step 1: Write the failing test**

Find the milestone-submission test in `smartcontracts/test/dreamstarterholder.test.ts` (parallel to Task 2 Step 1's location — inside the "With Staking With CrowFunding Goal Reaches" describe block, following the `withdrawFunds`/`numberOfMileStones` sequence). Replace its `submitMileStoneInfo` call and assertion with:

```typescript
            /// Milestone Proof Submission (0G Storage root hash)
            const rootHash = ethers.utils.formatBytes32String("root-hash-1")
            await expect(dreamstarter.connect(creator).submitMileStoneProof(rootHash))
                .to.emit(dreamstarter, "MilestoneProofRecorded")
                .withArgs(1, rootHash)

            const stored = await dreamstarter.milestoneProofRoots(1, 0)
            expect(stored).to.be.equal(rootHash)
```

Add a sibling test:
```typescript
        it("submitMileStoneProof reverts for non-creator", async () => {
            const rootHash = ethers.utils.formatBytes32String("root-hash-x")
            expect(dreamstarter.connect(buyer).submitMileStoneProof(rootHash)).to.be.revertedWith(
                "TokenFestHolder: User is not proposal creator"
            )
        })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd smartcontracts && npx hardhat test --grep "submitMileStoneProof"`
Expected: FAIL — function does not exist on `TokenFestHolder`.

- [ ] **Step 3: Implement in `TokenFestHolder.sol`**

Remove:
```solidity
    string[] public mileStone;
```
and:
```solidity
     /// @dev to submit the milestone as a ipfs hash
    function submitMileStoneInfo(string memory data)external onlyProposalCreator {
        mileStone.push(data);
        emit MileStoneSubmitted(data);
    }
```
and:
```solidity
    event MileStoneSubmitted(
        string data
    );
```

Replace with (same shape as Task 2, adapted to this file's style):
```solidity
    mapping(uint256 => bytes32[]) public milestoneProofRoots;

    event MilestoneProofRecorded(uint256 indexed milestoneIndex, bytes32 rootHash);

    /// @dev Records a 0G Storage Merkle root hash as proof for the current milestone.
    function submitMileStoneProof(bytes32 rootHash) external onlyProposalCreator {
        milestoneProofRoots[numberOfMileStones].push(rootHash);
        emit MilestoneProofRecorded(numberOfMileStones, rootHash);
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd smartcontracts && npx hardhat test --grep "submitMileStoneProof"`
Expected: PASS

- [ ] **Step 5: Run full suite**

Run: `cd smartcontracts && npx hardhat test`
Expected: PASS. Confirm no leftover references: `grep -n "mileStone\b\|submitMileStoneInfo\|MileStoneSubmitted" smartcontracts/test/dreamstarterholder.test.ts` returns nothing.

- [ ] **Step 6: Commit**

```bash
git add smartcontracts/contracts/TokenFestHolder.sol smartcontracts/test/dreamstarterholder.test.ts
git commit -m "feat: replace IPFS milestone string with 0G Storage root hash proof in TokenFestHolder"
```

---

## Task 4: `AgenticVerifier.sol` (ERC-7857 verifier NFT)

**Files:**
- Create: `smartcontracts/contracts/AgenticVerifier.sol`
- Test: `smartcontracts/test/agenticverifier.test.ts`

**Interfaces:**
- Consumes: `@openzeppelin/contracts/token/ERC721/ERC721.sol`, `@openzeppelin/contracts/access/Ownable.sol` (both already a dependency per `package.json`'s `@openzeppelin/contracts": "^4.8.0"`).
- Produces: `function mint(address recipient, string calldata encryptedURI, bytes32 metadataHash) external returns (uint256 tokenId)`, `function transfer(address from, address to, uint256 tokenId, bytes calldata sealedKey, bytes calldata proof) external`, `function balanceOf(address owner) external view returns (uint256)` (inherited from ERC721), `interface IOracle { function verifyProof(bytes calldata proof) external view returns (bool); }`. Consumed by Task 5 (`TokenFestCollab`/`Holder` operator gate) and Task 7 (deploy script).

- [ ] **Step 1: Write the failing test**

Create `smartcontracts/test/agenticverifier.test.ts`:

```typescript
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { AgenticVerifier } from "../typechain-types"

describe("AgenticVerifier", () => {
    let owner: SignerWithAddress, operator: SignerWithAddress, other: SignerWithAddress
    let verifier: AgenticVerifier

    before(async () => {
        [owner, operator, other] = await ethers.getSigners()
    })

    beforeEach(async () => {
        const Factory = await ethers.getContractFactory("AgenticVerifier")
        verifier = await Factory.deploy(owner.address)
        await verifier.deployed()
    })

    it("mints a verifier token to the recipient", async () => {
        const metadataHash = ethers.utils.formatBytes32String("rubric-v1")
        await verifier.connect(owner).mint(operator.address, "0g://encrypted-uri", metadataHash)
        expect(await verifier.balanceOf(operator.address)).to.equal(1)
        expect(await verifier.ownerOf(1)).to.equal(operator.address)
    })

    it("only the contract owner can mint", async () => {
        const metadataHash = ethers.utils.formatBytes32String("rubric-v1")
        await expect(
            verifier.connect(other).mint(operator.address, "0g://encrypted-uri", metadataHash)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("transfer moves the token when the stubbed oracle approves", async () => {
        const metadataHash = ethers.utils.formatBytes32String("rubric-v1")
        await verifier.connect(owner).mint(operator.address, "0g://encrypted-uri", metadataHash)

        await verifier
            .connect(operator)
            .transfer(operator.address, other.address, 1, "0xsealedkey", "0xproof")

        expect(await verifier.ownerOf(1)).to.equal(other.address)
        expect(await verifier.balanceOf(operator.address)).to.equal(0)
    })

    it("transfer reverts if caller is not the current owner", async () => {
        const metadataHash = ethers.utils.formatBytes32String("rubric-v1")
        await verifier.connect(owner).mint(operator.address, "0g://encrypted-uri", metadataHash)

        await expect(
            verifier.connect(other).transfer(operator.address, other.address, 1, "0x", "0x")
        ).to.be.revertedWith("AgenticVerifier: Not owner")
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd smartcontracts && npx hardhat test test/agenticverifier.test.ts`
Expected: FAIL — `HH700: Artifact for contract "AgenticVerifier" not found`

- [ ] **Step 3: Write `AgenticVerifier.sol`**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgenticVerifier - ERC-7857-style agent NFT representing Sprkclub's milestone verifier
 * @dev The token's metadata is an encrypted 0G Storage blob (the verifier's judging rubric).
 * Only the current token holder may act as the milestone-review operator in TokenFestCollab/Holder.
 *
 * IMPORTANT: verifyProof() below is STUBBED to always return true. ERC-7857's value depends on
 * a real oracle that decrypts inside a TEE (or proves via ZKP), re-encrypts for the recipient,
 * and returns a verifiable proof. This contract does not implement that - see README for the
 * production design (0G Compute TEE attestation on Intel TDX / NVIDIA H100/H200).
 */
interface IOracle {
    function verifyProof(bytes calldata proof) external view returns (bool);
}

contract AgenticVerifier is ERC721, Ownable, IOracle {
    uint256 private _nextTokenId;

    mapping(uint256 => string) public encryptedURI;
    mapping(uint256 => bytes32) public metadataHash;

    event AgentMinted(uint256 indexed tokenId, address indexed recipient, bytes32 metadataHash);
    event AgentTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address initialOwner) ERC721("Sprkclub Agentic Verifier", "SPRK") Ownable() {
        transferOwnership(initialOwner);
    }

    /**
     * @dev Mints a new verifier agent token. Only the contract owner (Sprkclub) may mint.
     * @param recipient - address to receive the verifier token (the initial operator wallet).
     * @param uri - encrypted 0G Storage URI pointing at the agent's rubric blob.
     * @param hash - metadata hash of the encrypted rubric blob.
     */
    function mint(
        address recipient,
        string calldata uri,
        bytes32 hash
    ) external onlyOwner returns (uint256 tokenId) {
        _nextTokenId++;
        tokenId = _nextTokenId;
        _safeMint(recipient, tokenId);
        encryptedURI[tokenId] = uri;
        metadataHash[tokenId] = hash;
        emit AgentMinted(tokenId, recipient, hash);
    }

    /**
     * @dev Transfers the verifier token, gated on the stubbed oracle's proof check.
     * @param sealedKey - re-encrypted key for the recipient (unused by the stub oracle).
     * @param proof - re-encryption proof (unused by the stub oracle).
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external {
        require(ownerOf(tokenId) == from, "AgenticVerifier: Not owner");
        require(_msgSender() == from, "AgenticVerifier: Not owner");
        require(this.verifyProof(proof), "AgenticVerifier: Invalid proof");
        sealedKey; // unused by the stub oracle - kept in the signature for ERC-7857 shape
        _transfer(from, to, tokenId);
        emit AgentTransferred(tokenId, from, to);
    }

    /// @dev STUBBED: always returns true. See contract-level NatSpec and README for the honest
    /// explanation of what a real oracle implementation would need to do.
    function verifyProof(bytes calldata /* proof */) external pure returns (bool) {
        return true;
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd smartcontracts && npx hardhat test test/agenticverifier.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add smartcontracts/contracts/AgenticVerifier.sol smartcontracts/test/agenticverifier.test.ts
git commit -m "feat: add AgenticVerifier ERC-7857 verifier-agent NFT with stubbed oracle"
```

---

## Task 5: Gate `validate()` on `AgenticVerifier` token ownership in both contracts

**Files:**
- Modify: `smartcontracts/contracts/TokenFestCollab.sol`
- Modify: `smartcontracts/contracts/TokenFestHolder.sol`
- Test: `smartcontracts/test/dreamstartercollab.test.ts`
- Test: `smartcontracts/test/dreamstarterholder.test.ts`

**Interfaces:**
- Consumes: `AgenticVerifier.balanceOf(address) → uint256` from Task 4.
- Produces: updated constructors taking one additional `address agenticVerifierAddr` in the existing `contractAddr` array parameter (keeps the array-based constructor pattern already used for `token`/`flowRoles` — becomes a 3-element array instead of 2). Consumed by Task 7 (deploy script, which builds this array).

This task changes constructor signatures, so **existing `before()` blocks in both test files that deploy the contracts must be updated in the same commit** — otherwise Task 1-3's passing suite breaks again.

- [ ] **Step 1: Write the failing test (TokenFestCollab)**

In `smartcontracts/test/dreamstartercollab.test.ts`, in the `"DreamStarter Collab ,WithStaking with CrowFunding Goal Reaches"` describe block's `before()`, after the existing `AccessMasterFactory`/`TokenFactory` deploys, add:

```typescript
            const AgenticVerifierFactory = await ethers.getContractFactory("AgenticVerifier")
            const agenticVerifier = await AgenticVerifierFactory.deploy(owner.address)
            await agenticVerifier.connect(owner).mint(operator.address, "0g://rubric", ethers.utils.formatBytes32String("rubric-v1"))

            Addr = [token.address, accessmaster.address, agenticVerifier.address]
```
(replacing the existing `Addr = [token.address,accessmaster.address]` line in that block), and store `agenticVerifier` in an outer-scoped `let agenticVerifier: AgenticVerifier` for use below.

Then replace the existing `"Claimback when Proposal is  rejected and staked is taken"` test's plain `await dreamstarter.validate(true,false)` calls — which currently succeed because `owner` is the deployer and implicitly has `AccessMaster` operator rights — with an explicit two-part test:

```typescript
        it("validate reverts without holding the AgenticVerifier token", async () => {
            await expect(dreamstarter.connect(owner).validate(true, false)).to.be.revertedWith(
                "TokenFestCollab: User is not authorized"
            )
        })
        it("validate succeeds when caller holds the AgenticVerifier token", async () => {
            await dreamstarter.connect(operator).validate(true, false)
            expect(await dreamstarter.pause()).to.be.false
            await dreamstarter.connect(operator).validate(false, false)
            expect(await dreamstarter.pause()).to.be.true

            await dreamstarter.connect(operator).validate(false, true)
            expect(await dreamstarter.isProposalRejected()).to.be.true
            /* ... existing refund-amount assertions from the original test, unchanged,
               but every dreamstarter.validate(...) call in this block becomes
               dreamstarter.connect(operator).validate(...) */
        })
```

Note: `operator` must also hold `FLOW_OPERATOR_ROLE` on the `AccessMaster` mock for the combined check (`isOperator() && balanceOf() > 0`) to pass — `AccessMaster.sol`'s constructor already grants `FLOW_OPERATOR_ROLE` to `_msgSender()` at deploy (the `owner` signer, since `accessmaster = await AccessMasterFactory.deploy()` is called by the default signer). Add an explicit grant in the `before()` block: `await accessmaster.connect(owner).grantRole(await accessmaster.FLOW_OPERATOR_ROLE(), operator.address)`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd smartcontracts && npx hardhat test --grep "validate"`
Expected: FAIL — either a constructor arg-count mismatch (`Addr` now has 3 elements but the contract only accepts 2) or, once the constructor is stubbed to accept it (see Step 3), the old unrestricted `validate()` still passes for `owner`.

- [ ] **Step 3: Implement in `TokenFestCollab.sol`**

Add an `IERC721` import and a state variable, update the constructor and modifier:

```solidity
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
```

Add near the other contract references (`IACCESSMASTER flowRoles; IERC20 token;`):
```solidity
    IERC721 agenticVerifier;
```

In the constructor, change:
```solidity
        require(
            contractAddr.length == 2,
            "TokenFest: Invalid Contract Input"
        );
        token = IERC20(contractAddr[0]);
        flowRoles = IACCESSMASTER(contractAddr[1]);
```
to:
```solidity
        require(
            contractAddr.length == 3,
            "TokenFest: Invalid Contract Input"
        );
        token = IERC20(contractAddr[0]);
        flowRoles = IACCESSMASTER(contractAddr[1]);
        agenticVerifier = IERC721(contractAddr[2]);
```

Change the modifier:
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

- [ ] **Step 4: Same implementation in `TokenFestHolder.sol`**

Identical changes: add `import "@openzeppelin/contracts/token/ERC721/IERC721.sol";`, add `IERC721 agenticVerifier;`, extend the constructor's `require(contractAddr.length == 3, ...)` and assignment, update `onlyOperator`:

```solidity
    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()) &&
                agenticVerifier.balanceOf(_msgSender()) > 0,
            "TokenFestHolder: User is not authorized"
        );
        _;
    }
```

- [ ] **Step 5: Update `dreamstarterholder.test.ts` deploy blocks the same way as Step 1**

Apply the same `AgenticVerifier` deploy + mint + `Addr` array + `grantRole` pattern to every `before()` block in `dreamstarterholder.test.ts` that constructs `Addr` and deploys `TokenFestHolder`, and update its `validate()`-calling test the same way (revert-then-succeed split, `operator` signer).

- [ ] **Step 6: Run both test files to verify they pass**

Run: `cd smartcontracts && npx hardhat test`
Expected: PASS — every `before()` block across both files now deploys `AgenticVerifier` and passes a 3-element `Addr` array; every `validate()` call in both files uses the `operator` signer who holds both the `AccessMaster` role and the `AgenticVerifier` token.

- [ ] **Step 7: Commit**

```bash
git add smartcontracts/contracts/TokenFestCollab.sol smartcontracts/contracts/TokenFestHolder.sol smartcontracts/test/dreamstartercollab.test.ts smartcontracts/test/dreamstarterholder.test.ts
git commit -m "feat: gate validate() on AgenticVerifier token ownership in TokenFestCollab and TokenFestHolder"
```

---

## Task 6: Extend `launch.js`/`launch.json` for the new constructor param and `AgenticVerifier` deploy

**Files:**
- Modify: `smartcontracts/scripts/launch/launch.js`
- Modify: `smartcontracts/scripts/launch/launch.json`
- Modify: `smartcontracts/hardhat.config.ts`

**Interfaces:**
- Consumes: `AgenticVerifier` contract from Task 4, updated `TokenFestCollab`/`TokenFestHolder` constructors from Task 5 (now expecting a 3-element `contractAddr` array as their last positional param).
- Produces: a runnable `yarn launch --network og-testnet` / `--network og-mainnet` path, and an `AgenticVerifier` deploy branch in `launch.js`. Consumed by Task 9 (actual deploy).

- [ ] **Step 1: Add 0G networks to `hardhat.config.ts`**

In `smartcontracts/hardhat.config.ts`, add RPC URL constants near the existing `MATICMUM_RPC_URL`/`POLYGON_RPC_URL`:

```typescript
// 0G TESTNET (Galileo)
const OG_TESTNET_RPC_URL = process.env.OG_TESTNET_RPC_URL || "https://evmrpc-testnet.0g.ai"
// 0G MAINNET
const OG_MAINNET_RPC_URL = process.env.OG_MAINNET_RPC_URL || "https://evmrpc.0g.ai"
```

Add network entries inside `networks: { ... }`, alongside (not replacing) `maticmum`/`polygon`:

```typescript
    "og-testnet": {
      chainId: 16602,
      url: OG_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    "og-mainnet": {
      chainId: 16661,
      url: OG_MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
```

- [ ] **Step 2: Verify config loads**

Run: `cd smartcontracts && npx hardhat compile`
Expected: succeeds with no config parse errors (confirms the new network entries are syntactically valid; actual RPC connectivity isn't tested until Task 9's deploy).

- [ ] **Step 3: Add the `AgenticVerifier` deploy branch to `launch.js`**

In `smartcontracts/scripts/launch/launch.js`, add a new async function alongside `Token()`:

```javascript
async function AgenticVerifierDeploy() {
    const constructorParam = jsonContent.constructorParams

    const AgenticVerifierFactory = await hre.ethers.getContractFactory("AgenticVerifier")
    const agenticVerifier = await AgenticVerifierFactory.deploy(constructorParam.param1)

    await agenticVerifier.deployed()
    console.log("AgenticVerifier Deployed to:", agenticVerifier.address)
    contractAddress = agenticVerifier.address
    blockNumber = agenticVerifier.provider._maxInternalBlockNumber

    if (hre.network.name != "hardhat") {
        await agenticVerifier.deployTransaction.wait(6)
        await verify(agenticVerifier.address, [constructorParam.param1])
    }
}
```

Register it in `main()`, alongside the existing `if (jsonContent.contractName == "Token")` block:

```javascript
    /// AgenticVerifier
    if (jsonContent.contractName == "AgenticVerifier") {
        await AgenticVerifierDeploy()
    }
```

- [ ] **Step 4: Update `launch.json` to document the 3-element `contractAddr` shape**

Read the current `smartcontracts/scripts/launch/launch.json` first (it's overwritten at deploy time by the Go API per `contracts.go` Step, but serves as the template/example committed to the repo). Update its `TokenFestCollab`/`TokenFestHolder` example entries so `param6`/`param7` (whichever holds the `contractAddr` array) is documented as `[tokenAddress, accessMasterAddress, agenticVerifierAddress]` instead of two elements — match against the actual param ordering already in `launch.js`'s `TokenFestCollabDeploy`/`TokenFestHolderDeploy` (params 1-6 for Collab, 1-7 for Holder, per the existing code read in Task context).

- [ ] **Step 5: Commit**

```bash
git add smartcontracts/hardhat.config.ts smartcontracts/scripts/launch/launch.js smartcontracts/scripts/launch/launch.json
git commit -m "feat: add 0G testnet/mainnet networks and AgenticVerifier deploy path to launch script"
```

---

## Task 7: Go backend — 0G Storage upload endpoint

**Files:**
- Create: `smartcontracts/api/storage/storage.go`
- Create: `smartcontracts/api/storage/routes.go`
- Modify: `smartcontracts/api/api.go`
- Modify: `smartcontracts/go.mod` (add 0G storage SDK dependency)

**Interfaces:**
- Produces: `POST /api/milestones/:proposalAddr/:index/proof` (multipart file upload) → uploads to 0G Storage, returns `{ "rootHash": "0x...", "txHash": "0x..." }`. `GET /api/milestones/:proposalAddr/:index/proof` → returns stored root hashes read from chain and a download URL. Consumed by Task 9 (frontend).

This task follows the existing `smartcontracts/api/contracts/` package pattern (a subpackage under `api/`, registered via `ApplyRoutes(r *gin.RouterGroup)` in `api.go`).

- [ ] **Step 1: Add the 0G Storage Go SDK dependency**

Run: `cd smartcontracts && go get github.com/0gfoundation/0g-storage-client`
Expected: `go.mod` gains the new `require` line; `go.sum` updates.

- [ ] **Step 2: Write `storage.go` — the upload/download core**

```go
package storage

import (
	"context"
	"os"

	"github.com/0gfoundation/0g-storage-client/indexer"
	"github.com/0gfoundation/0g-storage-client/node"
)

type Config struct {
	RPCURL      string
	IndexerURL  string
	PrivateKey  string
}

func UploadFile(ctx context.Context, cfg Config, filePath string) (rootHash string, txHash string, err error) {
	idx, err := indexer.NewClient(cfg.IndexerURL)
	if err != nil {
		return "", "", err
	}

	file, err := node.OpenFile(filePath)
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	tree, err := file.MerkleTree()
	if err != nil {
		return "", "", err
	}

	tx, err := idx.Upload(ctx, file, cfg.RPCURL, cfg.PrivateKey)
	if err != nil {
		return "", "", err
	}

	return tree.Root().String(), tx.Hash().String(), nil
}

func DownloadFile(ctx context.Context, cfg Config, rootHash string, outputPath string) error {
	idx, err := indexer.NewClient(cfg.IndexerURL)
	if err != nil {
		return err
	}
	return idx.Download(ctx, rootHash, outputPath, true)
}

func FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
```

Note: the exact SDK function names (`indexer.NewClient`, `node.OpenFile`, `idx.Upload`, `idx.Download`) must be verified against the actual `0g-storage-client` package API when this task is implemented — the SDK version wasn't pinned to a specific release in the source docs, so check `go doc github.com/0gfoundation/0g-storage-client/indexer` after `go get` and adjust names to match if they differ. This is expected integration friction with a fast-moving SDK, not a plan defect — the shape (upload returns root+tx, download takes root+path) is the stable contract per `Og_Hack.md` Part A regardless of exact symbol names.

- [ ] **Step 3: Write `routes.go` — the gin handlers**

```go
package storage

import (
	"context"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

var cfg Config

func Configure(c Config) {
	cfg = c
}

func ApplyRoutes(r *gin.RouterGroup) {
	g := r.Group("/milestones")
	{
		g.POST("/:proposalAddr/:index/proof", uploadProof)
		g.GET("/:proposalAddr/:index/proof/:rootHash", downloadProof)
	}
}

func uploadProof(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	tmpPath := filepath.Join(os.TempDir(), fileHeader.Filename)
	if err := c.SaveUploadedFile(fileHeader, tmpPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(tmpPath)

	rootHash, txHash, err := UploadFile(context.Background(), cfg, tmpPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rootHash": rootHash, "txHash": txHash})
}

func downloadProof(c *gin.Context) {
	rootHash := c.Param("rootHash")
	outputPath := filepath.Join(os.TempDir(), rootHash)

	if err := DownloadFile(context.Background(), cfg, rootHash, outputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(outputPath)

	c.File(outputPath)
}
```

Note: `uploadProof` currently uploads to 0G Storage only — recording the root hash on-chain via `submitMileStoneProof` is a separate write call left to the frontend/caller in this task's scope (this endpoint's job is Storage only, per the spec's step-by-step data flow table where "backend uploads to Storage" and "backend calls submitMileStoneProof" are listed as two distinct steps). Task 8 wires the on-chain call.

- [ ] **Step 4: Register the new route group in `api.go`**

In `smartcontracts/api/api.go`, add the import and registration:

```go
package api

import (
	"github.com/gin-gonic/gin"
	"github.com/soumalya340/DreamStarter/smartcontracts/api/contracts"
	"github.com/soumalya340/DreamStarter/smartcontracts/api/storage"
)

func ApplyRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		contracts.ApplyRoutes(api)
		storage.ApplyRoutes(api)
	}
}
```

- [ ] **Step 5: Wire `storage.Configure` in `main.go` from environment variables**

In `smartcontracts/main.go`, before `router.Run(":9080")`:

```go
	storage.Configure(storage.Config{
		RPCURL:     os.Getenv("OG_RPC_URL"),
		IndexerURL: os.Getenv("OG_INDEXER_URL"),
		PrivateKey: os.Getenv("OG_PRIVATE_KEY"),
	})
```

Add the import `"github.com/soumalya340/DreamStarter/smartcontracts/api/storage"`.

- [ ] **Step 6: Verify it builds**

Run: `cd smartcontracts && go build ./...`
Expected: succeeds with no compile errors. (SDK symbol names from Step 2's note may need adjusting here if `go build` reports unknown identifiers — resolve against the actual installed SDK's `go doc` output before proceeding.)

- [ ] **Step 7: Manual smoke test against 0G testnet**

Run (with `OG_RPC_URL=https://evmrpc-testnet.0g.ai`, `OG_INDEXER_URL` set to the testnet indexer, `OG_PRIVATE_KEY` set to a funded testnet key from `faucet.0g.ai`):
```bash
cd smartcontracts && go run main.go &
curl -F "file=@./README.md" http://localhost:9080/api/milestones/0xTEST/1/proof
```
Expected: JSON response with a non-empty `rootHash` and `txHash`. Kill the background server after confirming (`kill %1`).

- [ ] **Step 8: Commit**

```bash
git add smartcontracts/api/storage smartcontracts/api/api.go smartcontracts/main.go smartcontracts/go.mod smartcontracts/go.sum
git commit -m "feat: add 0G Storage upload/download endpoints to Go backend"
```

---

## Task 8: Go backend — on-chain `submitMileStoneProof` call after upload

**Files:**
- Create: `smartcontracts/api/onchain/submit.go`
- Modify: `smartcontracts/api/storage/routes.go`

**Interfaces:**
- Consumes: `submitMileStoneProof(bytes32)` from Task 2/3, the `rootHash` string produced by Task 7's `UploadFile`.
- Produces: the upload endpoint now also writes on-chain, returning `{ "rootHash", "storageTxHash", "chainTxHash" }`.

- [ ] **Step 1: Write `onchain/submit.go` using `go-ethereum`'s `abigen`-free raw call pattern**

Since this repo has no existing Go contract-binding generation set up for `TokenFestCollab`/`Holder` (the `api/contracts` package handles deploys via shelling out to `yarn launch`, not direct contract calls), this task calls `submitMileStoneProof` via a raw ABI-encoded transaction rather than introducing `abigen`-generated bindings — smaller surface area for a two-day build.

```go
package onchain

import (
	"context"
	"crypto/ecdsa"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const submitMileStoneProofABI = `[{"inputs":[{"internalType":"bytes32","name":"rootHash","type":"bytes32"}],"name":"submitMileStoneProof","outputs":[],"stateMutability":"nonpayable","type":"function"}]`

func SubmitMilestoneProof(ctx context.Context, rpcURL string, privateKeyHex string, proposalAddr string, rootHash [32]byte) (txHash string, err error) {
	client, err := ethclient.DialContext(ctx, rpcURL)
	if err != nil {
		return "", err
	}
	defer client.Close()

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", err
	}
	publicKey := privateKey.Public().(*ecdsa.PublicKey)
	fromAddr := crypto.PubkeyToAddress(*publicKey)

	parsedABI, err := abi.JSON(stringsReader(submitMileStoneProofABI))
	if err != nil {
		return "", err
	}
	data, err := parsedABI.Pack("submitMileStoneProof", rootHash)
	if err != nil {
		return "", err
	}

	nonce, err := client.PendingNonceAt(ctx, fromAddr)
	if err != nil {
		return "", err
	}
	gasPrice, err := client.SuggestGasPrice(ctx)
	if err != nil {
		return "", err
	}
	chainID, err := client.ChainID(ctx)
	if err != nil {
		return "", err
	}

	toAddr := common.HexToAddress(proposalAddr)
	tx := types.NewTx(&types.LegacyTx{
		Nonce:    nonce,
		GasPrice: gasPrice,
		Gas:      uint64(300000),
		To:       &toAddr,
		Value:    big.NewInt(0),
		Data:     data,
	})

	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return "", err
	}
	if err := client.SendTransaction(ctx, signedTx); err != nil {
		return "", err
	}
	return signedTx.Hash().Hex(), nil
}
```

Add the small helper this needs (`stringsReader` — `abi.JSON` takes an `io.Reader`):
```go
func stringsReader(s string) *strings.Reader {
	return strings.NewReader(s)
}
```
(add `"strings"` to the import block).

- [ ] **Step 2: Add the `go-ethereum` dependency if not already present**

Run: `cd smartcontracts && go get github.com/ethereum/go-ethereum@latest`
Expected: `go.mod`/`go.sum` updated. (Check first — `go.mod` as read during planning doesn't list it, so this is a new dependency.)

- [ ] **Step 3: Wire it into `uploadProof` in `storage/routes.go`**

Modify `uploadProof` from Task 7 Step 3: after the successful `UploadFile` call, convert the returned `rootHash` string to `[32]byte` and call `onchain.SubmitMilestoneProof`:

```go
	rootHash, storageTxHash, err := UploadFile(context.Background(), cfg, tmpPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	proposalAddr := c.Param("proposalAddr")
	var rootHashBytes [32]byte
	copy(rootHashBytes[:], common.FromHex(rootHash))

	chainTxHash, err := onchain.SubmitMilestoneProof(context.Background(), cfg.RPCURL, cfg.PrivateKey, proposalAddr, rootHashBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage upload succeeded but on-chain record failed: " + err.Error(), "rootHash": rootHash, "storageTxHash": storageTxHash})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rootHash": rootHash, "storageTxHash": storageTxHash, "chainTxHash": chainTxHash})
```

Add imports: `"github.com/ethereum/go-ethereum/common"` and `"github.com/soumalya340/DreamStarter/smartcontracts/api/onchain"`.

- [ ] **Step 4: Verify it builds**

Run: `cd smartcontracts && go build ./...`
Expected: succeeds.

- [ ] **Step 5: Manual smoke test against 0G testnet**

Prerequisite: deploy a `TokenFestCollab` instance to `og-testnet` first (this can borrow the deploy flow finished in Task 6/9, run early against testnet only for this smoke test — full mainnet deploy stays in Task 9).

Run:
```bash
cd smartcontracts && go run main.go &
curl -F "file=@./README.md" http://localhost:9080/api/milestones/<deployed-testnet-address>/1/proof
```
Expected: JSON response with `rootHash`, `storageTxHash`, `chainTxHash` all populated. Confirm on `chainscan-galileo.0g.ai` that `chainTxHash` shows a successful `submitMileStoneProof` call. Kill server after (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add smartcontracts/api/onchain smartcontracts/api/storage/routes.go smartcontracts/go.mod smartcontracts/go.sum
git commit -m "feat: record 0G Storage root hash on-chain via submitMileStoneProof after upload"
```

---

## Task 9: Frontend — milestone proof upload step in `launch/` flow

**Files:**
- Modify: `front-end/src/components/launch/ProposalSummary` (check existing files in this directory during implementation for the right insertion point — this is the step shown after a proposal is created)
- Create: `front-end/src/components/launch/MilestoneProofUpload/index.tsx`
- Modify: `front-end/src/ContextProviders/ProposalProvider.tsx`

**Interfaces:**
- Consumes: `POST /api/milestones/:proposalAddr/:index/proof` from Task 8 (multipart upload, returns `{ rootHash, storageTxHash, chainTxHash }`).
- Produces: a reusable `<MilestoneProofUpload proposalAddr={string} milestoneIndex={number} onSuccess={(rootHash: string) => void} />` component, consumed by Task 10's operator review view for symmetry (same upload path).

- [ ] **Step 1: Read the existing `launch/ProposalSummary` and `launch/CreateProposal` directories to match conventions**

Before writing code: `ls -la front-end/src/components/launch/ProposalSummary front-end/src/components/launch/CreateProposal` and read at least the top-level `index.tsx` of each to match the existing component style (styling approach, how it reads `ProposalProvider` context, how it calls contract methods via the ABI files in `front-end/src/abi/`). This step has no automated pass/fail — it's a read-before-write step that the file structure alone can't substitute for, since the plan was written without seeing these files' contents.

- [ ] **Step 2: Write `MilestoneProofUpload/index.tsx`**

```typescript
import { useState } from "react"

type Props = {
    proposalAddr: string
    milestoneIndex: number
    onSuccess: (rootHash: string) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9080"

export default function MilestoneProofUpload({ proposalAddr, milestoneIndex, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch(
                `${BACKEND_URL}/api/milestones/${proposalAddr}/${milestoneIndex}/proof`,
                { method: "POST", body: formData }
            )
            if (!res.ok) {
                const body = await res.json()
                throw new Error(body.error || "Upload failed")
            }
            const data = await res.json()
            onSuccess(data.rootHash)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={uploading}
            />
            <button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Uploading to 0G Storage..." : "Submit Milestone Proof"}
            </button>
            {error && <p role="alert">{error}</p>}
        </div>
    )
}
```

This deliberately has no styling pass — matching the plan's Wave-3 scope note that the operator/proof UI can be internal-only/unstyled. If `ProposalSummary`'s existing components use a specific UI library (discovered in Step 1), swap the raw `<input>`/`<button>` for that library's equivalents, keeping the same props and fetch logic.

- [ ] **Step 3: Insert the component into the milestone-submission point of the launch flow**

Based on Step 1's findings, add `<MilestoneProofUpload proposalAddr={...} milestoneIndex={...} onSuccess={(rootHash) => { /* show confirmation, e.g. toast or inline text with rootHash */ }} />` wherever the flow currently would have called the now-removed `submitMileStoneInfo`. Since `submitMileStoneInfo` was contract-only (no evidence of frontend wiring was found during the repo summary's exploration of `ProposalProvider.tsx`), this may be a genuinely new UI section rather than a replacement — confirm during Step 1's read which is the case.

- [ ] **Step 4: Manual verification**

Run: `cd front-end && npm run dev`, navigate to the relevant `launch/` page, confirm the upload component renders and (with the Task 7/8 backend running locally and `NEXT_PUBLIC_BACKEND_URL` pointed at it) a file upload triggers a network call to `/api/milestones/...` and displays the returned root hash on success.

- [ ] **Step 5: Commit**

```bash
git add front-end/src/components/launch/MilestoneProofUpload front-end/src/components/launch/ProposalSummary front-end/src/ContextProviders/ProposalProvider.tsx
git commit -m "feat: add milestone proof upload UI to launch flow"
```

---

## Task 10: Frontend — proof status display + operator review view

**Files:**
- Modify: `front-end/src/components/explore/Ongoing` (check existing files during implementation)
- Create: `front-end/src/app/explore/ongoing-proposals/operator-review/page.tsx`
- Create: `front-end/src/components/explore/OperatorReview/index.tsx`

**Interfaces:**
- Consumes: `milestoneProofRoots(uint256, uint256) → bytes32` and the `Validate`/`MilestoneProofRecorded` events from Task 2/3/5's contracts (read via the existing ABI-reading pattern in `ProposalProvider.tsx`), the `MilestoneProofUpload` component from Task 9 (reused here for symmetry, not re-implemented).

- [ ] **Step 1: Read `components/explore/Ongoing` to match existing proposal-listing conventions**

Same rationale as Task 9 Step 1 — read before writing to match the existing pattern for reading contract state and rendering proposal cards.

- [ ] **Step 2: Add milestone proof status to the ongoing-proposals display**

For each proposal card, read `numberOfMileStones` and `milestoneProofRoots(numberOfMileStones, 0)` (existence check: non-zero-length array read, or catch the revert if the index has no entries yet) to show one of: "No proof submitted yet" / "Proof submitted, pending review" (proof root exists, `pause == true`, `isProposalRejected == false`) / "Milestone approved" (`pause == false` after a milestone) / "Rejected". This reuses whatever contract-read hook pattern `ProposalProvider.tsx` already establishes — extend it with a `milestoneProofRoots` read rather than inventing a new fetching approach.

- [ ] **Step 3: Write the operator review page**

`front-end/src/app/explore/ongoing-proposals/operator-review/page.tsx` — a simple listing (can reuse most of the ongoing-proposals list logic) filtered to proposals where a proof root exists but `validate()` hasn't yet been called for it (`pause == true` and a `milestoneProofRoots` entry exists for the current `numberOfMileStones`), with a "View Proof" link that hits `GET /api/milestones/:proposalAddr/:index/proof/:rootHash` (Task 7) to download/preview the file, and "Approve"/"Reject" buttons that call `validate(true, false)` / `validate(false, true)` directly via the connected wallet (using whatever wallet-write pattern the codebase already uses elsewhere for contract writes — check `ProposalProvider.tsx` or `CreateProposal` for the existing pattern rather than introducing a new one).

The connected wallet must hold the `AgenticVerifier` token for `validate()` to succeed (Task 5's on-chain gate) — this page does not need its own permission check before showing the buttons; a wallet that doesn't hold the token will simply see the transaction revert, which is acceptable for a Wave-3 internal tool.

- [ ] **Step 4: Manual verification**

Run: `cd front-end && npm run dev`, navigate to `/explore/ongoing-proposals/operator-review`, confirm proposals with a submitted-but-unreviewed proof appear, and that (with a wallet holding the `AgenticVerifier` token connected, against a testnet deployment) clicking Approve successfully calls `validate()` and the proposal disappears from the pending list on next refresh.

- [ ] **Step 5: Commit**

```bash
git add front-end/src/components/explore/Ongoing front-end/src/app/explore/ongoing-proposals/operator-review front-end/src/components/explore/OperatorReview
git commit -m "feat: add milestone proof status display and operator review view"
```

---

## Task 11: 0G testnet deploy + end-to-end smoke test

**Files:**
- No new files — this is a deployment/verification task.

**Interfaces:**
- Consumes: everything from Tasks 1-10.
- Produces: a deployed, working stack on 0G testnet (Galileo, chain ID 16602), proving the full loop before spending real mainnet gas in Task 12.

- [ ] **Step 1: Fund a testnet wallet**

Get testnet 0G from `faucet.0g.ai` (0.1 0G/wallet/day — may need to request across a couple of days if deploy + several transactions exceed one day's allowance). Set `PRIVATE_KEY` in `smartcontracts/.env` to this wallet's key.

- [ ] **Step 2: Deploy `AccessMaster`, `MyToken`, `AgenticVerifier` to testnet**

Using the existing `launch.json`-driven flow (Task 6): set `launch.json`'s `contractName` to `"AccessMaster"`, run `yarn launch --network og-testnet`; repeat for `"Token"` and `"AgenticVerifier"` (passing the deployer address as `param1` for `AgenticVerifier`, per Task 6 Step 3's `constructorParam.param1`). Record the three resulting addresses.

- [ ] **Step 3: Mint the verifier token to the operator wallet**

Using a Hardhat console or a short one-off script: `npx hardhat console --network og-testnet`, then `const v = await ethers.getContractAt("AgenticVerifier", "<address>"); await v.mint("<operator-address>", "0g://testnet-rubric", ethers.utils.formatBytes32String("rubric-v1"))`.

- [ ] **Step 4: Deploy `TokenFestCollab` (or `Holder`) with the 3-element `contractAddr` array**

Set `launch.json`'s `constructorParams` to include `[tokenAddress, accessMasterAddress, agenticVerifierAddress]` in the correct positional slot (per Task 6 Step 4's documentation update), run `yarn launch --network og-testnet`.

- [ ] **Step 5: Run the Go backend against testnet config**

Set `OG_RPC_URL=https://evmrpc-testnet.0g.ai`, `OG_INDEXER_URL` to the testnet Storage indexer, `OG_PRIVATE_KEY` to the funded testnet key. `cd smartcontracts && go run main.go`.

- [ ] **Step 6: Run the frontend against testnet**

Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:9080` and whatever chain-config env var the frontend uses for RPC/chain ID (check `front-end/src/ContextProviders/ProposalProvider.tsx` and any `next.config.js` env wiring during this step) to point at 0G testnet. `cd front-end && npm run dev`.

- [ ] **Step 7: End-to-end walkthrough**

Using the deployed `TokenFestCollab`/`Holder` instance: complete a full cycle — creator stakes, buyer mints a ticket, creator withdraws funds for milestone 1 (per existing tested flow), creator uploads a milestone proof file via the Task 9 UI, confirm the root hash appears on `storagescan-galileo.0g.ai` and the `MilestoneProofRecorded` event appears on `chainscan-galileo.0g.ai`, operator (holding the `AgenticVerifier` token) reviews and approves via the Task 10 UI, confirm `pause` flips to `false` on-chain.

Expected: every step succeeds without manual contract-console intervention beyond what's described above.

- [ ] **Step 8: Record findings**

No commit for this task (no code changes) — but note any SDK symbol-name corrections needed in Task 7 Step 2's implementation (flagged as expected friction in that task) so they're fixed before the mainnet deploy in Task 12.

---

## Task 12: 0G mainnet deploy (submission-ready)

**Files:**
- No new files — deployment task, same procedure as Task 11 targeting `og-mainnet`.

**Interfaces:**
- Consumes: the verified-working testnet flow from Task 11.
- Produces: the mainnet contract addresses and explorer links required by `Og_Hack.md`'s submission checklist.

- [ ] **Step 1: Fund the mainnet deployer wallet**

No faucet exists — buy or bridge 0G via `get.0g.ai` ahead of time. Budget for: 4 contract deploys (`AccessMaster`, `MyToken` or real stablecoin, `AgenticVerifier`, `TokenFestCollab`/`Holder`) + at least one `submitMileStoneProof` transaction + one `validate()` transaction, per `Og_Hack.md`'s explicit minimum bar ("push at least one real transaction so the explorer link is not empty").

- [ ] **Step 2: Repeat Task 11 Steps 2-4 with `--network og-mainnet`**

Same deploy sequence, targeting mainnet. Record every contract address.

- [ ] **Step 3: Run the Go backend and frontend against mainnet config**

Same as Task 11 Steps 5-6, with `OG_RPC_URL=https://evmrpc.0g.ai`, mainnet indexer, mainnet chain ID 16661.

- [ ] **Step 4: Execute one real end-to-end cycle on mainnet**

Repeat Task 11 Step 7's walkthrough against the mainnet deployment — this produces the "genuine on-chain activity" `Og_Hack.md` requires, not a testnet-only demo.

- [ ] **Step 5: Collect explorer links**

From `chainscan.0g.ai`: the deploy transaction and the `submitMileStoneProof`/`validate()` transactions for each contract. From the Storage side: confirm the uploaded proof file's root hash is retrievable.

- [ ] **Step 6: No commit — this is infrastructure state, not code**

Record the addresses and links in the README (Task 13) instead.

---

## Task 13: README — architecture, honesty about the stub, reproduction steps

**Files:**
- Modify: `smartcontracts/Readme.md` (existing file — confirm exact filename casing before editing) or `README.md` at repo root (check which one is the canonical entry point during implementation).

**Interfaces:**
- Consumes: mainnet addresses/links from Task 12.

- [ ] **Step 1: Read the existing README(s) to match tone/structure**

`cat smartcontracts/Readme.md README.md` — confirm which file judges will actually land on per the repo's existing structure, and whether to extend it or the root `README.md`.

- [ ] **Step 2: Write the required sections**

Add (to whichever file Step 1 identifies as canonical, or both if the root README is the product pitch and `smartcontracts/Readme.md` is the technical one — split accordingly):

- **Architecture diagram**: the flow from the spec's §4 (creator uploads → 0G Storage → root hash on-chain → AgenticVerifier-gated validate → unlock/refund), as an ASCII diagram or a linked image.
- **0G modules used and how**: 0G Chain (contracts deployed at `<mainnet addresses from Task 12>`), 0G Storage (milestone proof files, indexer `indexer-storage-turbo.0g.ai`), Agentic ID / ERC-7857 (`AgenticVerifier.sol` — explicitly state: *"`verifyProof()` is stubbed to always return `true`. A production implementation would decrypt inside a TEE (0G Compute's Intel TDX / NVIDIA H100-H200 enclaves) or use a ZKP, generate a fresh key, re-encrypt for the recipient, and return a proof the contract verifies — not built this wave."*).
- **Mainnet contract addresses + explorer links** from Task 12 Step 5.
- **Local deployment / reproduction steps**: environment variables needed (`PRIVATE_KEY`, `OG_RPC_URL`, `OG_INDEXER_URL`, `OG_PRIVATE_KEY`, `NEXT_PUBLIC_BACKEND_URL`), the `yarn launch --network og-mainnet` sequence from Task 12 Step 2, `go run main.go`, `npm run dev`.
- **Known limitations**: no automatic timeout for a stuck post-funding milestone (per spec §6), backend upload/on-chain-record isn't atomic (per spec §6).

- [ ] **Step 3: Commit**

```bash
git add smartcontracts/Readme.md README.md
git commit -m "docs: document 0G integration architecture, mainnet addresses, and stubbed oracle"
```

---

## Task 14: Demo video, X post, AKINDO submission

**Files:** none — process task, not a code task.

- [ ] **Step 1: Record a ≤3 minute demo**

Show: creating a proposal, staking, minting a ticket, withdrawing milestone funds, uploading a milestone proof (showing the 0G Storage root hash appear), the operator reviewing and approving via the `AgenticVerifier`-gated UI, and the resulting on-chain state change — with `chainscan.0g.ai` visibly showing the transaction at least once on screen, per `Og_Hack.md`'s explicit requirement ("show the 0G integration explicitly on screen"). Upload to YouTube or Loom (public).

- [ ] **Step 2: Post on X**

Per `Og_Hack.md`'s exact requirement: project name, demo screenshot or short clip, hashtags `#0GBridge` and `#BuildOn0G`, tags `@0G_labs`, `@0G_Builders`, `@AKINDO_io`.

- [ ] **Step 3: Submit on AKINDO**

Before 2026-08-30 20:30 IST. Include: project info (name, ≤30-word description, what it does/problem/0G components used), public GitHub repo link, mainnet contract address + explorer link, demo video link, README link, X post link.

- [ ] **Step 4: No commit — external actions only.**

---

## Self-Review Notes

- **Spec coverage:** §4.1 (contract changes) → Tasks 2, 3, 4, 5. §4.2 (backend) → Tasks 7, 8. §4.3 (frontend) → Tasks 9, 10. §4.4 (deploy target) → Tasks 6, 11, 12. §5 (data flow table) → reflected directly in Task 8's split between Storage-only (Task 7) and Storage+Chain (Task 8). §6 (error handling/edge cases) → carried into Task 13's "known limitations" section rather than new code, matching the spec's explicit "out of scope, flag as a known gap in README" framing for the stuck-milestone case. §7 (submission requirements) → Task 13 (docs) and Task 14 (video/X/submission). §8 (testing) → embedded in every contract task (2, 3, 4, 5) as TDD steps, plus Task 7/8/11's manual smoke tests for the parts that can't be unit-tested (SDK calls against a live network). §9 (open items) → resolved during plan-writing: backend is Go (extends existing `api/`), `AccessMaster.sol` already exists as `contracts/mocks/AccessMaster.sol` (Task 5 uses it as-is, no new file needed), mock ERC20 already exists as `contracts/mocks/Token.sol`.
- **Placeholder scan:** no TBD/TODO left unresolved; the one acknowledged uncertainty (Task 7 Step 2's exact SDK symbol names) is flagged explicitly as expected external-SDK friction with a concrete verification step (`go doc`), not a vague "figure it out later."
- **Type consistency:** `submitMileStoneProof(bytes32)` name and signature is identical across Tasks 2, 3, 7, 8, 9. `milestoneProofRoots` mapping name is identical across Tasks 2, 3, 10. `AgenticVerifier.mint`/`.transfer`/`.balanceOf` signatures from Task 4 are used unchanged in Tasks 5, 6, 9, 10, 11.
