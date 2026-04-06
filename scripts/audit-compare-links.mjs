/**
 * Audits all compare page link generation vs static page generation.
 * Finds reversed URLs that would produce 404s.
 * Outputs redirect entries ready to paste into vercel.json.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const operators = JSON.parse(readFileSync(join(__dirname, "../operators.json"), "utf-8")).operators;

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// ── Canonical set: what getStaticPaths generates (i < j order) ───────────────
const canonicalSlugs = new Set();
for (let i = 0; i < operators.length; i++) {
  for (let j = i + 1; j < operators.length; j++) {
    const a = operators[i], b = operators[j];
    if (a.activity === b.activity && a.islands.some(isle => b.islands.includes(isle))) {
      canonicalSlugs.add(`${toSlug(a.name)}-vs-${toSlug(b.name)}`);
    }
  }
}

// ── Generated set: what operators/[slug].astro produces ─────────────────────
const brokenLinks = []; // { url, correctUrl, operatorPage }

for (const operator of operators) {
  const compareOps = operators.filter(op =>
    op.id !== operator.id &&
    op.activity === operator.activity &&
    op.islands.some(i => operator.islands.includes(i))
  ).slice(0, 5);

  for (const op of compareOps) {
    const generated = `${toSlug(operator.name)}-vs-${toSlug(op.name)}`;
    if (!canonicalSlugs.has(generated)) {
      // Find the correct canonical slug
      const correct = `${toSlug(op.name)}-vs-${toSlug(operator.name)}`;
      if (canonicalSlugs.has(correct)) {
        brokenLinks.push({
          operatorPage: `/operators/${toSlug(operator.name)}/`,
          brokenUrl: `/compare/${generated}/`,
          correctUrl: `/compare/${correct}/`,
        });
      }
    }
  }
}

// Deduplicate broken links
const seen = new Set();
const unique = brokenLinks.filter(l => {
  if (seen.has(l.brokenUrl)) return false;
  seen.add(l.brokenUrl);
  return true;
});

console.log(`\n📊 COMPARE LINK AUDIT`);
console.log(`  Canonical pages:  ${canonicalSlugs.size}`);
console.log(`  Broken 404 links: ${unique.length}`);

if (unique.length > 0) {
  console.log(`\n❌ BROKEN LINKS (reversed operator order):`);
  for (const l of unique) {
    console.log(`  Source:  ${l.operatorPage}`);
    console.log(`  Broken:  ${l.brokenUrl}`);
    console.log(`  Correct: ${l.correctUrl}`);
    console.log();
  }

  console.log(`\n📋 VERCEL REDIRECTS (paste into vercel.json "redirects" array):`);
  const redirects = unique.map(l => ({
    source: l.brokenUrl,
    destination: l.correctUrl,
    permanent: true,
  }));
  console.log(JSON.stringify(redirects, null, 2));
} else {
  console.log(`\n✅ No broken compare links found.`);
}
