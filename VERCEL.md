# Vercel Deployment

## Project Settings

- Framework preset: `Next.js`
- Root directory: `app`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: leave default (`.next`)
- Node.js version: `20.x` or newer

The current app build was verified locally with `pnpm -C app build`.

## Required Environment Variables

Set these in Vercel for every environment (`Production`, `Preview`, and `Development` where relevant):

| Variable | Required | Recommended Value |
|---|---|---|
| `DATABASE_URL` | Yes | Your PostgreSQL / Neon connection string |
| `NEXTAUTH_URL` | Yes | Exact public app URL for that environment |
| `NEXTAUTH_SECRET` | Yes | 32+ character random secret |

## Recommended Solana Variables

These make the deployment work against the current devnet program in this repo:

| Variable | Required | Recommended Value |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Recommended | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_SUPERTEAM_ACADEMY_PROGRAM_ID` | Recommended | `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf` |
| `NEXT_PUBLIC_XP_MINT_ADDRESS` | Recommended | `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3` |
| `HELIUS_API_KEY` | Recommended | Your Helius API key for DAS queries |
| `NEXT_PUBLIC_CREDENTIAL_COLLECTION_ADDRESS` | Optional | Set once the credential collection address is confirmed |

## Optional Auth Variables

| Variable | Use |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enable Google sign-in |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Enable GitHub sign-in |

If these are not set, the app still builds and runs, but those providers stay disabled.

## Optional Analytics And Monitoring

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog client tracking |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host override |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry browser/server monitoring |
| `ANALYTICS_ENABLED` | Legacy server-side analytics flag |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Legacy client-side analytics flag |

## Optional Runner Variables

These are only needed if you deploy the separate `runner/` service and want the in-browser playground to submit remote jobs:

| Variable | Use |
|---|---|
| `RUNNER_URL` | Base URL of the runner service |
| `RUNNER_SHARED_SECRET` | Shared HMAC secret between app and runner |

If you are deploying only the Next.js app on Vercel, the runner can stay disabled.

## Optional Sanity CMS Variables

Set these when using `CONTENT_SOURCE=sanity`:

| Variable | Use |
|---|---|
| `CONTENT_SOURCE` | Set to `sanity` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project id |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (e.g. `production`) |
| `SANITY_API_VERSION` | API version (e.g. `2024-01-01`) |
| `SANITY_API_TOKEN` | Optional read token for private datasets; required for import/write scripts |

## Deployment Notes

- `app/package.json` already uses `SKIP_ENV_VALIDATION=1` during `next build`, so preview builds will not fail just because optional integrations are missing.
- `NEXTAUTH_URL` must match each Vercel environment domain exactly, especially for OAuth callbacks.
- If you use Vercel Postgres / Neon, run `pnpm -C app db:push` against the target database before first production use.
- The app defaults to devnet reads even if the Solana env vars are omitted, but setting them explicitly in Vercel is still the safer configuration.
