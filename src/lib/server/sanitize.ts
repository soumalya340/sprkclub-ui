/**
 * Creator-supplied content is untrusted model input. Ported from
 * deps/sprkclub-verifier for the advisory scorecard path.
 */

export const EVIDENCE_FENCE = "========== UNTRUSTED_CREATOR_EVIDENCE ==========";
export const EVIDENCE_FENCE_END = "======== END_UNTRUSTED_CREATOR_EVIDENCE ========";

const INJECTION_PATTERNS: Array<{ label: string; re: RegExp }> = [
  {
    label: "instruction-override",
    re: /\b(ignore|disregard|forget|override)\b[\s\S]{0,40}\b(previous|prior|above|earlier|all)\b[\s\S]{0,20}\b(instruction|prompt|rule|direction)/gi,
  },
  { label: "role-injection", re: /^\s*(system|assistant|developer)\s*:/gim },
  {
    label: "verdict-forcing",
    re: /\b(mark|set|output|return|respond with|answer)\b[\s\S]{0,30}\b(approved|pass(ed)?|true|verdict)\b/gi,
  },
  { label: "fence-forgery", re: /=+\s*(END_)?UNTRUSTED_CREATOR_EVIDENCE\s*=+/gi },
  { label: "json-forgery", re: /"\s*(status|verdict|injectionSuspected|pass|overallScore)\s*"\s*:/gi },
  {
    label: "authority-claim",
    re: /\b(as|i am)\s+the\s+(protocol\s+)?(owner|admin|operator|deployer|developer)\b[\s\S]{0,80}\b(approve|approved|release|unlock|pass this|validate|authoris|authoriz)/gi,
  },
];

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const HIDDEN_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;

export type SanitizedEvidence = {
  content: string;
  flags: string[];
  truncated: boolean;
};

function defuseFences(input: string): string {
  return input.replace(
    /=+\s*(END_)?UNTRUSTED_CREATOR_EVIDENCE\s*=+/gi,
    "[redacted-delimiter]",
  );
}

export function sanitizeEvidence(raw: string, maxChars: number): SanitizedEvidence {
  const flags = new Set<string>();

  for (const { label, re } of INJECTION_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(raw)) flags.add(label);
  }

  let content = defuseFences(raw);
  content = content.replace(CONTROL_CHARS, "");

  HIDDEN_CHARS.lastIndex = 0;
  if (HIDDEN_CHARS.test(content)) {
    flags.add("hidden-unicode");
    content = content.replace(HIDDEN_CHARS, "");
  }

  let truncated = false;
  if (content.length > maxChars) {
    content = content.slice(0, maxChars);
    truncated = true;
  }

  return { content, flags: [...flags], truncated };
}

/** Best-effort text extract from proof bytes (utf-8 when printable). */
export function extractProofText(bytes: Uint8Array, maxChars = 12_000): string {
  try {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const printable = text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "").trim();
    if (printable.length >= 32) {
      return printable.slice(0, maxChars);
    }
  } catch {
    // fall through
  }
  return `(binary proof, ${bytes.byteLength} bytes — no readable text extract)`;
}
