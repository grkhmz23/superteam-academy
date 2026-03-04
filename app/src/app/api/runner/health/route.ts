import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const runnerUrl = process.env.RUNNER_URL;
  const sharedSecret = process.env.RUNNER_SHARED_SECRET ?? "";
  if (!runnerUrl) {
    return NextResponse.json({ ok: true, configured: false, mode: "local" }, { status: 200 });
  }

  if (!sharedSecret) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        mode: "remote",
        error: "RUNNER_SHARED_SECRET is required when RUNNER_URL is configured",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${runnerUrl.replace(/\/$/, "")}/health`, {
      method: "GET",
      cache: "no-store",
    });

    await response.text();
    return NextResponse.json(
      {
        ok: response.ok,
        configured: true,
        mode: "remote",
        upstreamStatus: response.status,
      },
      { status: response.ok ? 200 : 503 }
    );
  } catch {
    return NextResponse.json({ ok: false, configured: true, error: "Runner health check failed" }, { status: 503 });
  }
}
