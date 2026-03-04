# CUSTOMIZATION

## Overview

Superteam Academy is already structured so the major customization points are isolated:

- branding and visual tokens
- locales and UI copy
- course catalog and content
- gamification rules
- on-chain integration config
- analytics providers

This guide covers the parts you can safely change for a community fork or grant-specific deployment without rewriting the core app architecture.

## Theme And Branding

### Tailwind Theme

Primary design tokens live in:

- `app/tailwind.config.ts`

Current customization points:

- `darkMode: ["class"]`
- semantic HSL tokens (`background`, `foreground`, `primary`, etc.)
- Solana accent palette:
  - `solana.purple`
  - `solana.green`
  - `solana.blue`
- XP palette:
  - `xp.bronze`
  - `xp.silver`
  - `xp.gold`
  - `xp.diamond`
- animation tokens:
  - `accordion-down`
  - `accordion-up`
  - `xp-pulse`
  - `slide-up`
  - `fade-in`

If you are rebranding for another community, this is the first place to change color identity and motion defaults.

### CSS Variables

Global CSS variables live in:

- `app/src/styles/globals.css`

The app uses CSS custom properties for most semantic styling:

- light mode tokens under `:root`
- dark mode overrides under `.dark`

The main values to change for a rebrand are:

- `--background`
- `--foreground`
- `--primary`
- `--secondary`
- `--accent`
- `--border`
- `--ring`

Because components use semantic tokens, changing these values re-themes most of the UI without touching component code.

### Theme Switching

Theme switching is powered by:

- `app/src/components/layout/theme-provider.tsx`
- `next-themes`

The active strategy is class-based theme switching. The Settings page exposes:

- dark
- light
- system

If you want to lock the app to dark-only for the grant submission, you can do that by simplifying the settings UI and forcing the provider default. If you keep both themes, the current implementation already supports them.

### Product Identity

For a branded fork, also update:

- `README.md` project title and links
- app metadata and logos used in layout/header assets
- any platform name strings such as “Superteam Academy” in auth, certificates, and share text

## Languages And Localization

### Supported Locales

Current locale routing is defined in:

- `app/src/lib/i18n/routing.ts`

Live locales:

- `en`
- `es`
- `pt-BR`
- `fr`
- `it`
- `de`
- `zh-CN`
- `ar`

The grant only requires PT-BR, ES, and EN, but this app already supports a wider locale matrix.

### Message Bundles

UI dictionaries live in:

- `app/src/messages/*.json`

To add a new language:

1. Add `app/src/messages/<locale>.json`
2. Add the locale to `app/src/lib/i18n/routing.ts`
3. Add/update locale metadata in `app/src/lib/i18n/locales.ts`
4. Confirm header/settings language switchers render it
5. Validate locale routes and any RTL behavior if applicable

### RTL

Arabic support already exists, and the global styles include RTL-safe utilities:

- `.bidi-safe`
- `.ltr-isolate`

If you add another RTL language, verify it against the existing Arabic behavior instead of introducing a second ad hoc direction model.

## Course Catalog And Content

### Local-First Runtime Content

Runtime course content currently comes from:

- `app/src/lib/data/courses/*.ts`
- `app/src/lib/services/content-local.ts`

The live content layer is local-first, but accessed through `CourseContentService`, which means you can replace storage later without changing the pages.

### Course Registry

Catalog registration lives in:

- `app/src/lib/data/courses/index.ts`

That registry currently represents the full 51-course catalog.

To customize the catalog:

1. Add or remove course files under `app/src/lib/data/courses`
2. Update the registry exports
3. Verify course list, detail pages, lesson pages, and search still behave correctly

### On-Chain Course IDs

Direct devnet enrollment uses a separate program-facing course identifier.

The default centralized mapping lives in:

- `app/src/lib/data/course-onchain-ids.ts`

Current production-safe default:

- `slug -> slug`

That means your current local slugs are treated as the official on-chain IDs unless you override them.

### Global Course ID Overrides

For production, you can override the default mapping with env vars:

- `COURSE_ONCHAIN_IDS_JSON`
- `NEXT_PUBLIC_COURSE_ONCHAIN_IDS_JSON`

Format:

```json
{
  "solana-fundamentals": "anchor-101",
  "anchor-development": "anchor-201"
}
```

Reference template:

- `docs/course-onchain-id-overrides.example.json`

### Local Course ID Overrides

There is also a browser-local override editor in:

- `/settings`

This writes a local JSON map into browser storage and applies immediately to direct enrollment transactions. It is useful for testing real upstream IDs without redeploying.

## Gamification

### XP Rewards

XP values currently come from two layers:

1. Per-lesson content data:
   - `xpReward` in `app/src/lib/data/courses/*.ts`
2. Progress service bonus logic:
   - `app/src/lib/services/progress-local.ts`

The local service currently handles:

- lesson XP
- first completion of day bonus
- course completion bonus

If you change XP economy, update both content values and service-level bonus rules together.

### Level Formula

The local derived level formula is implemented in:

- `app/src/lib/services/progress-local.ts`

Current formula:

- `Math.floor(Math.sqrt(totalXP / 100))`

That matches the grant’s level formula for XP display.

### Achievements

Achievement definitions and unlock logic live in:

- `app/src/lib/data/achievements.ts`
- `app/src/lib/services/achievements.ts`

To customize achievements:

1. Add or modify definitions in the data file
2. Ensure the engine supports any new condition types
3. Verify dashboard/profile/achievement surfaces still render correctly

### Streaks

Streaks are currently frontend/local-database managed rather than on-chain, which is consistent with the grant spec.

If you want to customize streak rules, review:

- streak handling in `app/src/lib/services/progress-local.ts`
- dashboard streak UI and calendar components

## On-Chain Integration

### Enrollment

Direct devnet enrollment is implemented client-side and uses:

- `app/src/lib/progress/onchain-enrollment.ts`
- `app/src/lib/progress/client-enrollment.ts`

Customization points:

- course ID mapping (`course-onchain-ids.ts`)
- RPC endpoint (`NEXT_PUBLIC_SOLANA_RPC_URL`)
- future program replacement if Superteam changes the target deployment

### XP Reads

XP reads depend on:

- `NEXT_PUBLIC_XP_MINT_ADDRESS`
- `app/src/lib/services/onchain.ts`

If you point to a different Token-2022 mint, XP display will follow that mint.

### Credential Reads

Credential discovery depends on:

- `HELIUS_API_KEY`
- `NEXT_PUBLIC_CREDENTIAL_COLLECTION_ADDRESS`

If you fork the project for another community, you will need to update the collection filter and likely the metadata conventions.

## Analytics And Monitoring

### Current Providers

The app already supports:

- Google Analytics 4
- PostHog
- Sentry

Relevant env vars:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`

If you fork the app:

1. Replace these with your own project keys
2. Verify CSP still allows your Sentry endpoint
3. Confirm analytics events still reflect your product naming

## Authentication

### Providers

Current auth surface supports:

- Solana wallet auth
- Google OAuth
- GitHub OAuth

Relevant config:

- `app/src/lib/auth/config.ts`

For a fork, you can:

- disable optional providers by omitting env vars
- keep wallet-only auth
- add additional NextAuth providers if needed

### Wallet Linking

Wallet linking is required for the current on-chain flows. If you remove wallet linking, you will also need to adjust enrollment and future credential issuance expectations.

## Forking For Another Community

For a community-specific fork, the safest sequence is:

1. Rebrand visual tokens and product strings
2. Replace course content and on-chain course IDs
3. Update locale copy
4. Replace analytics and auth credentials
5. Replace Solana env vars (RPC, XP mint, credential collection)
6. Validate core flows on the target deployment

## Validation Checklist After Customization

After any major customization, run:

```bash
pnpm -C app lint
pnpm -C app typecheck
pnpm -C app test
SKIP_ENV_VALIDATION=1 pnpm -C app build
```

Then manually verify:

1. sign-in still works
2. wallet connect still works
3. direct devnet enrollment still works
4. course detail and lesson pages still render correctly
5. dashboard/profile/settings still render in both desktop and mobile layouts

## Recommended Production Default

If you are shipping now and choosing your own course IDs, the current safest production default is:

- keep the centralized `slug -> slug` mapping
- treat those IDs as canonical for your deployment
- only override them later if Superteam provides a different authoritative mapping

That is exactly how the current repo is set up today.
