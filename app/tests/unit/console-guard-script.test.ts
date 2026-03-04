import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("ci console guard script", () => {
  it("checks for ripgrep and provides a deterministic fallback", () => {
    const script = readFileSync(resolve("scripts/ci-console-guard.sh"), "utf8");

    expect(script).toContain("set -euo pipefail");
    expect(script).toContain("command -v rg");
    expect(script).toContain("grep -RInE");
    expect(script).toContain("exit 1");
  });
});
