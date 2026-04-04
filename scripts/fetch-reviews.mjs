/**
 * Hawaii Scout — Apify Review Aggregation Pipeline
 *
 * Fetches ratings from TripAdvisor, Google Maps, and Yelp for all 62 operators.
 * Outputs: src/data/reviews.json (read by Astro at build time)
 *
 * Usage: npm run reviews
 *
 * Actors used:
 *   TripAdvisor: maxcopell/tripadvisor
 *   Google Maps: compass/crawler-google-places
 *   Yelp:        epctex/yelp-scraper
 */

import { ApifyClient } from 'apify-client';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load env
const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error('❌ APIFY_TOKEN not set. Export it before running: export APIFY_TOKEN=your_token');
  process.exit(1);
}

const client = new ApifyClient({ token: APIFY_TOKEN });

// Load operators
const { operators } = JSON.parse(
  readFileSync(join(ROOT, 'src/data/operators.json'), 'utf8')
);

// --- Helpers ---

function islandToLocation(islands) {
  const map = {
    'Oahu': 'Honolulu, Hawaii',
    'Maui': 'Maui, Hawaii',
    'Big Island': 'Kona, Hawaii',
    'Kauai': 'Kauai, Hawaii',
    'Lanai': 'Lanai, Hawaii',
  };
  return map[islands[0]] ?? 'Hawaii';
}

function compositeScore(platforms) {
  // Weighted: TripAdvisor 40%, Google 40%, Yelp 20%
  const weights = { tripadvisor: 0.4, google: 0.4, yelp: 0.2 };
  let total = 0;
  let weightSum = 0;
  for (const [platform, weight] of Object.entries(weights)) {
    const data = platforms[platform];
    if (data?.rating) {
      total += data.rating * weight;
      weightSum += weight;
    }
  }
  if (weightSum === 0) return null;
  // Normalize to actual weights available
  return Math.round((total / weightSum) * 10) / 10;
}

// --- Apify actor runners ---

async function fetchTripAdvisor(operator, location) {
  try {
    const run = await client.actor('maxcopell/tripadvisor').call({
      query: `${operator.name} ${location}`,
      maxItems: 1,
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    return {
      rating: item.rating ?? null,
      reviewCount: item.numberOfReviews ?? null,
      url: item.url ?? null,
    };
  } catch (err) {
    console.warn(`  ⚠️  TripAdvisor failed for ${operator.name}:`, err.message);
    return null;
  }
}

async function fetchGoogle(operator, location) {
  try {
    const run = await client.actor('compass/crawler-google-places').call({
      searchStringsArray: [`${operator.name} ${location}`],
      maxCrawledPlacesPerSearch: 1,
      scrapeReviews: false,
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    return {
      rating: item.totalScore ?? null,
      reviewCount: item.reviewsCount ?? null,
      url: item.url ?? null,
    };
  } catch (err) {
    console.warn(`  ⚠️  Google Maps failed for ${operator.name}:`, err.message);
    return null;
  }
}

async function fetchYelp(operator, location) {
  try {
    const run = await client.actor('epctex/yelp-scraper').call({
      search: operator.name,
      searchLocation: location,
      maxItems: 1,
      includeReviews: false,
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    return {
      rating: item.aggregatedRating ?? null,
      reviewCount: item.reviewCount ?? null,
      url: item.url ?? null,
    };
  } catch (err) {
    console.warn(`  ⚠️  Yelp failed for ${operator.name}:`, err.message);
    return null;
  }
}

// --- Process one operator ---

async function processOperator(operator) {
  const location = islandToLocation(operator.islands);
  console.log(`\n[${operator.id}] ${operator.name} (${location})`);

  const [tripadvisor, google, yelp] = await Promise.all([
    fetchTripAdvisor(operator, location),
    fetchGoogle(operator, location),
    fetchYelp(operator, location),
  ]);

  const platforms = { tripadvisor, google, yelp };
  const composite = compositeScore(platforms);

  const hasAnyData = tripadvisor || google || yelp;
  if (hasAnyData) {
    console.log(`  ✅ TA: ${tripadvisor?.rating ?? '–'} (${tripadvisor?.reviewCount ?? 0} reviews) | Google: ${google?.rating ?? '–'} (${google?.reviewCount ?? 0}) | Yelp: ${yelp?.rating ?? '–'} (${yelp?.reviewCount ?? 0}) → Composite: ${composite ?? '–'}`);
  } else {
    console.log(`  ⚠️  No data found on any platform`);
  }

  return {
    id: operator.id,
    name: operator.name,
    updatedAt: new Date().toISOString(),
    composite,
    platforms,
  };
}

// --- Main with concurrency limit ---

async function processBatch(batch) {
  return Promise.all(batch.map(op => processOperator(op)));
}

async function main() {
  const CONCURRENCY = 3; // 3 operators at a time — stays within Apify free tier
  const results = {};

  // Load existing results to allow resuming
  const outPath = join(ROOT, 'src/data/reviews.json');
  try {
    const existing = JSON.parse(readFileSync(outPath, 'utf8'));
    Object.assign(results, existing);
    console.log(`Loaded ${Object.keys(existing).length} existing results — skipping already-fetched operators`);
  } catch {
    console.log('No existing reviews.json — starting fresh');
  }

  // Filter to operators not yet fetched (allows resuming)
  const pending = operators.filter(op => !results[op.id]);
  console.log(`\n🌺 Hawaii Scout Review Pipeline`);
  console.log(`Total operators: ${operators.length} | Pending: ${pending.length} | Already fetched: ${operators.length - pending.length}`);
  console.log(`Concurrency: ${CONCURRENCY} | Actors: TripAdvisor + Google Maps + Yelp\n`);

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    console.log(`\n--- Batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(pending.length / CONCURRENCY)} ---`);

    const batchResults = await processBatch(batch);

    for (const result of batchResults) {
      results[result.id] = result;
    }

    // Write after each batch — safe to interrupt
    writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved progress (${Object.keys(results).length}/${operators.length} operators)`);
  }

  console.log(`\n✅ Pipeline complete. ${Object.keys(results).length} operators in reviews.json`);
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
