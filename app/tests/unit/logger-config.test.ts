import { describe, expect, it } from "vitest";
import { createLoggerOptions } from "@/lib/logging/logger";

describe("logger configuration", () => {
  it("avoids worker-thread transports in development", () => {
    const options = createLoggerOptions("development");

    expect(options.transport).toBeUndefined();
    expect(options.level).toBe("info");
    expect(options.redact?.paths).toContain("authorization");
  });

  it("keeps production logs structured without a pretty transport", () => {
    const options = createLoggerOptions("production");

    expect(options.transport).toBeUndefined();
    expect(options.base).toEqual({ service: "superteam-academy" });
  });
});
