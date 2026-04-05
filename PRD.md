---
task: Build hawaiiscout.com BOTF review aggregation site
slug: hawaiiscout
effort: comprehensive
phase: execute
progress: 0/49
mode: loop
started: 2026-04-01T12:00:00
updated: 2026-04-04T00:00:00
---

## Context

### Project Overview

**What:** hawaiiscout.com — a review aggregation site for Hawaii tours and activities.
**Vision:** The "Wirecutter of Hawaii Tours" — the trusted, independent source for tour comparisons and reviews across all Hawaiian islands.
**Domain:** hawaiiscout.com
**Monetization:** FareHarbor affiliate (primary). Viator/GYG as secondary. Future: hotels, flights, gear, restaurants, travel insurance.

**Differentiator:** No website currently aggregates reviews from multiple platforms (TripAdvisor, Google, Viator, Yelp) for Hawaii tours. Existing sites are booking platforms showing only their own reviews. We aggregate ALL platforms into one transparent score.

**Approach:** Bottom-of-funnel (BOTF) SEO first — target people ready to buy (comparisons, reviews, "best of" lists, price pages). Then build topical authority via FAQ pages that funnel PageRank to money pages. Based on David Quaid's methodology.

**Scale:** Target 600+ BOTF pages + 150+ TOFU support = 750+ indexed pages.
**Revenue target:** $200/mo Month 3 → $2K/mo Month 6 → $10K/mo Month 12 via FareHarbor affiliate commissions.

**Market gap:**
- TripAdvisor: Revenue-sorted results, only shows TA reviews, cluttered UI
- Viator: Only shows Viator reviews, no editorial voice, no comparisons
- GetYourGuide: Smaller Hawaii inventory, platform-locked reviews
- Yelp: Not travel-specialized, no comparison features
- Hawaii-Guide.com: No user reviews, aging design, not programmatic
- HawaiiTours.com: Thin review content, booking-focused

**Our moat:**
1. Multi-platform review aggregation (data layer no competitor has)
2. Structured comparison tables (Kemp model) that Google indexes as snippets
3. BOTF content targeting near-zero competition keywords
4. Programmatic scaling via API pipeline (200+ pages from templates)

**Keyword universe:** 850+ keywords, 665K-1.55M monthly searches. BOTF: ~350 keywords. TOFU: ~400 FAQ keywords.

**Monday board:** ID 18407085310 (LSEO/Updryv account). Visual dashboard only — this PRD is the AI source of truth.

---

### David Quaid BOTF Methodology

THE METHODOLOGY DRIVING EVERY DECISION ON THIS PROJECT:

**CORE FORMULA: Relevance x Authority = Ranking**
"The less authority you have, the greater the relevance to the search phrase must be. It's like ad rank — quality score times bid."

**PRINCIPLE 1 — BOTF FIRST, AUTHORITY SECOND:**
"Build topical authority, then pick lucrative bottom-of-funnel transactional keywords that don't have a lot of competition."
Sequence: BOTF money pages → FAQ authority support → expand winners → target harder terms.

**PRINCIPLE 2 — 70/30 METHOD:**
Publish 200+ BOTF pages. ~70% will get some visibility. Invest heavily in the winners (expand from 500 to 1000+ words, add data, photos, pricing). Don't waste time on pages that don't rank.

**PRINCIPLE 3 — COMPARISON TABLE MODEL (KEMP CASE STUDY):**
"A simple comparison table listing competitor products with pricing side-by-side. No logos, no icons, no navigation. Google published the table data in snippets because it was structured."

**PRINCIPLE 4 — PAGE TITLE OPTIMIZATION:**
"Stop putting your brand name in the page title. Please stop doing it." Every character in the title = keyword relevance. Google shows site name below title in SERPs. No brand name except homepage, about, contact.

**PRINCIPLE 5 — QFO FOR LLM VISIBILITY:**
"The prompt is not the query. If you rank in Google for the QFO sub-queries, you rank in LLMs." PAA boxes ARE the QFO sub-queries. Ranking for PAA = ranking in AI search results. No separate GEO tactics needed.

**PRINCIPLE 6 — NO SCHEMA OBSESSION:**
Schema is a text extraction helper, not a ranking factor. Only use FAQ schema for accordion pages. Individual FAQ pages don't need schema.

**PRINCIPLE 7 — FAQ AS AUTHORITY FUEL:**
FAQ pages don't monetize directly. They exist to funnel PageRank to BOTF money pages via internal links. Each FAQ = 2+ links to BOTF pages. Every BOTF page needs 3+ FAQ inlinks.

**BOTF KEYWORD TIERS (in priority order):**
- T1 TRANSACTIONAL: book [operator], [operator] discount code, [operator] tickets → Operator review pages with Book Now CTAs
- T2 PURCHASE VALIDATION: [operator] reviews, is [operator] worth it → Operator review pages with aggregated scores
- T3 COMPARISON: [A] vs [B], best [activity] company [island] → Head-to-head comparison pages (Kemp model)
- T4 SHORTLISTING: best [activity] in [island], cheapest [activity] → Ranked list pages, price/budget pages
- T5 AUTHORITY SUPPORT: things to do in [island], [activity] tips → FAQ pages (120 words, 2-3 internal links to BOTF)

Content ratio target: 67% BOTF (Tiers 1-4) + 33% TOFU (Tier 5).

---

### SEO Rules & Constraints — Apply to ALL Content

1. **NO BRAND NAME IN PAGE TITLES** — Every character for keyword relevance. Exception: homepage, about, contact only.
2. **ONE KEYWORD PER PAGE** — Every page targets exactly one specific long-tail query.
3. **FAQ PAGES = 120 WORDS** — Start with 120-word test pages. Expand to 500-1000 words ONLY after they rank (70/30 method).
4. **EVERY FAQ LINKS TO 2-3 BOTF PAGES** — This is the authority funnel. Include "Our Top Picks" section.
5. **EVERY BOTF PAGE GETS 3+ FAQ INLINKS** — Create new FAQs if needed.
6. **INTERNAL LINKING IS BIDIRECTIONAL** — Comparisons ↔ Operator Reviews. FAQ → BOTF. Hubs → all children.
7. **STRUCTURED DATA IN TABLES** — Clean HTML tables. Google indexes structured table data as rich snippets. No logos/icons in tables.
8. **REVIEW SCORES SHOWN TRANSPARENTLY** — All source platforms visible. Show TripAdvisor, Google, Yelp scores + weighted Overall.
9. **FAREHARBOR AFFILIATE LINK ON EVERY MONEY PAGE** — Comparison: CTA for both operators. Review: CTA top+bottom. Ranked: CTA per operator.
10. **START LOW COMPETITION, MOVE UP** — Weeks 1-4: comparisons, Molokai/Lanai. Months 2-3: striking distance. Month 6+: head terms.

**URL patterns:**
- Operator reviews: `/operators/[operator-slug]/`
- Comparisons: `/compare/[a]-vs-[b]/`
- Ranked lists: `/best/[activity]-[island]/`
- Price pages: `/best/cheapest-[activity]-[island]/`
- Audience guides: `/best/[activity]-for-[audience]-[island]/`
- FAQ pages: `/[island]-faq/[question-slug]/`
- Island hubs: `/[island]/`
- Activity hubs: `/[island]/[activity]/`

**Title tag formulas:**
- Comparison: "[A] vs [B] — Which [Activity] Is Better? ([Year])"
- Review: "[Operator] Reviews — What [N] Reviews Say ([Year])"
- Ranked: "Best [Activity] in [Island] — Top [N] Ranked ([Year])"
- FAQ: "[Exact PAA Question]"
- Price: "Cheapest [Activity] in [Island] — Prices From $[X] ([Year])"

---

### Tech Stack & Infrastructure

**Framework:** Astro (SSG) — islands architecture, minimal JS, fastest Core Web Vitals.
**Hosting:** Vercel or Cloudflare Pages — edge-deployed, near-free at scale.
**Database:** Supabase or Airtable — operator data, review cache.
**Review API pipeline:**
- TripAdvisor Content API: 5K free/month
- Google Places API: ~$0.02/request
- Yelp Fusion API: 5K/day free
- Pipeline: Scheduled fetch → normalize scores → database → template engine → SSG build

**Analytics:** GSC, Bing Webmaster Tools, Microsoft Clarity, IndexNow.
**Affiliate:** FareHarbor (primary), Viator/GYG (secondary).

**Build pipeline:** Operator data in DB → Scheduled API jobs → Normalize → Astro build → Deploy via git → IndexNow ping.

**Astro page structure:**
- `src/pages/operators/[slug].astro` → operator reviews
- `src/pages/compare/[slug].astro` → comparisons
- `src/pages/best/[slug].astro` → ranked lists
- `src/pages/[island]-faq/[slug].astro` → FAQ pages
- `src/pages/[island]/index.astro` → island hubs

---

### Monetization & Revenue Model

**PRIMARY: FareHarbor Affiliate Program** — Most Hawaii operators use FareHarbor as booking backend. Commission on completed bookings.
**SECONDARY: Viator + GetYourGuide** — For operators not on FareHarbor.
**FUTURE:** Hotels (booking.com), Flights (Skyscanner), Rental Cars (Kayak), Gear (Amazon Associates), Restaurants (OpenTable), Travel Insurance (World Nomads).

**CTA placement:**
- Comparison pages: "Book Now" for BOTH operators (top + bottom)
- Review pages: "Book Now" at top (after TLDR) and bottom
- Ranked lists: "Book" button in table per operator + after each mini-review
- Price pages: "Book Best Deal" after price table
- FAQ pages: NO affiliate CTAs (authority fuel only)

**Conversion targets:** Comparison 5%+ CTR, Review 3%+, Ranked 4%+, Price 6%+.
**Revenue:** $200/mo M3 → $2K/mo M6 → $10K/mo M12.

---

### Execution Playbooks

#### PLAYBOOK: How to Write a Comparison Page

1. **Select operator pair** — Same activity, same island, 50+ reviews combined
2. **Gather data** — Aggregate scores, price, duration, group size, includes, best-for, top themes
3. **Write content:**
   - Title: "[A] vs [B] — Which [Activity] Is Better?"
   - TLDR verdict (50 words max)
   - Comparison table: Price, Duration, Group Size, Includes, Score, Best For, Book link
   - Detailed breakdown (3-4 paragraphs)
   - "Choose [A] If..." + "Choose [B] If..." sections with FareHarbor links
   - Other Alternatives (internal links)
4. **Internal links** — Link to both operator reviews + ranked list
5. **Verify** — No brand in title, FareHarbor links work, table is clean HTML

#### PLAYBOOK: How to Write an Operator Review Page

1. **Select operator** — Reviews on 2+ platforms, prioritize high-ticket
2. **Aggregate reviews** — Pull scores, calculate weighted average, extract themes
3. **Write content:**
   - Title: "[Operator] Reviews — What [N] Reviews Say"
   - TLDR (2-3 sentences) + FareHarbor CTA
   - Aggregate Score Box (each platform + overall)
   - Quick Facts Sidebar (activity, island, duration, price, group size, includes, accessibility, age min)
   - Pros & Cons from reviews
   - What Reviewers Say (themes)
   - Best For, Similar Tours, Related FAQs
   - FareHarbor CTA at bottom
4. **Internal links** — Link to comparisons, ranked lists, competitor reviews
5. **Verify** — Scores from 2+ platforms, Quick Facts complete, FareHarbor top+bottom

#### PLAYBOOK: How to Write a Ranked List Page

1. **Select category** — [Activity] x [Island] with 5+ operators
2. **Rank operators** — Weighted aggregate scores, price-value ratio, assign "Best For" labels
3. **Write content:**
   - Title: "Best [Activity] in [Island] — Top [N] Ranked ([Year])"
   - TLDR: #1 pick + reason + runner-up
   - Rankings Table: Rank, Operator, Score, Price, Best For, Book
   - Mini-review per operator (150 words each) + FareHarbor CTA
   - "How We Ranked These" methodology section
4. **Internal links** — Each operator links to review page + comparisons
5. **Verify** — Table complete, methodology section, FareHarbor per operator

#### PLAYBOOK: How to Write an FAQ Page

1. **Source question** — Screenshot PAA boxes, use exact question as title
2. **Write answer** — 120 words, direct, specific, data-included. No filler.
3. **Add internal links** — 2-3 links to BOTF money pages + "Our Top Picks" callout box
4. **Organize** — Place in `/[island]-faq/` subfolder
5. **Rules** — No FAQ schema, no affiliate links, no padding. Expand ONLY after ranking proves out.

#### PLAYBOOK: How to Aggregate Reviews

1. **API setup** — TripAdvisor, Google Places, Yelp Fusion API keys
2. **Collect** — Search by name+location, get rating + count + excerpts per platform
3. **Normalize** — Weighted average: `sum(score × count) / sum(count)` across platforms
4. **Extract themes** — Top 3 positives, top 2-3 complaints via NLP or manual categorization
5. **Freshness** — Weekly refreshes in Phase 4+, display "Updated [Month Year]"

#### PLAYBOOK: How to Do GSC Analysis (Phase 2+)

1. **BOTF filter** — GSC Performance → Queries → Regex: `best|review|vs|compare|price|cost|cheap|book`
2. **Striking distance** — Filter position 5-20, sort by impressions (highest ROI)
3. **Optimize winners** — Expand top 10 pages to 1000+ words, add data/photos, strengthen inlinks
4. **Support strugglers** — Create 2-3 new FAQ pages per struggling BOTF page
5. **Find opportunities** — Queries with impressions but no dedicated page → new content

---

### Content Templates

#### Comparison Page Template (Kemp Model)

```
# [Operator A] vs [Operator B] — Which [Activity] Is Better?

**TLDR:** [Winner] wins for [reason]. Choose [B] if [reason].
**→ [Book [Winner] — $XXX](fareharbor)**

| Feature | [Operator A] | [Operator B] |
|---------|-------------|-------------|
| Price | $XXX | $XXX |
| Duration | X hours | X hours |
| Group Size | XX max | XX max |
| Includes | [List] | [List] |
| Review Score | X.X/5 (X,XXX) | X.X/5 (X,XXX) |
| Best For | [Audience] | [Audience] |
| **Book** | [→ Book](fareharbor) | [→ Book](fareharbor) |

## Detailed Breakdown → [3-4 paragraphs]
## Choose [A] If... → [reasons + FareHarbor link]
## Choose [B] If... → [reasons + FareHarbor link]
## Other Alternatives → [internal links to reviews + ranked list]
```

#### Operator Review Page Template

```
# [Operator] Reviews — What [N] Reviews Say

**TLDR:** [Verdict. Score. Price. Best for.]
**→ [Book — from $XXX](fareharbor)**

| Platform | Score | Reviews |
|----------|-------|---------|
| TripAdvisor | X.X/5 | X,XXX |
| Google | X.X/5 | X,XXX |
| Yelp | X.X/5 | XXX |
| **Overall** | **X.X/5** | **X,XXX** |

Quick Facts: Activity | Island | Duration | Price | Group Size | Includes | Min Age
## What Reviewers Love → [themes + quotes]
## Common Complaints → [themes + quotes]
## Best For → [audience]
**→ [Book Now — from $XXX](fareharbor)**
## Compared to Alternatives → [internal links]
```

#### Ranked List Page Template

```
# Best [Activity] in [Island] — Top [N] Ranked (2026)

**TLDR:** [#1] is best because [reason]. [#2] best for [audience].

| # | Operator | Score | Price | Best For | Book |
|---|----------|-------|-------|----------|------|
| 1 | [Op] | X.X/5 | $XXX | [Aud] | [→ Book](fareharbor) |

## #1: [Op] — Best Overall → [150 words] → [Book](fareharbor)
## How We Ranked These → [methodology]
```

#### FAQ Page Template

```
# [Exact PAA Question]?

[120-word direct answer. Specific — names, prices, scores. No filler.]

## Our Top Picks
→ [Best [Activity] in [Island]](link)
→ [Operator Reviews](link)
→ [A vs B Comparison](link)

RULES: No affiliate links. No schema. /[island]-faq/ subfolder. 2-3 BOTF links required.
```

#### Price/Budget Page Template

```
# Cheapest [Activity] in [Island] — Prices From $[X] (2026)

**TLDR:** [Cheapest] at $[X]. Best value is [op] at $[X].

| Operator | Price | Duration | Score | Value | Book |
|----------|-------|----------|-------|-------|------|
| [Budget] | $XX | X hrs | X.X/5 | Budget | [→ Book](fareharbor) |

## Best Budget → [why + trade-offs + Book]
## Best Value → [worth the extra + Book]
## When Premium Worth It → [justify + Book]
```

---

### Keyword Data

**Oahu:**
things to do in oahu, oahu tours, best oahu tours, oahu activities, oahu excursions, things to do in honolulu, things to do in waikiki, pearl harbor tour, north shore oahu things to do, oahu snorkeling tours, best snorkeling oahu, hanauma bay snorkeling, oahu whale watching, oahu helicopter tours, oahu shark diving, oahu surfing lessons, kualoa ranch tours, kualoa ranch atv, polynesian cultural center, chiefs luau oahu, paradise cove luau, oahu food tours, chiefs luau vs paradise cove, kualoa ranch vs coral crater, best luau oahu, cheapest luau oahu, best snorkeling tour oahu, best helicopter tour oahu, family things to do oahu, romantic things to do oahu

**Maui:**
things to do in maui, maui tours, best maui tours, maui activities, road to hana tours, maui whale watching, maui helicopter tours, best snorkeling maui, molokini snorkeling, maui sunset cruise, old lahaina luau, feast at lele, maui surf lessons, haleakala sunrise tour, pride of maui reviews, four winds maui reviews, trilogy maui, sail maui, pacific whale foundation reviews, blue hawaiian maui, maverick helicopters maui, blue hawaiian vs maverick helicopters, old lahaina luau vs feast at lele, pride of maui vs four winds, sail maui vs trilogy, pacific whale foundation vs ultimate whale watch, best luau maui, cheapest snorkeling maui, best snorkeling for beginners maui, best sunset cruise for couples maui

**Big Island:**
things to do in big island, big island tours, hawaii volcano tours, manta ray night dive, big island snorkeling, kona snorkeling, big island helicopter tours, big island fishing, fair wind cruises reviews, body glove cruises hawaii, fair wind vs body glove, best manta ray tour big island, best volcano tour big island, cheapest snorkeling kona

**Kauai:**
things to do in kauai, kauai tours, na pali coast tours, kauai helicopter tours, kauai snorkeling, kauai kayak, waimea canyon tours, jack harter helicopters reviews, blue hawaiian kauai, captain andy's kauai, jack harter vs blue hawaiian kauai, best na pali coast tour, captain andys vs napali catamaran, cheapest helicopter tour kauai

**Molokai/Lanai (near-zero competition):**
best molokai tours, kalaupapa mule ride reviews, things to do in molokai, best lanai tours, niihau snorkeling tour

**Seasonal:** whale watching season hawaii, best time for whale watching maui, hawaii winter activities
**Price:** cheapest helicopter tour maui, cheapest snorkeling tour oahu, hawaii tours under $100, cheap luau oahu, affordable helicopter tour hawaii, best value tours hawaii, hawaii tours under $50
**Audience:** best luau for kids hawaii, best snorkeling for beginners maui, best sunset cruise for couples maui, senior friendly tours oahu, wheelchair accessible tours hawaii, family friendly helicopter tour, romantic things to do kauai, hawaii tours for non-swimmers
**Review-intent:** [operator] reviews [year], is [operator] worth it, [operator] pros and cons, [operator] complaints

---

### Operator Database

**Full database:** `~/Projects/HawaiiScout/operators.json` — 62 active operators, 5 closed, all 10 categories, verified 2026-04-04.

**Helicopter (7):** Blue Hawaiian (all islands, $379-719), Maverick (Maui/Kauai, $229-469), Jack Harter (Kauai, $169-399, FH✓), Mauna Loa (BI/Oahu/Kauai, $229-639, FH✓), Rainbow (Oahu/BI, $305-1180), Magnum (Oahu, $380-434, FH✓), Air Maui (Maui, $330-480)
**Luau (7):** Old Lahaina (Maui, $230), Chief's (Oahu, $130-220, FH✓), PCC (Oahu, $95-294), Voyagers of the Pacific (BI, $169-228, FH✓), Hawaiiloa (BI, $205-240), Luau Kalamaku (Kauai, $171-250), Smith's (Kauai, $105-150)
**Snorkeling (8):** Pride of Maui ($115-241, FH✓), Four Winds ($80-180), Trilogy (Maui/Lanai, $160-250), Sail Maui ($90-200, FH✓), Fair Wind (BI, $117-167, FH✓), Hawaii Nautical (Oahu, $80-150, FH✓), Capt Andy's (Kauai, $229-295), Blue Dolphin (Kauai, $189-259)
**Whale Watch (5):** PacWhale (Maui, $90-170, FH✓), Ultimate (Maui, $77-195), Calypso (Maui, $55-60, FH✓), Body Glove (BI, $99-140, FH✓), Star of Honolulu (Oahu, $99-139)
**Cultural (4):** E Noa (Oahu, $57-205, FH✓), Royal Star (Oahu, $99-215), Discover Hawaii (multi, $49-250), Go Tours (Oahu/Maui, $99-250)
**Land Tours (10):** Kualoa Ranch (Oahu, $50-150), Coral Crater (Oahu, $50-130), Roberts Hawaii (multi, $50-100), Polynesian Adventure (multi, $50-90), Kailani (BI, $199-309, FH✓), Valley Isle (Maui, $216-280, FH✓), Temptation (Maui, $212-319), Kohala Zipline (BI, $220-345, FH✓), Kipu Ranch (Kauai, $190-250, FH✓), Kauai Tour Guy (Kauai, $95-250)
**Submarine (3):** Atlantis Waikiki (Oahu, $75-168), Atlantis Kona (BI, $75-145), Island Water Sports (Oahu, $95-193)
**Fishing (8):** Magic Sportfishing (Oahu, $250-1775, FH✓), Boom Boom (Oahu, $250-2100), Strike Zone (Maui, $174-600), Finest Kind (Maui, $250-1900), Humdinger (BI, $699-1485), High Noon (BI, $500-1500), Ohana (Kauai, $155-1400), Go Fish Kauai ($183-1200)
**Surfing (5):** Hans Hedemann (Oahu, $75-400, FH✓), Jamie O'Brien (Oahu, $85-209), North Shore Surf School (Oahu, $100-225, FH✓), Royal Hawaiian Surf Academy (Maui, $125-175, FH✓), Surf Club Maui ($55-150)
**Food Tours (5):** Secret Food Tours (Oahu, $100), Hawaii Food Tours (Oahu, $129-139), Stardust Hawaii (Maui, $190), Tasting Kauai (Kauai, $114, FH✓), Kona Tasting Tours (BI, $129-149, FH✓)

**⚠️ Closed (do NOT build pages):** Paradise Helicopters (May 2024), Sunshine Helicopters (Dec 2024), Feast at Lele (Lahaina fire 2023), Paradise Cove Luau (Jan 2026), Atlantis Maui (temp closed, Lahaina fire)
**FH✓ = FareHarbor confirmed** — 23 of 62 operators verified on FareHarbor. These are priority for affiliate CTAs.

---

### Site Architecture

**Hub-and-spoke:**
Homepage → Island Hubs (/oahu/, /maui/, /big-island/, /kauai/) → Activity Hubs (/[island]/[activity]/) → Operator Reviews (/operators/[slug]/)

**Bidirectional:** Comparisons (/compare/[a]-vs-[b]/) ↔ Operator Reviews (always link both directions)
**Authority funnel:** FAQ pages (/[island]-faq/[slug]/) → BOTF money pages (2-3 links each)
**Every BOTF page gets 3+ FAQ inlinks.** Hub pages link to all child pages in cluster.

**Topical authority map:**
- Island clusters: Oahu (35%), Maui (30%), Big Island (20%), Kauai (15%)
- Activity clusters: Snorkeling, Helicopter, Luau, Whale Watch, Land Tours, Submarine, Fishing, Surfing, Food Tours, Cultural

---

## Criteria

### Phase 1 — BOTF Foundation

> **GATE: None — this is the starting phase. Begin immediately.**
> Phase 1 is complete when all 21 ISCs below are checked.

**Step 1: Infrastructure**
- [x] ISC-1: hawaiiscout.com registered, Astro deployed, HTTPS on Vercel/Cloudflare | DONE WHEN: Domain resolves, build pipeline works
- [x] ISC-2: GSC + Bing Webmaster + Clarity + IndexNow configured | DEPS: ISC-1 | DONE WHEN: All 4 tools verified
- [x] ISC-3: Operator database seeded with 50 operators | DONE WHEN: DB has 50 operators, all fields populated
- [ ] ISC-4: Review aggregation API pipeline working (TA + Google + Yelp) | DEPS: ISC-3 | DONE WHEN: 3 APIs fetching + normalizing scores
- [ ] ISC-5: Review data aggregated for top 50 operators | DEPS: ISC-4 | DONE WHEN: 50 operators scored from 2+ platforms
- [ ] ISC-6: FareHarbor affiliate program approved | DONE WHEN: Tracking links received + verified

**Step 2: BOTF Money Page Blitz — Comparisons + Reviews**
- [ ] ISC-7: Comparison table template built (Kemp model) | DEPS: ISC-1 | DONE WHEN: Astro component renders, mobile responsive
- [ ] ISC-8: 25+ head-to-head comparison pages published | DEPS: ISC-7, ISC-5, ISC-6 | DONE WHEN: 25+ pages indexed, FareHarbor on all
- [ ] ISC-9: 25+ operator review pages published | DEPS: ISC-4, ISC-6 | DONE WHEN: 25+ pages with multi-platform scores + FareHarbor
- [ ] ISC-10: Internal linking: comparisons ↔ reviews bidirectional | DEPS: ISC-8, ISC-9 | DONE WHEN: All comparison+review pages interlinked
- [ ] ISC-11: Zero brand names in any page title | DEPS: ISC-8, ISC-9 | DONE WHEN: Audit confirms zero

**Step 3: Ranked Lists + Price Pages**
- [ ] ISC-12: 15+ "best [activity] in [island]" ranked lists published | DEPS: ISC-9 | DONE WHEN: 15+ pages with 5+ operators each
- [ ] ISC-13: 10+ price/budget BOTF pages published | DEPS: ISC-5 | DONE WHEN: 10+ price comparison pages live
- [ ] ISC-14: 10+ audience buying guides published | DEPS: ISC-5 | DONE WHEN: 10+ audience-specific guides live
- [ ] ISC-15: Molokai + Lanai first-mover pages published | DEPS: ISC-5 | DONE WHEN: First-mover pages indexed
- [ ] ISC-16: Hub pages link to all BOTF per cluster | DEPS: ISC-8, ISC-9, ISC-12 | DONE WHEN: Hub pages complete

**Step 4: Authority Support Layer**
- [ ] ISC-17: 50+ PAA screenshots cataloged | DEPS: ISC-8, ISC-9 | DONE WHEN: Screenshots organized by cluster
- [ ] ISC-18: 100+ FAQ pages published (120 words each) | DEPS: ISC-17 | DONE WHEN: 100+ FAQs with 2-3 BOTF links each
- [ ] ISC-19: FAQs organized in /[island]-faq/ subfolders | DEPS: ISC-18 | DONE WHEN: All FAQs in correct subfolder
- [ ] ISC-20: FAQ hub pages created with BOTF links above | DEPS: ISC-19 | DONE WHEN: Hub per subfolder
- [ ] ISC-21: Every BOTF page has 3+ FAQ inlinks | DEPS: ISC-18 | DONE WHEN: Internal linking audit passes

### Phase 2 — BOTF Optimization

> **ENTRY GATE — all must be true:**
> 1. All Phase 1 ISCs complete
> 2. GSC shows impression data for ≥50 BOTF pages (proves Google has crawled + indexed + served them)
> 3. ≥10 BOTF pages appear at position 5-20 in GSC (striking distance exists — these are the 70/30 "winners" to invest in)
> 4. GSC BOTF regex filter (`best|review|vs|compare|price|cost|cheap|book`) returns actionable query data
>
> **How to check:** GSC → Performance → Pages → filter by BOTF URLs. If <50 pages show impressions, keep publishing Phase 1 content. If <10 pages at position 5-20, the site hasn't built enough signal yet — continue building FAQ inlinks to existing BOTF pages.

- [ ] ISC-22: GSC regex filter applied, BOTF queries exported | DEPS: Phase 2 entry gate met | DONE WHEN: Regex filter working, data exported
- [ ] ISC-23: Striking distance pages identified (pos 5-20) | DEPS: ISC-22 | DONE WHEN: Action plan per page
- [ ] ISC-24: New FAQ pages created for struggling BOTF pages | DEPS: ISC-22 | DONE WHEN: Each struggler has 3+ new FAQ inlinks
- [ ] ISC-25: Winning BOTF pages expanded to 1000+ words | DEPS: ISC-22 | DONE WHEN: Top pages enriched with data/photos/pricing
- [ ] ISC-26: 75+ total operator reviews (next 50 operators) | DEPS: ISC-9 | DONE WHEN: 75+ reviews live
- [ ] ISC-27: 25+ new comparison pages from GSC data | DEPS: ISC-22 | DONE WHEN: New comparisons published
- [ ] ISC-28: Clarity heatmap analysis complete | DEPS: Clarity + traffic | DONE WHEN: CTA placement recommendations documented
- [ ] ISC-29: FareHarbor CTR tracked per page type | DEPS: ISC-6 | DONE WHEN: Dashboard shows CTR by page type

### Phase 3 — BOTF Scale

> **ENTRY GATE — all must be true:**
> 1. All Phase 2 ISCs complete
> 2. Top 10 BOTF pages identified and expanded to 1000+ words (the 70/30 winners got investment)
> 3. Striking distance pages have moved toward page 1 (FAQ inlink strategy is working)
> 4. FareHarbor CTR baseline established per page type (you know what converts)
>
> **How to check:** GSC position trend for striking distance pages (improving?). FareHarbor dashboard shows click data by page type. If winners haven't moved, keep optimizing Phase 2 before scaling.

- [ ] ISC-30: 200+ operator reviews generated programmatically | DEPS: ISC-4 at scale | DONE WHEN: 200+ pages with aggregated data
- [ ] ISC-31: 100+ total comparison pages | DEPS: ISC-30 | DONE WHEN: All major operator pairs covered
- [ ] ISC-32: Price tracking dashboard pages live | DEPS: FareHarbor API | DONE WHEN: Dynamic pricing displayed
- [ ] ISC-33: Audience filtering on ranked lists | DEPS: ISC-12 | DONE WHEN: Filterable UI working
- [ ] ISC-34: Email capture on high-converting pages | DEPS: ISC-29 | DONE WHEN: Signup form on top pages
- [ ] ISC-35: Monthly LLM visibility test completed | DEPS: Published content | DONE WHEN: Citations checked across 4 LLMs
- [ ] ISC-36: Link building outreach to 20+ targets | DEPS: Published content | DONE WHEN: Outreach sent to travel bloggers/media
- [ ] ISC-37: All whale watching BOTF indexed before Nov | DEPS: Whale operator data | DONE WHEN: PWF comparison + reviews + ranked list live

### Phase 4 — Revenue Optimization

> **ENTRY GATE — all must be true:**
> 1. All Phase 3 ISCs complete
> 2. ≥200 BOTF pages indexed in GSC (scale achieved)
> 3. Measurable FareHarbor affiliate revenue recorded (the model works)
> 4. ≥3 BOTF pages ranking page 1 for their target keyword (authority signal is real)
>
> **How to check:** GSC index coverage for BOTF URLs. FareHarbor affiliate dashboard shows completed bookings. If <200 pages indexed, keep scaling Phase 3. If zero revenue, diagnose CTA/conversion before optimizing.

- [ ] ISC-38: 550+ total pages indexed (400 BOTF + 150 TOFU) | DEPS: Phase 3 | DONE WHEN: Index coverage verified
- [ ] ISC-39: Weekly automated API review refreshes running | DEPS: ISC-4 stable | DONE WHEN: Cron job active
- [ ] ISC-40: CTA A/B tests running on top 20 pages | DEPS: ISC-29 | DONE WHEN: Test variants deployed
- [ ] ISC-41: UGC review submission on review pages | DEPS: ISC-9 | DONE WHEN: User form + moderation working
- [ ] ISC-42: Direct FareHarbor operator partnerships negotiated | DEPS: Traffic proof | DONE WHEN: Higher commission deals signed
- [ ] ISC-43: Ranking for moderate-competition head terms | DEPS: Authority built | DONE WHEN: Position improvements on "best tours [island]"
- [ ] ISC-44: Monthly LLM visibility audit process established | DEPS: ISC-35 | DONE WHEN: Documented monthly process

### Phase 5 — Market Dominance

> **ENTRY GATE — all must be true:**
> 1. All Phase 4 ISCs complete
> 2. ≥400 BOTF pages indexed (deep topical coverage)
> 3. Ranking for moderate-competition terms like "best [activity] [island]" (authority built)
> 4. Consistent monthly affiliate revenue ≥$2K (business model proven at scale)
> 5. ≥3 months of stable organic traffic growth trend in GSC
>
> **How to check:** GSC → Performance → compare 3-month periods. FareHarbor monthly revenue trend. If authority isn't translating to moderate terms yet, keep building Phase 4 link outreach + content before attacking head terms.

- [ ] ISC-45: Competing for "best tours hawaii" head terms | DEPS: Strong authority | DONE WHEN: Top 10 for major head terms
- [ ] ISC-46: 600+ BOTF pages across all categories | DEPS: Phase 4 | DONE WHEN: Full coverage verified
- [ ] ISC-47: Real-time booking widget with live availability | DEPS: FareHarbor API | DONE WHEN: Widget on review pages
- [ ] ISC-48: Display ads on TOFU pages generating revenue | DEPS: TOFU traffic | DONE WHEN: Ad revenue measurable
- [ ] ISC-49: Expansion analysis for other destinations complete | DEPS: Hawaii proven | DONE WHEN: Decision on next market

## Decisions

- 2026-04-01: Domain selected as hawaiiscout.com (broad enough for multi-revenue expansion)
- 2026-04-01: FareHarbor as primary monetization (most Hawaii operators use FareHarbor backend)
- 2026-04-02: Monday board in LSEO/Updryv account (board ID: 18407085310)
- 2026-04-04: PRD file is AI source of truth; Monday board is visual dashboard only
- 2026-04-04: Phases use data-triggered gates, not calendar dates — faithful to Quaid's sequence-based methodology

## Verification
