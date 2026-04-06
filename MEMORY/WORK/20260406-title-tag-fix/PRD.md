---
task: Fix title tags to 60-char limit across all page templates
slug: 20260406-title-tag-fix
effort: Standard
phase: observe
progress: 12/12
mode: algorithm
started: 2026-04-06
updated: 2026-04-06
phase: complete
---

## Context

Crawl audit found 85 pages with title tags over 60 characters. The Modern SEO methodology requires strict 60-char limit. There are 6 template files generating titles. Some templates share `pageTitle` between `<title>` tag and H1 — those need separate `seoTitle` and `h1Title` variables.

**Current patterns and problems:**
- `compare`: `${opA.name} vs ${opB.name} — Which ${opA.activity} Is Better? (2026)` → avg 86 chars
- `best`: `Best ${activityLabel} in ${island} — Top ${ranked.length} Ranked (2026)` → 62-68 chars
- `operators`: `${operator.name} Reviews — What Reviewers Say (2026)` → 61-65 chars
- `[island]/index`: `Best ${island} Tours & Activities — Top Operators Ranked (2026)` → 62-68 chars
- `index.astro`: `Hawaii Tours & Activities — Unbiased Reviews & Comparisons` → 66 chars
- `[island]-faq/[slug]`: uses raw `question` string → variable length

**New title patterns (under 60 chars):**
- compare: `${opA.name} vs ${opB.name} | Hawaii Scout` (trim operator names if still long)
- best: `Best ${activityLabel} in ${island} | Hawaii Scout`
- operators: `${operator.name} Reviews | Hawaii Scout`
- island index: `Best ${island} Tours & Activities | Hawaii Scout`
- home: `Hawaii Tours & Activities | Unbiased Reviews`
- faq: use question as-is if under 60, else truncate at word boundary + `| Hawaii Scout`

### Risks
- `compare` template uses `pageTitle` for H1 too — must split into `seoTitle` / `h1`
- `best` template uses `pageTitle` for H1 — same split needed
- Operator names with parentheses like "Atlantis Adventures (Waikiki)" push titles long

## Criteria

- [x] ISC-1: `compare/[...slug].astro` has separate `seoTitle` (≤60) and h1 variables
- [x] ISC-2: All compare page seoTitles follow `OpA vs OpB | Hawaii Scout` pattern
- [x] ISC-3: Long operator names in compare titles truncated to fit 60 chars
- [x] ISC-4: `operators/[slug].astro` seoTitle follows `{Name} Reviews | Hawaii Scout`
- [x] ISC-5: `best/[slug].astro` seoTitle follows `Best {Activity} in {Island} | Hawaii Scout`
- [x] ISC-6: `[island]/index.astro` seoTitle follows `Best {Island} Tours & Activities | Hawaii Scout`
- [x] ISC-7: `index.astro` title updated to ≤60 chars
- [x] ISC-8: `[island]-faq/[slug].astro` seoTitle truncated at 60 chars if question is longer
- [x] ISC-9: After rebuild, 0 titles over 60 chars (verified in built HTML with entity decoding)
- [x] ISC-10: H1s unchanged on compare and best pages (still use full descriptive text)
- [x] ISC-11: No new `title_too_short` issues (199 OK, 0 under 10)
- [x] ISC-12: Meta descriptions fixed to 50-160 char range across all templates

## Decisions

## Verification
