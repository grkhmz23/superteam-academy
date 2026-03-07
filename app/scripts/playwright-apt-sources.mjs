#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const OFFICIAL_APT_HOSTS = new Set([
  "archive.debian.org",
  "archive.ubuntu.com",
  "deb.debian.org",
  "ports.ubuntu.com",
  "security.debian.org",
  "security.ubuntu.com",
]);

function normalizeContent(content) {
  return content.replace(/\r\n/g, "\n");
}

export function isOfficialAptUri(uri) {
  if (!uri) return false;

  try {
    const parsed = new URL(uri);
    return OFFICIAL_APT_HOSTS.has(parsed.host);
  } catch {
    return false;
  }
}

export function sanitizeListFileContent(content) {
  const lines = normalizeContent(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const kept = lines.filter((line) => {
    if (line.startsWith("#")) {
      return false;
    }

    if (!line.startsWith("deb ") && !line.startsWith("deb-src ")) {
      return false;
    }

    const [, uri] = line.split(/\s+/, 3);
    return isOfficialAptUri(uri);
  });

  return kept.join("\n");
}

function parseDeb822Block(block) {
  const fields = new Map();
  let currentField = null;

  for (const rawLine of normalizeContent(block).split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    const fieldMatch = /^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/.exec(line);
    if (fieldMatch) {
      currentField = fieldMatch[1];
      fields.set(currentField, fieldMatch[2].trim());
      continue;
    }

    if (currentField && /^\s+/.test(rawLine)) {
      const current = fields.get(currentField) ?? "";
      fields.set(currentField, `${current} ${line.trim()}`.trim());
    }
  }

  return fields;
}

export function sanitizeSourcesFileContent(content) {
  const blocks = normalizeContent(content)
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const kept = blocks.filter((block) => {
    const fields = parseDeb822Block(block);
    const uris = (fields.get("URIs") ?? "")
      .split(/\s+/)
      .map((value) => value.trim())
      .filter(Boolean);

    return uris.length > 0 && uris.every(isOfficialAptUri);
  });

  return kept.join("\n\n");
}

function collectSourceFiles(aptDir) {
  const files = [];
  const sourcesList = join(aptDir, "sources.list");
  if (existsSync(sourcesList) && statSync(sourcesList).isFile()) {
    files.push({ sourcePath: sourcesList, relativePath: "sources.list" });
  }

  const sourcePartsDir = join(aptDir, "sources.list.d");
  if (existsSync(sourcePartsDir) && statSync(sourcePartsDir).isDirectory()) {
    const entries = readdirSync(sourcePartsDir)
      .filter((entry) => entry.endsWith(".list") || entry.endsWith(".sources"))
      .sort();

    for (const entry of entries) {
      files.push({
        sourcePath: join(sourcePartsDir, entry),
        relativePath: join("sources.list.d", entry),
      });
    }
  }

  return files;
}

export function sanitizeSourceEntries(entries) {
  return entries
    .map((entry) => {
      const sanitized = entry.relativePath.endsWith(".sources")
        ? sanitizeSourcesFileContent(entry.content)
        : sanitizeListFileContent(entry.content);

      return {
        ...entry,
        content: sanitized,
      };
    })
    .filter((entry) => entry.content.trim().length > 0);
}

export function writeSanitizedSources(outputDir, entries) {
  const sourcePartsDir = join(outputDir, "sources.list.d");
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(sourcePartsDir, { recursive: true });

  let wroteSourcesList = false;

  for (const entry of entries) {
    const targetPath = join(outputDir, entry.relativePath);
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `${entry.content}\n`, "utf8");

    if (entry.relativePath === "sources.list") {
      wroteSourcesList = true;
    }
  }

  if (!wroteSourcesList) {
    writeFileSync(join(outputDir, "sources.list"), "", "utf8");
  }
}

function parseArgs(argv) {
  const args = { aptDir: "/etc/apt", outputDir: null };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--apt-dir") {
      args.aptDir = argv[index + 1];
      index += 1;
      continue;
    }

    if (value === "--output-dir") {
      args.outputDir = argv[index + 1];
      index += 1;
    }
  }

  if (!args.outputDir) {
    throw new Error("Missing required --output-dir argument");
  }

  return args;
}

function main() {
  const { aptDir, outputDir } = parseArgs(process.argv.slice(2));
  const rawEntries = collectSourceFiles(aptDir).map((entry) => ({
    ...entry,
    content: readFileSync(entry.sourcePath, "utf8"),
  }));

  const sanitizedEntries = sanitizeSourceEntries(rawEntries);
  if (sanitizedEntries.length === 0) {
    throw new Error("No official Ubuntu/Debian APT sources were found");
  }

  writeSanitizedSources(outputDir, sanitizedEntries);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error(message);
    process.exitCode = 1;
  }
}
