import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Module from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const emptyPath = join(here, "server-only-stub.cjs");

register(pathToFileURL(join(here, "smoke-hooks.mjs")).href, pathToFileURL(here).href);

const orig = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "server-only") return emptyPath;
  return orig.call(this, request, parent, isMain, options);
};
