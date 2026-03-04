import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as runJob } from "@/app/api/runner/job/route";
import { POST as importRepo } from "@/app/api/runner/import/route";

describe("runner API security boundaries", () => {
  it("rejects non-allowlisted jobs", async () => {
    const req = new NextRequest("http://localhost/api/runner/job", {
      method: "POST",
      body: JSON.stringify({
        userId: "u1",
        courseId: "c1",
        jobType: "rm -rf /",
        files: {},
        args: {},
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await runJob(req);
    expect(response.status).toBe(400);
  });

  it("rejects import from non-github host", async () => {
    const req = new NextRequest("http://localhost/api/runner/import", {
      method: "POST",
      body: JSON.stringify({ repoUrl: "https://evil.example.com/repo" }),
      headers: { "content-type": "application/json" },
    });

    const response = await importRepo(req);
    expect(response.status).toBe(400);
  });

  it("fails closed when remote runner signing is misconfigured", async () => {
    const previousRunnerUrl = process.env.RUNNER_URL;
    const previousRunnerSecret = process.env.RUNNER_SHARED_SECRET;

    process.env.RUNNER_URL = "https://runner.example.com";
    delete process.env.RUNNER_SHARED_SECRET;

    try {
      const req = new NextRequest("http://localhost/api/runner/job", {
        method: "POST",
        body: JSON.stringify({
          userId: "u1",
          courseId: "c1",
          jobType: "anchor_build",
          files: {},
          args: {},
        }),
        headers: { "content-type": "application/json" },
      });

      const response = await runJob(req);
      expect(response.status).toBe(503);
    } finally {
      if (previousRunnerUrl === undefined) {
        delete process.env.RUNNER_URL;
      } else {
        process.env.RUNNER_URL = previousRunnerUrl;
      }

      if (previousRunnerSecret === undefined) {
        delete process.env.RUNNER_SHARED_SECRET;
      } else {
        process.env.RUNNER_SHARED_SECRET = previousRunnerSecret;
      }
    }
  });
});
