/**
 * Custom loader for Node smokes:
 * - stubs `server-only` (Next's client-guard package)
 * - resolves `@/` to `src/`
 */
import { pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const root = resolvePath(import.meta.dirname, "..");
const stubUrl = pathToFileURL(
  resolvePath(import.meta.dirname, "server-only-stub.mjs"),
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return { shortCircuit: true, url: stubUrl };
  }
  if (specifier.startsWith("@/")) {
    const abs = resolvePath(root, "src", specifier.slice(2));
    return nextResolve(pathToFileURL(abs).href, context);
  }
  return nextResolve(specifier, context);
}
