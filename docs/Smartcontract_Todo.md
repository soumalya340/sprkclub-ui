1. put all smart contract code and tests from old hardhat folder [smartcontracts] to new foundary contract folder named sprkclub-smartcontract
2. it should build or compile properly

## Done

- Foundry project: `sprkclub-smartcontract/`
- Sources synced from `smartcontracts/contracts/` → `src/`
- OpenZeppelin v4.9.6 + forge-std installed
- `forge build` — Compiler run successful (solc 0.8.17)
- Forge tests: `test/TokenFestCollab.t.sol`, `test/TokenFestHolder.t.sol` — **14 passed**
- Original Hardhat TS tests kept under `test/legacy/` for reference
