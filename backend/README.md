# Backend Package

This folder exists to match the grant monorepo expectation of `app/` + `backend/`.

## Current Runtime

The production runtime backend for this project is currently implemented in Next.js route handlers under:

- `app/src/app/api/*`

These handlers already power:

- authentication and account linking
- progress, enrollment, streak, and achievements APIs
- on-chain read APIs (XP, credentials, leaderboard)
- runner integration endpoints

## Purpose of This Package

`backend/` contains backend-facing contracts and integration boundaries so the service layer can evolve cleanly from local/DB-backed logic to direct signer/on-chain orchestration.

Current contract:

- `src/contracts/learning-progress-service.ts`

This mirrors the grant requirement for clean abstractions around progress, XP, streak, leaderboard, and credentials.

## Planned Expansion

As the project evolves, this package can host:

- backend SDK wrappers around on-chain instructions
- signer job orchestration and anti-cheat validators
- indexer adapters (Helius/custom)
- background jobs and queue workers
