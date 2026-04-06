# Plan: Find & Fix All Reversed Compare Page URLs

## Context

Screaming Frog is discovering `/compare/` URLs that return 404. Root cause: operator pages (`src/pages/operators/[slug].astro`) generate compare links as `current-operator-vs-other-operator`, but the static page generator always puts operators in **array-index order** (`operators[i]-vs-operators[j]` where `i < j`). When an operator page belongs to a higher-index operator, any link to a lower-index operator produces a reversed, non-existent URL.

Example: Blue Hawaiian (index 0) vs Jack Harter (index 2)
- Static page exists at: `/compare/blue-hawaiian-helicopters-vs-jack-harter-helicopters/`
- Operator page links to: `/compare/jack-harter-helicopters-vs-blue-hawaiian-helicopters/` ← 404

**Only one source of broken links was found:**
`src/pages/operators/[slug].astro:235` — all other compare link generators are safe.

---

## Step 1: Audit (find all broken URLs)

Run a Node.js script against `operators.json` that simulates what `operators/[slug].astro` generates vs what `getStaticPaths` generates, then diffs them.

```js
// scripts/audit-compare-links.mjs
// 1. Build canonical set: all valid compare slugs (i < j order)
// 2. Build generated set: all operator-page links (current vs filtered)
// 3. Output: broken URLs, count, and which operator pages produce them
```

This produces a complete list of broken URLs before any code changes.

---

## Step 2: Fix the root cause

Add a `toCompareSlug(opA, opB)` helper to `src/lib/operators.ts` that always returns the canonical slug regardless of call order:

```ts
// Returns slug with the lower-index operator first, matching getStaticPaths order
export function toCompareSlug(a: Operator, b: Operator): string {
  const idxA = operators.indexOf(a);
  const idxB = operators.indexOf(b);
  const [first, second] = idxA < idxB ? [a, b] : [b, a];
  return `${toSlug(first.name)}-vs-${toSlug(second.name)}`;
}
```

Update `src/pages/operators/[slug].astro:235`:
```diff
- href={`/compare/${toSlug(operator.name)}-vs-${toSlug(op.name)}/`}
+ href={`/compare/${toCompareSlug(operator, op)}/`}
```

---

## Step 3: Add Vercel redirects for already-crawled/indexed reversed URLs

Add to `vercel.json` — catch-all redirect that normalizes any reversed compare URL. Since we can enumerate all reversed pairs from the audit script output, we can add explicit redirects:

```json
{
  "redirects": [
    {
      "source": "/compare/jack-harter-helicopters-vs-blue-hawaiian-helicopters/",
      "destination": "/compare/blue-hawaiian-helicopters-vs-jack-harter-helicopters/",
      "permanent": true
    }
    // ... one entry per broken URL found in Step 1
  ]
}
```

The audit script in Step 1 will output these redirect entries ready to paste.

---

## Critical Files

| File | Change |
|------|--------|
| `src/lib/operators.ts` | Add `toCompareSlug()` export |
| `src/pages/operators/[slug].astro:235` | Use `toCompareSlug()` instead of manual string |
| `vercel.json` | Add permanent redirects for all already-crawled broken URLs |
| `scripts/audit-compare-links.mjs` | New audit script (keep for future use) |

---

## Verification

1. Run `node scripts/audit-compare-links.mjs` — output should show 0 broken links after fix
2. Run `npm run build` — confirm 63 compare pages still generated
3. Run `node scripts/crawl-audit.mjs` — confirm 0 `status_404` results
4. Deploy and re-crawl with Screaming Frog — no non-indexable compare pages
