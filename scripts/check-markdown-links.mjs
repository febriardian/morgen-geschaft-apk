import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

const root = process.cwd();
const ignored = new Set(["node_modules", ".git", ".expo", "dist", "coverage"]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? walk(path)
      : extname(entry.name).toLowerCase() === ".md"
        ? [path]
        : [];
  });
}

const failures = [];
for (const file of walk(root)) {
  const content = readFileSync(file, "utf8");
  const targets = [
    ...Array.from(
      content.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g),
      (match) => match[1],
    ),
    ...Array.from(
      content.matchAll(/<(?:img|a)\b[^>]+(?:src|href)=["']([^"']+)["']/gi),
      (match) => match[1],
    ),
  ];

  for (const rawTarget of targets) {
    const target = rawTarget.trim().replace(/^<|>$/g, "").split(/[?#]/, 1)[0];
    if (!target || /^(?:https?:|mailto:|tel:)/i.test(target)) continue;
    const localPath = resolve(dirname(file), decodeURIComponent(target));
    if (!existsSync(localPath) || !statSync(localPath).isFile()) {
      failures.push(`${file.slice(root.length + 1)} -> ${rawTarget}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken local Markdown links:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("All local Markdown links are valid.");
