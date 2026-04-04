/**
 * Hawaii Scout — Apify Review Aggregation Pipeline
 *
 * Fetches ratings + actual reviews from TripAdvisor, Google Maps, and Yelp for all 62 operators.
 * Outputs: src/data/reviews.json (read by Astro at build time)
 *
 * Usage: npm run reviews
 *        npm run reviews -- --force   (re-fetch all, ignore cache)
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

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error('❌ APIFY_TOKEN not set. Run: source ~/.claude/.env');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 10;   // operators running simultaneously
const MAX_REVIEWS = 20;   // reviews to fetch per platform per operator
const ACTOR_TIMEOUT = 180; // seconds to wait per actor run

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
  const weights = { tripadvisor: 0.4, google: 0.4, yelp: 0.2 };
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

async function fetchTripAdvisor(operator, location) {
  try {
    const run = await client.actor('maxcopell/tripadvisor').call({
      query: `${operator.name} ${location}`,
      maxItems: 1,
      includeReviews: true,
      maxReviews: MAX_REVIEWS,
    }, { waitSecs: ACTOR_TIMEOUT });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    const reviews = normalizeReviews(item.reviews ?? [], {
      author: 'username',
      rating: 'rating',
      date: 'publishedDate',
      text: 'text',
    });

    return {
      rating: item.rating ?? null,
      reviewCount: item.numberOfReviews ?? null,
      url: item.url ?? null,
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
      searchStringsArray: [`${operator.name} ${location}`],
      maxCrawledPlacesPerSearch: 1,
      scrapeReviews: true,
      maxReviews: MAX_REVIEWS,
    }, { waitSecs: ACTOR_TIMEOUT });

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

async function fetchYelp(operator, location) {
  try {
    const run = await client.actor('epctex/yelp-scraper').call({
      search: operator.name,
      searchLocation: location,
      maxItems: 1,
      includeReviews: true,
      maxReviews: MAX_REVIEWS,
    }, { waitSecs: ACTOR_TIMEOUT });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
    if (!items.length) return null;

    const item = items[0];
    const reviews = normalizeReviews(item.reviews ?? [], {
      author: 'reviewerName',
      rating: 'rating',
      date: 'date',
      text: 'text',
    });

    return {
      rating: item.aggregatedRating ?? null,
      reviewCount: item.reviewCount ?? null,
      url: item.url ?? null,
      reviews,
    };
  } catch (err) {
    console.warn(`  ⚠️  Yelp failed for ${operator.name}:`, err.message);
    return null;
  }
}

// --- Process one operator ---

async function processOperator(operator, results, saveProgress) {
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

  const reviewCounts = {
    ta: tripadvisor?.reviews?.length ?? 0,
    google: google?.reviews?.length ?? 0,
    yelp: yelp?.reviews?.length ?? 0,
  };
  const totalReviews = reviewCounts.ta + reviewCounts.google + reviewCounts.yelp;

  if (hasAnyData) {
    console.log(
      `  ✅ TA: ${tripadvisor?.rating ?? '–'} (${tripadvisor?.reviewCount ?? 0} | ${reviewCounts.ta} saved)` +
      ` | Google: ${google?.rating ?? '–'} (${google?.reviewCount ?? 0} | ${reviewCounts.google} saved)` +
      ` | Yelp: ${yelp?.rating ?? '–'} (${yelp?.reviewCount ?? 0} | ${reviewCounts.yelp} saved)` +
      ` → ⭐ ${composite ?? '–'} (${totalReviews} reviews saved)`
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
  try {
    const existing = JSON.parse(readFileSync(outPath, 'utf8'));
    if (!FORCE) Object.assign(results, existing);
    const cached = Object.keys(existing).length;
    if (cached) console.log(`Loaded ${cached} cached operators${FORCE ? ' (--force: ignoring cache)' : ''}`);
  } catch {
    console.log('No existing reviews.json — starting fresh');
  }

  const pending = operators.filter(op => !results[op.id]);

  console.log(`\n🌺 Hawaii Scout Review Pipeline`);
  console.log(`Operators: ${operators.length} total | ${pending.length} pending | ${operators.length - pending.length} cached`);
  console.log(`Concurrency: ${CONCURRENCY} | Reviews per platform: ${MAX_REVIEWS} | Actors: TA + Google + Yelp\n`);

  if (!pending.length) {
    console.log('✅ All operators already cached. Run with --force to re-fetch.');
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
