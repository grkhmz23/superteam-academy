import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLocalCourseIdOverrides,
  parseCourseIdOverridesJson,
  resolveClientCourseId,
  writeLocalCourseIdOverrides,
} from "@/lib/progress/client-course-id-overrides";

describe("client course id overrides", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });
  });

  it("parses valid JSON object maps", () => {
    expect(
      parseCourseIdOverridesJson('{ "solana-fundamentals": "anchor-101" }')
    ).toEqual({
      "solana-fundamentals": "anchor-101",
    });
  });

  it("prefers local override over default course id", () => {
    writeLocalCourseIdOverrides({
      "solana-fundamentals": "anchor-101",
    });

    expect(
      resolveClientCourseId("solana-fundamentals", "solana-fundamentals")
    ).toBe("anchor-101");

    clearLocalCourseIdOverrides();

    expect(
      resolveClientCourseId("solana-fundamentals", "solana-fundamentals")
    ).toBe("solana-fundamentals");
  });
});
