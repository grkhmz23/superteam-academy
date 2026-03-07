import { pathToFileURL } from "url";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

async function loadModule() {
  return import(pathToFileURL(resolve("scripts/playwright-apt-sources.mjs")).href);
}

describe("playwright apt source filtering", () => {
  it("keeps official deb repositories and drops third-party ones", async () => {
    const { sanitizeListFileContent } = await loadModule();
    const content = [
      "deb http://archive.ubuntu.com/ubuntu noble main restricted",
      "deb http://security.ubuntu.com/ubuntu noble-security main restricted",
      "deb https://dl.yarnpkg.com/debian stable main",
      "deb https://packages.microsoft.com/repos/microsoft-ubuntu-noble-prod noble main",
      "",
    ].join("\n");

    expect(sanitizeListFileContent(content)).toBe(
      [
        "deb http://archive.ubuntu.com/ubuntu noble main restricted",
        "deb http://security.ubuntu.com/ubuntu noble-security main restricted",
      ].join("\n")
    );
  });

  it("keeps official deb822 source blocks and drops third-party blocks", async () => {
    const { sanitizeSourcesFileContent } = await loadModule();
    const content = [
      "Types: deb",
      "URIs: http://archive.ubuntu.com/ubuntu",
      "Suites: noble noble-updates",
      "Components: main restricted",
      "",
      "Types: deb",
      "URIs: https://dl.yarnpkg.com/debian",
      "Suites: stable",
      "Components: main",
      "",
    ].join("\n");

    expect(sanitizeSourcesFileContent(content)).toBe(
      [
        "Types: deb",
        "URIs: http://archive.ubuntu.com/ubuntu",
        "Suites: noble noble-updates",
        "Components: main restricted",
      ].join("\n")
    );
  });
});
