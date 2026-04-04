/**
 * IndexNow auto-submission script
 * Run after each deploy: node scripts/indexnow.mjs
 * Pings Bing (and all IndexNow partners) with all site URLs
 */

const HOST = 'hawaiiscout.com';
const KEY = 'f87e9e31d325471da7f24104835f9dd7';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// All BOTF money pages to submit
const ISLANDS = ['oahu', 'maui', 'big-island', 'kauai'];
const ACTIVITIES = [
  'helicopter', 'luau', 'snorkeling', 'whale-watch', 'cultural',
  'land-tours', 'submarine', 'fishing', 'surfing', 'food-tours'
];

const urls = [
  `https://${HOST}/`,
  ...ISLANDS.map(i => `https://${HOST}/${i}/`),
  ...ISLANDS.flatMap(i =>
    ACTIVITIES.flatMap(a => [
      `https://${HOST}/best/${a}-${i}/`,
      `https://${HOST}/best/cheapest-${a}-${i}/`,
    ])
  ),
  ...ACTIVITIES.map(a => `https://${HOST}/best/${a}-hawaii/`),
];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

console.log(`Submitting ${urls.length} URLs to IndexNow...`);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

if (res.status === 200) {
  console.log(`✅ IndexNow accepted ${urls.length} URLs`);
} else if (res.status === 202) {
  console.log(`✅ IndexNow queued ${urls.length} URLs (202 Accepted)`);
} else {
  const body = await res.text();
  console.error(`❌ IndexNow error ${res.status}:`, body);
}
