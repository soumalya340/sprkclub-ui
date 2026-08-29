// Re-exports contract ABIs from the Foundry build output into src/lib/chain/abi.
// Run after `forge build` in deps/sprkclub-smartcontract.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "deps/sprkclub-smartcontract/out";
const DEST = "src/lib/chain/abi";

const CONTRACTS = {
  SprkClubCollab: "SprkClubCollab.sol",
  SprkClubHolder: "SprkClubHolder.sol",
  AgenticVerifier: "AgenticVerifier.sol",
  MyToken: "Token.sol",
  AccessMaster: "AccessMaster.sol",
};

mkdirSync(DEST, { recursive: true });

for (const [name, folder] of Object.entries(CONTRACTS)) {
  const src = join(OUT_DIR, folder, `${name}.json`);
  const { abi } = JSON.parse(readFileSync(src, "utf8"));
  writeFileSync(
    join(DEST, `${name}.ts`),
    `// Auto-exported from Foundry build output (${OUT_DIR}/${folder}/${name}.json).\n` +
      `// Regenerate with: npm run abi:sync\n` +
      `export const ${name}Abi = ${JSON.stringify(abi, null, 2)} as const;\n`,
  );
  console.log(`${name}: ${abi.length} entries`);
}
