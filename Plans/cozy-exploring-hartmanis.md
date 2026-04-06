# Plan: Next Steps — Publish ISC-7, 8, 9

## Context

ISC-1 through ISC-5 are complete: domain live, analytics wired, 62 operators in DB, review pipeline
pulling 2172 review texts from TripAdvisor + Google. The two core money-page templates
(`/operators/[slug].astro` and `/compare/[...slug].astro`) are partially built and modified in the working
tree. The review helper (`src/lib/reviews.ts`) is new and functional.

**The block:** ISC-6 (FareHarbor affiliate approval) is still pending. ISC-8 and ISC-9 are listed as
depending on it — but the templates already fall back to `operator.website` for booking CTAs. Pages can
be published NOW using operator website links, with FH tracking links swapped in once approved.

**Missing from templates (vs PRD playbooks):**

| Page | Missing |
|------|---------|
| Compare | "Choose A If / Choose B If" sections · "Other Alternatives" section · Book CTA in table |
| Review | Quick Facts (activity, island, price) · Pros/Cons section · "Compare Alternatives" links at bottom |

**Operator data gap:** `operators.ts` has no `duration`, `group_size`, `includes`, or `age_min` — so
Quick Facts will use only available fields (activity, island, price range, FH status). That's fine for V1.

---

## Steps

### Step 1 — Complete comparison page template (`src/pages/compare/[...slug].astro`)
Add to the bottom of the page, after the comparison table and reviewer quotes:

1. **"Choose [A] If..." / "Choose [B] If..."** — Two side-by-side cards with bullets
   - Pull from `operator.notes` for reasoning
   - Include a "Book [operator]" CTA linking to `operator.website` (FH placeholder)

2. **"Book" row in comparison table** — Replace FareHarbor yes/no row with actual CTA links
   - Link text: `→ Book` → `operator.website`

3. **"Other Options" section** — Links to operator review pages + the activity ranked list hub
   - Filter operators with same activity + shared island, show up to 3, link to `/operators/[slug]/`

### Step 2 — Complete operator review page template (`src/pages/operators/[slug].astro`)
Add missing sections:

1. **Quick Facts box** — Horizontal stat strip: Activity · Islands · Price Range · FareHarbor
   - Use only fields available in `Operator` interface (no duration/group_size needed for V1)

2. **Pros / Cons** — Two-column section derived from review texts
   - Show first 2 positive-sentiment reviews as "What guests love"
   - Show any reviews with lower ratings (≤3) as "Common complaints"
   - Use `getAllReviewTexts()` already available in `reviews.ts`

3. **Compare Alternatives** — Bottom section listing same-activity operators
   - Same logic as `compareOps` already computed at top of the file
   - Link to `/compare/[this-slug]-vs-[other-slug]/` (already have `toSlug()`)

### Step 3 — Deploy
- `git add` both pages + `src/lib/reviews.ts`
- Build + deploy (Vercel auto-deploys on push to master)
- This publishes **62 operator review pages** + **~150+ comparison pages** automatically via `getStaticPaths()`

### Step 4 — IndexNow ping
- Run existing IndexNow script to submit all new URLs to Bing/Google
- Check `scripts/` directory for the auto-submission script added in commit `1e4f47d`

---

## Files to Modify

- `src/pages/compare/[...slug].astro` — add Choose A/B If sections, Book CTA in table, Other Options
- `src/pages/operators/[slug].astro` — add Quick Facts, Pros/Cons, Compare Alternatives

## Files to Leave Alone

- `src/lib/reviews.ts` — complete, no changes needed
- `src/lib/operators.ts` — complete for V1, no enrichment needed now
- `src/data/operators.json` — no changes needed

---

## Verification

1. `npm run build` (or `astro build`) succeeds with no type errors
2. Spot-check 3 comparison pages in browser — Kemp table renders, Choose A/B sections appear, Book links work
3. Spot-check 3 operator review pages — Quick Facts shows, review cards render, Compare Alternatives links resolve
4. Count generated pages: should see 62 operator pages + 150+ comparison pages in build output
5. Confirm zero broken internal links (check console for 404s on `/operators/` and `/compare/` links)
6. After deploy: run IndexNow script, verify submission response is `200 OK`

---

## What Comes After (ISC-10+)

Once ISC-7/8/9 are published:
- ISC-10: Audit bidirectional linking (comparisons ↔ reviews) — visual check + Screaming Frog
- ISC-11: Audit zero brand names in page titles — already clean per current template
- ISC-12: Ranked lists ("Best Snorkeling in Maui") — new page type, new template needed
- ISC-17+: Screenshot PAA boxes → 100 FAQ pages
