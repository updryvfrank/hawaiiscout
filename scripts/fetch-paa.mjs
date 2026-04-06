/**
 * Hawaii Scout — DataForSEO PAA Fetcher
 *
 * Sends TOFU keywords to DataForSEO SERP API, extracts "People Also Ask"
 * questions, deduplicates, and outputs scripts/paa-raw.json.
 *
 * Usage: node scripts/fetch-paa.mjs
 * Requires: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in environment
 *
 * Output: scripts/paa-raw.json
 *   [{ question, island, slug, sourceKeyword }]
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!LOGIN || !PASSWORD) {
  console.error('❌ DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set.');
  console.error('   Run: source ~/.claude/.env');
  process.exit(1);
}

const AUTH = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');

// TOFU keyword list from PRD — organized by island
// These are question-friendly queries most likely to trigger PAA boxes
const KEYWORDS = [
  // Oahu
  { keyword: 'things to do in oahu', island: 'oahu' },
  { keyword: 'things to do in waikiki', island: 'oahu' },
  { keyword: 'things to do in honolulu', island: 'oahu' },
  { keyword: 'best oahu tours', island: 'oahu' },
  { keyword: 'oahu snorkeling tours', island: 'oahu' },
  { keyword: 'best snorkeling oahu', island: 'oahu' },
  { keyword: 'oahu helicopter tours', island: 'oahu' },
  { keyword: 'best helicopter tour oahu', island: 'oahu' },
  { keyword: 'pearl harbor tour', island: 'oahu' },
  { keyword: 'north shore oahu things to do', island: 'oahu' },
  { keyword: 'best luau oahu', island: 'oahu' },
  { keyword: 'cheapest luau oahu', island: 'oahu' },
  { keyword: 'oahu surfing lessons', island: 'oahu' },
  { keyword: 'kualoa ranch tours', island: 'oahu' },
  { keyword: 'oahu food tours', island: 'oahu' },
  { keyword: 'family things to do oahu', island: 'oahu' },
  { keyword: 'romantic things to do oahu', island: 'oahu' },
  { keyword: 'hanauma bay snorkeling', island: 'oahu' },

  // Maui
  { keyword: 'things to do in maui', island: 'maui' },
  { keyword: 'best maui tours', island: 'maui' },
  { keyword: 'maui whale watching', island: 'maui' },
  { keyword: 'maui helicopter tours', island: 'maui' },
  { keyword: 'best helicopter tour maui', island: 'maui' },
  { keyword: 'best snorkeling maui', island: 'maui' },
  { keyword: 'molokini snorkeling', island: 'maui' },
  { keyword: 'best luau maui', island: 'maui' },
  { keyword: 'cheapest snorkeling maui', island: 'maui' },
  { keyword: 'best snorkeling for beginners maui', island: 'maui' },
  { keyword: 'maui sunset cruise', island: 'maui' },
  { keyword: 'best sunset cruise for couples maui', island: 'maui' },
  { keyword: 'road to hana tours', island: 'maui' },
  { keyword: 'haleakala sunrise tour', island: 'maui' },
  { keyword: 'maui surf lessons', island: 'maui' },
  { keyword: 'best whale watching maui', island: 'maui' },
  { keyword: 'when is whale watching season maui', island: 'maui' },

  // Big Island
  { keyword: 'things to do in big island hawaii', island: 'big-island' },
  { keyword: 'hawaii volcano tours', island: 'big-island' },
  { keyword: 'manta ray night dive big island', island: 'big-island' },
  { keyword: 'best snorkeling big island', island: 'big-island' },
  { keyword: 'kona snorkeling', island: 'big-island' },
  { keyword: 'big island helicopter tours', island: 'big-island' },
  { keyword: 'big island fishing charters', island: 'big-island' },
  { keyword: 'best manta ray tour big island', island: 'big-island' },
  { keyword: 'cheapest snorkeling kona', island: 'big-island' },
  { keyword: 'best volcano tour big island', island: 'big-island' },

  // Kauai
  { keyword: 'things to do in kauai', island: 'kauai' },
  { keyword: 'na pali coast tours', island: 'kauai' },
  { keyword: 'kauai helicopter tours', island: 'kauai' },
  { keyword: 'best helicopter tour kauai', island: 'kauai' },
  { keyword: 'kauai snorkeling tours', island: 'kauai' },
  { keyword: 'kauai kayak tours', island: 'kauai' },
  { keyword: 'waimea canyon tours', island: 'kauai' },
  { keyword: 'best na pali coast tour', island: 'kauai' },
  { keyword: 'cheapest helicopter tour kauai', island: 'kauai' },

  // General Hawaii
  { keyword: 'best time for whale watching hawaii', island: 'maui' },
  { keyword: 'hawaii tours under 100 dollars', island: 'oahu' },
  { keyword: 'best value tours hawaii', island: 'oahu' },
  { keyword: 'best luau for kids hawaii', island: 'oahu' },
  { keyword: 'wheelchair accessible tours hawaii', island: 'oahu' },
  { keyword: 'hawaii tours for non swimmers', island: 'oahu' },
  { keyword: 'senior friendly tours oahu', island: 'oahu' },
  { keyword: 'family friendly helicopter tour hawaii', island: 'oahu' },
  { keyword: 'romantic things to do kauai', island: 'kauai' },
];

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const BATCH_SIZE = 5;      // tasks per API call (live endpoint times out on large batches)
const BATCH_DELAY_MS = 1000; // 1s between batches

async function fetchBatch(batch) {
  const tasks = batch.map(({ keyword }) => ({
    keyword,
    location_code: 2840,
    language_code: 'en',
    device: 'desktop',
    os: 'windows',
  }));

  const response = await fetch(
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    {
      method: 'POST',
      headers: { 'Authorization': `Basic ${AUTH}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    }
  );

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const data = await response.json();
  if (data.status_code !== 20000) throw new Error(`API error: ${data.status_message}`);
  return data.tasks;
}

async function fetchPAA() {
  console.log(`📡 Fetching PAA data for ${KEYWORDS.length} keywords (${BATCH_SIZE}/batch)...`);

  const seen = new Set();
  const faqs = [];
  let processed = 0;

  // Process in small batches to avoid live endpoint timeouts
  for (let i = 0; i < KEYWORDS.length; i += BATCH_SIZE) {
    const batch = KEYWORDS.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(KEYWORDS.length / BATCH_SIZE)}... `);

    try {
      const tasks = await fetchBatch(batch);

      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        const { keyword, island } = batch[j];
        const items = task.result?.[0]?.items ?? [];
        const paaItems = items.filter(x => x.type === 'people_also_ask').flatMap(p => p.items ?? []);

        for (const q of paaItems) {
          if (!q.title) continue;
          const question = q.title.trim();
          const key = question.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          faqs.push({ question, island, slug: toSlug(question.replace(/\?$/, '')), sourceKeyword: keyword });
        }

        processed++;
      }
      console.log(`${faqs.length} unique questions so far`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }

    if (i + BATCH_SIZE < KEYWORDS.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`\n✅ Found ${faqs.length} unique PAA questions from ${processed} keywords`);

  const outPath = join(__dirname, 'paa-raw.json');
  writeFileSync(outPath, JSON.stringify(faqs, null, 2));
  console.log(`📄 Written to scripts/paa-raw.json`);

  // Summary by island
  const byIsland = {};
  for (const faq of faqs) {
    byIsland[faq.island] = (byIsland[faq.island] || 0) + 1;
  }
  console.log('\n📊 Questions by island:');
  for (const [island, count] of Object.entries(byIsland)) {
    console.log(`   ${island}: ${count}`);
  }
}

fetchPAA().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
