// Re-exports contract ABIs from the Foundry build output into src/lib/chain/abi.
// Run after `forge build` in ../sprkclub-smartcontract (sources match deps/smart_contracts).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "../sprkclub-smartcontract/out";
const DEST = "src/lib/chain/abi";

// artifactJson defaults to `${name}.json` under the forge folder.
const CONTRACTS = {
  SprkClubCollab: { folder: "SprkClubCollab.sol" },
  SprkClubHolder: { folder: "SprkClubHolder.sol" },
  AgenticVerifier: { folder: "AgenticVerifier.sol" },
  // Prefer current SprkCoin/SprkToken; fall back to legacy Token.sol/MyToken.
  MyToken: [
    { folder: "SprkCoin.sol", artifact: "SprkToken.json" },
    { folder: "Token.sol", artifact: "MyToken.json" },
  ],
  AccessMaster: { folder: "AccessMaster.sol" },
};

function resolveSrc(entry) {
  const candidates = Array.isArray(entry) ? entry : [entry];
  for (const c of candidates) {
    const artifact = c.artifact ?? `${c.name ?? ""}.json`;
    // When single-object form, artifact is filled by caller with the export name.
    const src = join(OUT_DIR, c.folder, artifact);
    if (existsSync(src)) return src;
  }
  return null;
}

mkdirSync(DEST, { recursive: true });

for (const [name, entry] of Object.entries(CONTRACTS)) {
  const normalized = Array.isArray(entry)
    ? entry
    : [{ ...entry, artifact: entry.artifact ?? `${name}.json` }];
  const src = resolveSrc(normalized);
  if (!src) {
    console.warn(`skip ${name}: no forge artifact under ${OUT_DIR}`);
    continue;
  }
  const { abi } = JSON.parse(readFileSync(src, "utf8"));
  const rel = src.replace(/\\/g, "/");
  writeFileSync(
    join(DEST, `${name}.ts`),
    `// Auto-exported from Foundry build output (${rel}).\n` +
      `// Regenerate with: npm run abi:sync\n` +
      `export const ${name}Abi = ${JSON.stringify(abi, null, 2)} as const;\n`,
  );
  console.log(`${name}: ${abi.length} entries ← ${rel}`);
}
