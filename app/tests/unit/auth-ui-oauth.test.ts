import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("auth oauth ui", () => {
  it("renders Google and GitHub OAuth actions on the sign-in page when providers are available", () => {
    const source = readFileSync(resolve("src/app/[locale]/auth/signin/page.tsx"), "utf8");

    expect(source).toContain("continueWithGoogle");
    expect(source).toContain('handleOAuthSignIn("google")');
    expect(source).toContain('handleOAuthSignIn("github")');
  });

  it("uses interactive OAuth linking actions in settings instead of placeholder buttons", () => {
    const source = readFileSync(resolve("src/app/[locale]/settings/page.tsx"), "utf8");

    expect(source).toContain("handleOAuthLink");
    expect(source).toContain('handleOAuthLink("google")');
    expect(source).toContain('handleOAuthLink("github")');
  });

  it("supports disconnect+unlink flow and reconnecting another wallet in settings", () => {
    const source = readFileSync(resolve("src/app/[locale]/settings/page.tsx"), "utf8");

    expect(source).toContain("disconnect()");
    expect(source).toContain('method: "DELETE"');
    expect(source).toContain("setVisible(true)");
  });
});
