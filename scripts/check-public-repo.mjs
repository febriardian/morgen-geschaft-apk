import { readFileSync, readdirSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  ".expo",
  "dist",
  "coverage",
]);
const forbiddenNames = [
  /^\.env(?:\..+)?$/i,
  /google-services\.json$/i,
  /GoogleService-Info\.plist$/i,
  /service-account.*\.json$/i,
  /\.(?:apk|aab|jks|keystore|p8|p12|pem|log|zip|bak|backup)$/i,
];
const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".yml",
  ".yaml",
  ".md",
]);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[opusr]_[A-Za-z0-9_]{30,}\b/,
  /"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----/,
];
const failures = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
      continue;
    }

    const relative = path.slice(root.length + 1);
    const name = basename(path);
    if (
      name !== ".env.example" &&
      forbiddenNames.some((pattern) => pattern.test(name))
    ) {
      failures.push(
        `${relative}: file type is not allowed in the public repository`,
      );
    }
    if (
      relative !== "scripts/check-public-repo.mjs" &&
      textExtensions.has(extname(name).toLowerCase())
    ) {
      const content = readFileSync(path, "utf8");
      if (secretPatterns.some((pattern) => pattern.test(content))) {
        failures.push(`${relative}: possible credential material detected`);
      }
    }
  }
}

walk(root);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "No forbidden public-repository files or credential patterns detected.",
);
