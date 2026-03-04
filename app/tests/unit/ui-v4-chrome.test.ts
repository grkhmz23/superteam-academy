import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 chrome system", () => {
  it("uses shared semantic nav item classes for the sidebar shell", () => {
    const sidebarSource = readFileSync(
      resolve("src/components/layout/app-sidebar-shell.tsx"),
      "utf8"
    );
    const uiSidebarSource = readFileSync(resolve("src/components/ui/sidebar.tsx"), "utf8");

    expect(sidebarSource).toContain("chrome-nav-item-active");
    expect(sidebarSource).toContain("chrome-nav-item");
    expect(uiSidebarSource).toContain("TooltipProvider");
    expect(uiSidebarSource).toContain("focus-visible:ring-ring/70");
  });

  it("uses a unified topbar pill treatment and removes legacy dark slabs", () => {
    const topbarSource = readFileSync(
      resolve("src/components/layout/academy-topbar.tsx"),
      "utf8"
    );

    expect(topbarSource).toContain("chrome-pill");
    expect(topbarSource).toContain("chrome-pill-interactive");
    expect(topbarSource).toContain("focus-visible:ring-ring/70");
    expect(topbarSource).not.toContain("bg-black/20");
  });
});
