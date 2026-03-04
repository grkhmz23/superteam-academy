# CMS_GUIDE

## Overview

Superteam Academy is currently **local-first for runtime content**, with a clean CMS migration path already in place.

Runtime content is read through the `CourseContentService` abstraction:

- Interface: `app/src/lib/services/content.ts`
- Factory: `app/src/lib/services/content-factory.ts`
- Runtime implementations:
  - `ContentLocalService` in `app/src/lib/services/content-local.ts`
  - `ContentSanityService` in `app/src/lib/services/content-sanity.ts`

Pages and APIs depend on this content interface instead of directly importing course files.
Set `CONTENT_SOURCE=sanity` to use Sanity at runtime (falls back to local when Sanity env vars are missing).

## Current Content Source

The production app currently serves course content from:

- `app/src/lib/data/courses/*.ts`
- registry exports in `app/src/lib/data/courses/index.ts`

Current state:

- The local registry contains the full 51-course catalog.
- The content service localizes course text through `next-intl` course translation helpers.
- Each course now also carries an explicit `onChainCourseId` field at runtime, injected by the content layer via `app/src/lib/data/course-onchain-ids.ts`.

This is a valid production setup for the grant because the app is open-source and fully forkable, while the content layer is already isolated enough to move into Sanity later.

## Existing Sanity Integration

Sanity is the prepared CMS path in this repo today.

Existing tooling:

- Import script: `app/scripts/sanity-import.ts`
- Package dependency: `next-sanity`
- Script command: `pnpm -C app sanity:import`
- Schema definitions committed in-repo: `app/src/lib/cms/schema.ts`
- Runtime Sanity client: `app/src/lib/cms/sanity-client.ts`

What the import script does:

1. Loads the local `courses` dataset from `app/src/lib/data/courses`
2. Creates or replaces:
   - `lesson` documents
   - `challenge` documents
   - `module` documents
   - `course` documents
3. Preserves stable IDs derived from the local content model

What the import script does **not** do yet:

- It does not switch runtime reads to Sanity
- It does not define a live `SanityContentService`
- It does not implement author-side draft/publish reads at runtime

So the current CMS story is:

- Runtime: local-first
- Authoring bootstrap / migration path: Sanity import ready

## Required Environment For Sanity Import

To import the current course catalog into Sanity, set:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET` (defaults to `production`)
- `SANITY_API_TOKEN`

Then run:

```bash
pnpm -C app sanity:import
```

If the variables are missing, the script exits safely with a clear error.

## Runtime Content Model

Source types are defined in:

- `app/src/types/content.ts`

### Course

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable internal content identifier. |
| `slug` | `string` | Route slug used in `/courses/[slug]`. |
| `onChainCourseId` | `string \| null` | Program-facing course identifier used by direct devnet enrollment. Defaults to slug unless overridden. |
| `title` | `string` | Display title. |
| `description` | `string` | Course summary. |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | Difficulty band. |
| `duration` | `string` | Human-readable estimated duration. |
| `totalXP` | `number` | Total XP represented by the course. |
| `tags` | `string[]` | Search/filter tags. |
| `imageUrl` | `string` | Thumbnail or hero asset. |
| `modules` | `Module[]` | Ordered module list. |

### Module

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable module identifier. |
| `title` | `string` | Module title. |
| `description` | `string` | Module summary text. |
| `lessons` | `Lesson[]` | Ordered module lessons. |

### Lesson

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable lesson identifier used by progress tracking. |
| `slug` | `string` | Route-friendly lesson slug. |
| `title` | `string` | Lesson title. |
| `type` | `'content' \| 'challenge' \| 'multi-file-challenge' \| 'devnet-challenge'` | Lesson behavior mode. |
| `content` | `string` | Markdown lesson body. |
| `blocks` | `LessonBlock[]` | Structured interactive lesson blocks (quizzes, terminal steps, explorers). |
| `xpReward` | `number` | XP reward for lesson completion. |
| `duration` | `string` | Human-readable estimated completion time. |

### Challenge Extensions

Challenge-capable lessons may also include:

| Field | Type | Description |
|---|---|---|
| `starterCode` | `string` | Preloaded editor code. |
| `language` | `'typescript' \| 'rust'` | Challenge editor mode. |
| `testCases` | `TestCase[]` | Visible pass/fail test definitions. |
| `hints` | `string[]` | Ordered progressive hints. |
| `solution` | `string` | Reference implementation. |

## Authoring Workflow (Today)

### Add a New Course

1. Create a new file in `app/src/lib/data/courses/<course>.ts`
2. Export a typed `Course` object
3. Register it through the course registry exports in `app/src/lib/data/courses`
4. Add or confirm its entry in `app/src/lib/data/course-onchain-ids.ts`
5. Verify:
   - `/[locale]/courses/[slug]`
   - `/[locale]/courses/[slug]/lessons/[id]`
   - direct enrollment still resolves the intended `onChainCourseId`

### Add a New Module or Lesson

1. Edit the owning course file in `app/src/lib/data/courses`
2. Keep `id` and `slug` deterministic and stable
3. Set appropriate `xpReward` and `duration`
4. For lessons, verify:
   - previous/next navigation
   - lesson completion state
   - challenge rendering (if applicable)

### Add or Update a Challenge

1. Use `type: "challenge"` (or the existing specialized challenge types when appropriate)
2. Ensure `starterCode` is valid and intentionally incomplete
3. Add meaningful `testCases`
4. Add `hints` in escalating specificity
5. Keep `solution` aligned with expected pass conditions
6. For Rust-style lessons, confirm structural validation still matches the intended patterns

## Publishing Workflow (Today)

Because runtime content is still local-first, publishing maps to normal git workflow:

1. Edit course content in a branch
2. Run:
   - `pnpm -C app lint`
   - `pnpm -C app typecheck`
   - targeted tests for touched course logic
3. Review rendered pages locally
4. Merge to `main`
5. Deploy to Vercel

This is the current “draft / review / publish” path for production.

## Publishing Workflow (Sanity Bootstrap)

If you want content mirrored into Sanity for editorial review:

1. Keep the local TypeScript course data as the canonical source
2. Set the required Sanity env vars
3. Run:

```bash
pnpm -C app sanity:import
```

4. Review imported documents in Sanity Studio / dataset tools
5. Use Sanity as the editorial mirror until a runtime `SanityContentService` is introduced

This keeps the current app stable while proving a CMS-backed content model exists for migration.

## Recommended Sanity Schema

The import script already implies the minimal document model:

- `course`
- `module`
- `lesson`
- `challenge`

Recommended fields:

### `course`

- `title`
- `slug`
- `description`
- `difficulty`
- `duration`
- `totalXP`
- `thumbnailUrl`
- `tags`
- `language`
- `modules` (references)

### `module`

- `title`
- `order`
- `lessons` (references)

### `lesson`

- `title`
- `slug`
- `content`
- `type`
- `xpReward`
- `order`
- `moduleId`

### `challenge`

- `lesson` (reference)
- `starterCode`
- `language`
- `testCases`
- `hints`
- `solution`

## Content Quality Guardrails

- Keep lesson IDs stable once published; progress and share links depend on them.
- Keep slugs stable unless you intentionally migrate routes.
- Prefer real Solana examples and concrete code over abstract prose.
- Treat `onChainCourseId` as immutable once a course is live on devnet.
- If you override `onChainCourseId`, update:
  - `COURSE_ONCHAIN_IDS_JSON` in production
  - or local Settings overrides when testing

## Planned Next Step (If You Move Runtime To CMS)

To make Sanity the live runtime source later:

1. Implement a `SanityContentService` that satisfies `CourseContentService`
2. Map Sanity documents into the existing `Course` / `Module` / `Lesson` types
3. Update `getContentService()` to support `CONTENT_SOURCE=sanity`
4. Keep all pages and APIs unchanged; only the service implementation should switch

That is the intended migration path, and the current repo structure already supports it.
