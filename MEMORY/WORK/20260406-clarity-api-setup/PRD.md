---
task: Set up Microsoft Clarity API programmatic data access
slug: 20260406-clarity-api-setup
effort: Standard
phase: execute
progress: 9/9
mode: algorithm
started: 2026-04-06
updated: 2026-04-06
---

## Context

HawaiiScout has Microsoft Clarity installed (tag `w6n8ir65ol`) for session recording and analytics. Frank wants to pull this data programmatically, matching the project pattern of data scripts like `fetch-reviews.mjs` and `indexnow.mjs`.

The Clarity Data Export API is a single REST GET endpoint requiring a JWT bearer token. Critical constraints:
- **10 API calls/day max** — design must be cron-friendly, not ad-hoc
- **1,000 rows per response max** — no pagination
- **3-day lookback max** — must store results daily to build history
- **No heatmap data via API** — only aggregate metrics

### Risks
- Bearer token must be generated manually in Clarity dashboard (Settings > Data Export > Generate new API token)
- If the token is not in `.env`, the script will fail silently
- The 10-call/day limit means the script should be conservative — do not call it in loops

## Criteria

- [x] ISC-1: `scripts/clarity.mjs` file created in project
- [x] ISC-2: Script reads `CLARITY_API_TOKEN` from `.env` file
- [x] ISC-3: Script errors clearly if token is missing
- [x] ISC-4: Script calls `GET https://www.clarity.ms/export-data/api/v1/project-live-insights`
- [x] ISC-5: Request includes `numOfDays=3` for max data window
- [x] ISC-6: Request breaks down by `dimension1=URL` (most useful for HawaiiScout)
- [x] ISC-7: Response saved to `src/data/clarity.json`
- [x] ISC-8: `package.json` gains `"clarity": "node scripts/clarity.mjs"` npm script
- [x] ISC-9: `.env.example` updated with `CLARITY_API_TOKEN=` placeholder

## Decisions

## Verification
