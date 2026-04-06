/**
 * Hawaii Scout — FAQ Answer Generator
 *
 * Reads scripts/paa-raw.json (PAA questions from DataForSEO),
 * generates 120-word answers using claude -p, assigns BOTF internal links,
 * and outputs src/data/faqs.json.
 *
 * Usage: node scripts/generate-faqs.mjs
 * Requires: paa-raw.json to exist (run fetch-paa.mjs first)
 *
 * Output: src/data/faqs.json
 *   [{ question, island, slug, answer, links: [{text, href}] }]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PAA_PATH = join(__dirname, 'paa-raw.json');
const OUT_PATH = join(ROOT, 'src/data/faqs.json');
const BATCH_SIZE = 12;

if (!existsSync(PAA_PATH)) {
  console.error('❌ scripts/paa-raw.json not found. Run fetch-paa.mjs first.');
  process.exit(1);
}

const questions = JSON.parse(readFileSync(PAA_PATH, 'utf8'));
console.log(`📋 Loaded ${questions.length} PAA questions from paa-raw.json`);

const SYSTEM_PROMPT = `You are an expert Hawaii travel writer for hawaiiscout.com.
Write factual, specific 120-word answers to Hawaii tour and activity questions.
Rules:
- Exactly 120 words per answer (count carefully)
- Be specific: mention operator names, prices, scores where relevant
- Direct, confident tone — no filler phrases
- No markdown — plain paragraphs only

Hawaii context:
- Helicopter: Blue Hawaiian ($379-719 all islands), Jack Harter (Kauai doors-off $364), Maverick (Maui/Kauai $229), Magnum (Oahu $380)
- Snorkeling: Pride of Maui ($115-241), Four Winds (Maui $80), Fair Wind (Big Island $117), Capt Andy's (Kauai $229)
- Luau: Chief's Luau (Oahu $130-220), Smith's (Kauai $105), Voyagers (Big Island $169)
- Whale watch: Pacific Whale Foundation (Maui $90-170, Dec-Apr peak)
- Surfing: Hans Hedemann (Oahu $75), North Shore Surf (Oahu $100)
- NOTE: Old Lahaina Luau, Feast at Lele, Paradise Cove all closed — do NOT recommend these.`;

function labelIsland(island) {
  const map = { oahu: 'Oahu', maui: 'Maui', 'big-island': 'Big Island', kauai: 'Kauai' };
  return map[island] ?? island;
}

// BOTF link assignment based on question topic
const LINK_RULES = [
  { keywords: ['helicopter', 'air tour', 'aerial'], links: (i) => [
    { text: `Best Helicopter Tours in ${labelIsland(i)}`, href: `/best/helicopter-${i}/` },
    { text: 'Blue Hawaiian Helicopters Reviews', href: '/operators/blue-hawaiian-helicopters/' },
  ]},
  { keywords: ['snorkel', 'reef', 'underwater', 'coral', 'molokini', 'hanauma'], links: (i) => [
    { text: `Best Snorkeling in ${labelIsland(i)}`, href: `/best/snorkeling-${i}/` },
    { text: `${labelIsland(i)} Snorkeling Tours — Ranked`, href: `/best/snorkeling-${i}/` },
  ]},
  { keywords: ['luau', 'polynesian', 'hawaiian show', 'cultural show'], links: (i) => [
    { text: `Best Luau Shows in ${labelIsland(i)}`, href: `/best/luau-${i}/` },
    { text: `${labelIsland(i)} Tours`, href: `/${i}/` },
  ]},
  { keywords: ['whale', 'whale watch'], links: (i) => [
    { text: `Best Whale Watching in ${labelIsland(i)}`, href: `/best/whale-watch-${i}/` },
    { text: 'Pacific Whale Foundation Reviews', href: '/operators/pacific-whale-foundation/' },
  ]},
  { keywords: ['surf', 'surfing', 'surf lesson'], links: (i) => [
    { text: `Best Surf Lessons in ${labelIsland(i)}`, href: `/best/surfing-${i}/` },
    { text: `${labelIsland(i)} Tours`, href: `/${i}/` },
  ]},
  { keywords: ['fish', 'fishing', 'fishing charter'], links: (i) => [
    { text: `Best Fishing Charters in ${labelIsland(i)}`, href: `/best/fishing-${i}/` },
    { text: `${labelIsland(i)} Tours`, href: `/${i}/` },
  ]},
  { keywords: ['volcano', 'hiking', 'haleakala', 'waimea', 'atv', 'zipline', 'ranch'], links: (i) => [
    { text: `Best Land Tours in ${labelIsland(i)}`, href: `/best/land-tours-${i}/` },
    { text: `Things to Do in ${labelIsland(i)}`, href: `/${i}/` },
  ]},
];

function assignLinks(question, island) {
  const q = question.toLowerCase();
  for (const rule of LINK_RULES) {
    if (rule.keywords.some(kw => q.includes(kw))) {
      const links = rule.links(island);
      if (links.length < 2) links.push({ text: `All ${labelIsland(island)} Tours`, href: `/${island}/` });
      return links.slice(0, 3);
    }
  }
  return [
    { text: `Things to Do in ${labelIsland(island)}`, href: `/${island}/` },
    { text: `Best Tours in ${labelIsland(island)}`, href: `/${island}/` },
  ];
}

async function generateBatch(batch) {
  const userPrompt = `Generate answers for these ${batch.length} FAQ questions.
Return ONLY a valid JSON array, no markdown, no code fences.

Format: [{"slug": "slug-here", "answer": "120-word answer here"}, ...]

Questions:
${batch.map(q => `- slug: "${q.slug}" | island: ${q.island} | question: "${q.question}"`).join('\n')}`;

  // Write prompts to temp files to avoid shell length limits
  const promptFile = '/tmp/hs-faq-prompt.txt';
  writeFileSync(promptFile, `${SYSTEM_PROMPT}\n\n${userPrompt}`, 'utf8');

  const raw = execSync(
    `cat ${promptFile} | claude -p --output-format json --bare 2>/dev/null`,
    { maxBuffer: 5 * 1024 * 1024, timeout: 90000 }
  ).toString().trim();

  const outer = JSON.parse(raw);
  const resultText = outer.result ?? outer;

  // Extract JSON array from result (may have surrounding text)
  const match = String(resultText).match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in response');

  return JSON.parse(match[0]);
}

async function main() {
  const allAnswers = [];

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    console.log(`\n🤖 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} (${batch.length} questions)...`);

    try {
      const answers = await generateBatch(batch);
      allAnswers.push(...answers);
      console.log(`   ✅ Got ${answers.length} answers`);
    } catch (err) {
      console.error(`   ❌ Batch failed: ${err.message}`);
      // Add placeholder answers for failed batch
      for (const q of batch) {
        allAnswers.push({ slug: q.slug, answer: q.question });
      }
    }
  }

  // Build answer lookup by slug
  const answerMap = new Map(allAnswers.map(a => [a.slug, a.answer]));

  // Assemble final FAQ objects
  const faqs = questions.map(q => ({
    question: q.question,
    island: q.island,
    slug: q.slug,
    answer: answerMap.get(q.slug) ?? q.question,
    links: assignLinks(q.question, q.island),
  }));

  writeFileSync(OUT_PATH, JSON.stringify(faqs, null, 2));
  console.log(`\n📄 Written ${faqs.length} FAQs to src/data/faqs.json`);

  const byIsland = {};
  for (const faq of faqs) byIsland[faq.island] = (byIsland[faq.island] || 0) + 1;
  console.log('\n📊 FAQs by island:');
  for (const [island, count] of Object.entries(byIsland)) {
    console.log(`   ${island}: ${count} → /${island}-faq/`);
  }
  console.log('\n✅ Done. Run `npm run build` to generate FAQ pages.');
}

main().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
