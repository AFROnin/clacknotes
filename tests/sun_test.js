// Checks for web/sun.js; run with `node tests/sun_test.js` (tests/test_sync.py runs it too).
// Expected times come from the astral Python library, an independent implementation.
const assert = require("node:assert/strict");
const path = require("node:path");
const { sunTimes } = require(path.join(__dirname, "..", "web", "sun.js"));

const TOLERANCE_MS = 60 * 1000;

const cases = [
  // Day after the switch back from summer time.
  { name: "Berlin, autumn", tz: "Europe/Berlin", day: [2026, 10, 27], lat: 52.52, lon: 13.405,
    sunrise: "2026-10-27T06:53:35+01:00", sunset: "2026-10-27T16:46:03+01:00" },
  { name: "Berlin, midsummer", tz: "Europe/Berlin", day: [2026, 6, 21], lat: 52.52, lon: 13.405,
    sunrise: "2026-06-21T04:43:29+02:00", sunset: "2026-06-21T21:32:55+02:00" },
  { name: "Sydney, southern summer", tz: "Australia/Sydney", day: [2026, 1, 15], lat: -33.87, lon: 151.21,
    sunrise: "2026-01-15T05:59:44+11:00", sunset: "2026-01-15T20:08:46+11:00" },
  { name: "New York, day of the switch to summer time", tz: "America/New_York", day: [2026, 3, 8], lat: 40.71, lon: -74.01,
    sunrise: "2026-03-08T07:19:07-04:00", sunset: "2026-03-08T18:55:00-04:00" },
  { name: "Quito, equator", tz: "America/Guayaquil", day: [2026, 9, 1], lat: -0.18, lon: -78.47,
    sunrise: "2026-09-01T06:10:50-05:00", sunset: "2026-09-01T18:16:50-05:00" },
  { name: "Tromsø, midnight sun", tz: "Europe/Oslo", day: [2026, 6, 21], lat: 69.65, lon: 18.96, polar: "day" },
  { name: "Tromsø, polar night", tz: "Europe/Oslo", day: [2026, 12, 21], lat: 69.65, lon: 18.96, polar: "night" },
];

for (const item of cases) {
  // Node re-reads TZ when it changes, so `new Date(y, m, d)` below is that city's local day.
  process.env.TZ = item.tz;
  const [year, month, day] = item.day;
  const result = sunTimes(new Date(year, month - 1, day, 9, 30), item.lat, item.lon);
  if (item.polar) {
    assert.deepEqual(result, { sunrise: null, sunset: null, polar: item.polar }, item.name);
    continue;
  }
  assert.equal(result.polar, null, item.name);
  for (const key of ["sunrise", "sunset"]) {
    const off = Math.abs(result[key] - new Date(item[key]));
    assert.ok(off <= TOLERANCE_MS, `${item.name}: ${key} ${result[key].toISOString()} is ${Math.round(off / 1000)} s off`);
  }
}

console.log(`sunTimes: ${cases.length} checks passed`);
