/**
 * Fetch Microsoft Clarity analytics data via Data Export API.
 * Saves results to src/data/clarity.json.
 *
 * Rate limit: 10 calls/day max — do not run in loops.
 * Data window: last 3 days only (API limitation).
 *
 * Setup: add CLARITY_API_TOKEN=<your_token> to .env
 * Get token: Clarity dashboard → Settings → Data Export → Generate new API token
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency)
try {
  const envPath = join(__dirname, "../.env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {
  // .env not found — token must already be in environment
}

const token = process.env.CLARITY_API_TOKEN;
if (!token) {
  console.error(
    "Error: CLARITY_API_TOKEN not set.\n" +
    "1. Go to Clarity dashboard → Settings → Data Export\n" +
    "2. Click 'Generate new API token'\n" +
    "3. Add CLARITY_API_TOKEN=<token> to your .env file"
  );
  process.exit(1);
}

const PROJECT_ID = "w6n8ir65ol";
const BASE_URL = "https://www.clarity.ms/export-data/api/v1";

async function fetchInsights({ numOfDays = 3, dimensions = ["URL"] } = {}) {
  const params = new URLSearchParams({ numOfDays: String(numOfDays) });
  dimensions.forEach((dim, i) => params.set(`dimension${i + 1}`, dim));

  const url = `${BASE_URL}/project-live-insights?${params}`;

  console.log(`Fetching Clarity data (last ${numOfDays} days, dimensions: ${dimensions.join(", ")})...`);

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clarity API error ${res.status}: ${body}`);
  }

  return res.json();
}

async function main() {
  const [byUrl, byDevice, byCountry] = await Promise.all([
    fetchInsights({ numOfDays: 3, dimensions: ["URL"] }),
    fetchInsights({ numOfDays: 3, dimensions: ["Device"] }),
    fetchInsights({ numOfDays: 3, dimensions: ["Country"] }),
  ]);

  const output = {
    fetchedAt: new Date().toISOString(),
    projectId: PROJECT_ID,
    windowDays: 3,
    byUrl,
    byDevice,
    byCountry,
  };

  const outPath = join(__dirname, "../src/data/clarity.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Saved to src/data/clarity.json`);
  console.log(`  URLs tracked: ${byUrl?.data?.length ?? 0}`);
  console.log(`  Devices: ${byDevice?.data?.length ?? 0}`);
  console.log(`  Countries: ${byCountry?.data?.length ?? 0}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
