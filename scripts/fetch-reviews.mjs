/**
 * Hawaii Scout — Apify Review Aggregation Pipeline
 *
 * Fetches ratings + actual reviews from TripAdvisor and Google Maps for all 62 operators.
 * Outputs: src/data/reviews.json (read by Astro at build time)
 *
 * Usage: npm run reviews
 *        npm run reviews -- --force      (re-fetch all, ignore cache)
 *        npm run reviews -- --ta-only    (re-fetch TripAdvisor only, keep Google cached)
 *
 * Actors used:
 *   TripAdvisor: thewolves/tripadvisor-reviews-scraper (requires tripadvisor_url in operators.json)
 *   Google Maps: compass/crawler-google-places
 *   Composite:   TA 50% + Google 50%
 */

import { ApifyClient } from 'apify-client';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error('❌ APIFY_TOKEN not set. Run: source ~/.claude/.env');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const TA_ONLY = process.argv.includes('--ta-only');
const CONCURRENCY = 3;    // operators running simultaneously (limited by Apify 32GB memory cap)
const MAX_REVIEWS = 20;   // reviews to fetch per platform per operator
const ACTOR_TIMEOUT = 180; // seconds to wait per actor run
const GOOGLE_MEMORY = 2048; // MB — default is 4096, halving saves budget
const TA_MEMORY = 1024;     // MB — default is 2048, halving saves budget

const client = new ApifyClient({ token: APIFY_TOKEN });

const { operators } = JSON.parse(
  readFileSync(join(ROOT, 'src/data/operators.json'), 'utf8')
);

const outPath = join(ROOT, 'src/data/reviews.json');

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
  // TripAdvisor 50% + Google 50% (Yelp removed)
  const weights = { tripadvisor: 0.5, google: 0.5 };
  let total = 0, weightSum = 0;
  for (const [platform, weight] of Object.entries(weights)) {
    const data = platforms[platform];
    if (data?.rating) {
      total += data.rating * weight;
      weightSum += weight;
    }
  }
  if (weightSum === 0) return null;
  return Math.round((total / weightSum) * 10) / 10;
}

function normalizeReviews(rawReviews, fields) {
  if (!Array.isArray(rawReviews)) return [];
  return rawReviews.slice(0, MAX_REVIEWS).map(r => ({
    author: r[fields.author] ?? null,
    rating: r[fields.rating] ?? null,
    date: r[fields.date] ?? null,
    text: (r[fields.text] ?? '').slice(0, 500), // cap at 500 chars per review
  })).filter(r => r.text);
}

// --- Apify actor runners ---

function operatorGoogleQuery(operator) {
  // "Business Name Hawaii" works better than "Business Name Honolulu, Hawaii"
  // — avoids multi-location operators getting pinned to wrong city
  return `${operator.name} Hawaii`;
}

async function fetchTripAdvisor(operator) {
  // Requires tripadvisor_url field on operator (set in operators.json)
  if (!operator.tripadvisor_url) return null;
  try {
    const run = await client.actor('thewolves/tripadvisor-reviews-scraper').call({
      startUrls: [{ url: operator.tripadvisor_url }],
      maxItems: 100,
      languages: ['all'],
      ratings: ['all'],
    }, { waitSecs: ACTOR_TIMEOUT, memory: TA_MEMORY });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 100 });
    if (!items.length) return null;

    // All items are individual reviews — extract rating + count from first item's location data
    const first = items[0];
    const reviews = items.slice(0, MAX_REVIEWS).map(r => ({
      author: r.username ?? null,
      rating: r.rating ?? null,
      date: r.publishedDate ?? r.createdDate ?? null,
      text: (r.text ?? '').slice(0, 500),
    })).filter(r => r.text);

    // The actor returns individual reviews — no aggregate rating in payload.
    // Compute average from scraped reviews as approximation.
    const ratings = items.map(r => r.rating).filter(r => typeof r === 'number');
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return {
      rating: avgRating,             // avg of scraped reviews (approx)
      reviewCount: null,             // not available from this actor
      url: operator.tripadvisor_url,
      reviews,
    };
  } catch (err) {
    console.warn(`  ⚠️  TripAdvisor failed for ${operator.name}:`, err.message);
    return null;
  }
}

async function fetchGoogle(operator, location) {
  try {
    const run = await client.actor('compass/crawler-google-places').call({
      searchStringsArray: [operatorGoogleQuery(operator)],
      maxCrawledPlacesPerSearch: 1,
      scrapeReviews: true,
      maxReviews: MAX_REVIEWS,
    }, { waitSecs: ACTOR_TIMEOUT, memory: GOOGLE_MEMORY });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    const reviews = normalizeReviews(item.reviews ?? [], {
      author: 'name',
      rating: 'stars',
      date: 'publishAt',
      text: 'text',
    });

    return {
      rating: item.totalScore ?? null,
      reviewCount: item.reviewsCount ?? null,
      url: item.url ?? null,
      reviews,
    };
  } catch (err) {
    console.warn(`  ⚠️  Google Maps failed for ${operator.name}:`, err.message);
    return null;
  }
}

// --- Process one operator ---

async function processOperator(operator, results, saveProgress) {
  const location = islandToLocation(operator.islands);
  const existing = results[operator.id];
  console.log(`\n[${operator.id}] ${operator.name} (${location})`);

  // In --ta-only mode: keep existing Google data cached, only re-fetch TripAdvisor
  const [tripadvisor, google] = await Promise.all([
    fetchTripAdvisor(operator),
    TA_ONLY && existing?.platforms?.google ? Promise.resolve(existing.platforms.google) : fetchGoogle(operator, location),
  ]);

  // Preserve existing platform data if new fetch returned null (null-safety)
  const platforms = {
    tripadvisor: tripadvisor ?? (TA_ONLY ? existing?.platforms?.tripadvisor ?? null : null),
    google:      google      ?? existing?.platforms?.google ?? null,
  };
  const composite = compositeScore(platforms);
  const hasAnyData = tripadvisor || google;

  const reviewCounts = {
    ta: tripadvisor?.reviews?.length ?? 0,
    google: google?.reviews?.length ?? 0,
  };
  const totalReviews = reviewCounts.ta + reviewCounts.google;

  if (hasAnyData) {
    console.log(
      `  ✅ TA: ${tripadvisor?.rating ?? '–'} (${reviewCounts.ta} saved)` +
      ` | Google: ${google?.rating ?? '–'} (${google?.reviewCount ?? 0} reviews | ${reviewCounts.google} saved)` +
      ` → ⭐ ${composite ?? '–'} (${totalReviews} total texts)`
    );
  } else {
    console.log(`  ⚠️  No data found on any platform`);
  }

  const result = {
    id: operator.id,
    name: operator.name,
    updatedAt: new Date().toISOString(),
    composite,
    platforms,
  };

  // Save immediately after each operator (safe with high concurrency)
  results[operator.id] = result;
  saveProgress(results);

  return result;
}

// --- Semaphore for concurrency control ---

function makeSemaphore(limit) {
  let active = 0;
  const queue = [];

  function release() {
    active--;
    if (queue.length > 0) {
      const next = queue.shift();
      active++;
      next();
    }
  }

  return function acquire(fn) {
    return new Promise((resolve, reject) => {
      const run = () => {
        Promise.resolve().then(fn).then(result => {
          release();
          resolve(result);
        }).catch(err => {
          release();
          reject(err);
        });
      };
      if (active < limit) {
        active++;
        run();
      } else {
        queue.push(run);
      }
    });
  };
}

// --- Main ---

async function main() {
  const results = {};

  // Load existing cache (resume support)
  let existingCache = {};
  try {
    existingCache = JSON.parse(readFileSync(outPath, 'utf8'));
    if (!FORCE) Object.assign(results, existingCache);
    const cached = Object.keys(existingCache).length;
    if (cached) console.log(`Loaded ${cached} cached operators${FORCE ? ' (--force: ignoring)' : TA_ONLY ? ' (--ta-only: refreshing TA only)' : ''}`);
  } catch {
    console.log('No existing reviews.json — starting fresh');
  }

  // --ta-only: re-process all operators that have a tripadvisor_url (Google stays cached)
  const pending = TA_ONLY
    ? operators.filter(op => op.tripadvisor_url)
    : operators.filter(op => !results[op.id]);

  console.log(`\n🌺 Hawaii Scout Review Pipeline`);
  console.log(`Mode: ${FORCE ? 'FORCE' : TA_ONLY ? 'TA-ONLY' : 'NORMAL'} | Concurrency: ${CONCURRENCY} | TA maxItems: 100`);
  console.log(`Operators: ${operators.length} total | ${pending.length} to process | Actors: TripAdvisor + Google\n`);

  if (!pending.length) {
    console.log('✅ All operators already cached. Use --force to re-fetch or --ta-only to refresh TripAdvisor.');
    return;
  }

  // Thread-safe progress writer
  let writing = false;
  let pendingWrite = false;
  function saveProgress(data) {
    if (writing) { pendingWrite = true; return; }
    writing = true;
    writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`  💾 Saved (${Object.keys(data).length}/${operators.length} operators)`);
    writing = false;
    if (pendingWrite) { pendingWrite = false; saveProgress(data); }
  }

  const acquire = makeSemaphore(CONCURRENCY);
  const start = Date.now();

  await Promise.all(
    pending.map(op =>
      acquire(() => processOperator(op, results, saveProgress))
    )
  );

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\n✅ Pipeline complete in ${elapsed}min. ${Object.keys(results).length} operators in reviews.json`);
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
