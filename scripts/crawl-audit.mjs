/**
 * Site crawl audit — mimics Screaming Frog's Internal:All report.
 * Fetches every URL from the sitemap and checks:
 *   - Status code
 *   - Title tag (presence, length)
 *   - Meta description (presence, length)
 *   - H1 (presence, count)
 *   - Canonical tag
 *   - Meta robots (noindex/nofollow)
 *   - Indexability verdict
 *
 * Output: src/data/crawl-audit.json + console summary
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 10;

// ── Parse sitemap ────────────────────────────────────────────────────────────

async function getSitemapUrls() {
  const res = await fetch("https://hawaiiscout.com/sitemap-0.xml");
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
  return urls;
}

// ── Extract SEO signals from HTML ────────────────────────────────────────────

function extract(html, url) {
  const title = html.match(/<title[^>]*>(.*?)<\/title>/si)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  // Use [^"]* not [^"']* — apostrophes in content must not terminate match
  const metaDesc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]
    ?? html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i)?.[1]
    ?? null;
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i)?.[1]
    ?? null;
  const robotsMeta = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? null;
  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gsi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());

  const noindex = robotsMeta?.includes("noindex") ?? false;
  const nofollow = robotsMeta?.includes("nofollow") ?? false;
  const canonicalSelf = !canonical || canonical === url || canonical === url.replace(/\/$/, "") + "/";

  const issues = [];
  if (!title) issues.push("missing_title");
  else if (title.length < 10) issues.push("title_too_short");
  else if (title.length > 60) issues.push("title_too_long");

  if (!metaDesc) issues.push("missing_meta_desc");
  else if (metaDesc.length < 50) issues.push("meta_desc_too_short");
  else if (metaDesc.length > 160) issues.push("meta_desc_too_long");

  if (h1s.length === 0) issues.push("missing_h1");
  else if (h1s.length > 1) issues.push("multiple_h1");

  if (noindex) issues.push("noindex");
  if (!canonicalSelf) issues.push("canonical_mismatch");

  const indexable = !noindex && canonicalSelf;

  return {
    title,
    titleLength: title?.length ?? 0,
    metaDesc,
    metaDescLength: metaDesc?.length ?? 0,
    h1: h1s[0] ?? null,
    h1Count: h1s.length,
    canonical,
    canonicalSelf,
    robotsMeta,
    noindex,
    nofollow,
    indexable,
    issues,
  };
}

// ── Crawl one URL ─────────────────────────────────────────────────────────────

async function crawlUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HawaiiScoutAudit/1.0)" },
      redirect: "manual",
    });
    const statusCode = res.status;
    const isRedirect = statusCode >= 300 && statusCode < 400;
    const redirectTo = isRedirect ? res.headers.get("location") : null;

    if (statusCode !== 200) {
      return { url, statusCode, redirectTo, indexable: false, issues: [`status_${statusCode}`] };
    }

    const html = await res.text();
    const seo = extract(html, url);
    return { url, statusCode, redirectTo, ...seo };
  } catch (err) {
    return { url, statusCode: 0, error: err.message, indexable: false, issues: ["fetch_error"] };
  }
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function crawlAll(urls) {
  const results = [];
  let i = 0;
  let done = 0;

  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      process.stdout.write(`\r  Crawling ${++done}/${urls.length} — ${url.replace("https://hawaiiscout.com", "")}          `);
      results.push(await crawlUrl(url));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching sitemap...");
  const urls = await getSitemapUrls();
  console.log(`Found ${urls.length} URLs. Crawling at ${CONCURRENCY} concurrent...`);

  const results = await crawlAll(urls);

  // Summary
  const indexable   = results.filter(r => r.indexable);
  const nonIndexable = results.filter(r => !r.indexable);
  const withIssues  = results.filter(r => r.issues?.length > 0);

  const issueCounts = {};
  for (const r of results) {
    for (const issue of r.issues ?? []) {
      issueCounts[issue] = (issueCounts[issue] ?? 0) + 1;
    }
  }

  console.log(`\n📊 CRAWL SUMMARY`);
  console.log(`  Total URLs:      ${results.length}`);
  console.log(`  Indexable:       ${indexable.length}`);
  console.log(`  Non-indexable:   ${nonIndexable.length}`);
  console.log(`  Pages w/ issues: ${withIssues.length}`);
  console.log(`\n🚨 ISSUE BREAKDOWN:`);
  for (const [issue, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${issue.padEnd(25)} ${count}`);
  }

  if (nonIndexable.length > 0) {
    console.log(`\n❌ NON-INDEXABLE PAGES:`);
    for (const r of nonIndexable) {
      console.log(`  [${r.statusCode}] ${r.url}`);
      if (r.redirectTo) console.log(`       → ${r.redirectTo}`);
      if (r.issues?.length) console.log(`       issues: ${r.issues.join(", ")}`);
    }
  }

  const output = {
    crawledAt: new Date().toISOString(),
    totalUrls: results.length,
    indexableCount: indexable.length,
    nonIndexableCount: nonIndexable.length,
    issueCounts,
    results,
  };

  const outPath = join(__dirname, "../src/data/crawl-audit.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nFull report saved to src/data/crawl-audit.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
