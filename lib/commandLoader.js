import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const files = await glob("commands/**/*.js", { cwd: process.cwd(), nodir: true });
  const list = [];
  for (const f of files) {
    const mod = await import(path.resolve(f));
    if (mod?.default?.name && typeof mod.default.run === "function") list.push(mod.default);
  }
  return list;
}

export function getCommand(registry, name) {
  return registry.find((c) => c.name === name || (Array.isArray(c.aliases) && c.aliases.includes(name)));
}

export function listCategories(registry) {
  const catMap = {};
  for (const cmd of registry) {
    catMap[cmd.category || "General"] ||= [];
    catMap[cmd.category].push(cmd.name);
  }
  return catMap;
}
