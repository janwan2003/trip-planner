import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:8788';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// 390 x 693 css at 3x: exactly a 1080x1920 frame once scaled by 0.923
const ctxOpts = { viewport: { width: 390, height: 693 }, deviceScaleFactor: 3, locale: 'en-US', timezoneId: 'Europe/Lisbon' };
const meta = { scale: 1080 / 390 };
const settle = (p) => p.evaluate(() => document.fonts.ready).then(() => p.waitForTimeout(800));
const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => `2027-06-${String(a + i).padStart(2, '0')}`);
const id = 'lisbon2027demo' + Date.now().toString(36);
meta.tripId = id;
let r = await fetch(BASE + '/api/trips', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, name: 'Lisbon 2027', startDate: '2027-06-01', endDate: '2027-06-30' }) });
if (!r.ok) throw new Error('create ' + r.status + await r.text());
const shell = await (await fetch(`${BASE}/trip/${id}`)).text();
const og = (k) => (shell.match(new RegExp(`<meta[^>]+property="og:${k}"[^>]+content="([^"]*)"`)) || [])[1];
meta.og = { title: og('title'), description: og('description'), image: og('image'), url: og('url') };

const friends = [
  ['Jess', range(10, 16)],
  ['Maya', range(5, 20)],
  ['Tom', [...range(1, 4), ...range(10, 18)]],
  ['Priya', [...range(8, 16), ...range(24, 30)]],
  ['Sam', [...range(3, 7), ...range(11, 15), ...range(26, 28)]],
];
const viewer = await (await b.newContext(ctxOpts)).newPage();
const heatY = async () => viewer.evaluate(() => {
  const h = [...document.querySelectorAll('h3,h2')].find((e) => e.textContent.trim() === 'Group Availability');
  return h.closest('.rounded-lg').getBoundingClientRect().top + window.scrollY - 70;
});
for (let k = 0; k < friends.length; k++) {
  const [n, d] = friends[k];
  r = await fetch(`${BASE}/api/trips/${id}/participants`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: n, availableDates: d }) });
  if (!r.ok) throw new Error(n + r.status);
  await viewer.goto(`${BASE}/trip/${id}`); await settle(viewer);
  const y = await heatY(); await viewer.evaluate((y) => window.scrollTo(0, y), y); await viewer.waitForTimeout(300);
  await viewer.screenshot({ path: `cap/m_heat_${k + 1}.png` });
}

// Leo opens the link and drags across his days
const p = await (await b.newContext(ctxOpts)).newPage();
await p.goto(`${BASE}/trip/${id}`); await settle(p);
await p.screenshot({ path: 'cap/m_join.png' });
await p.getByLabel('Your Name').fill('Leo');
await p.screenshot({ path: 'cap/m_join_name.png' });
await p.getByRole('button', { name: 'Mark my dates' }).click(); await settle(p);
const gridTop = await p.evaluate(() => document.querySelector('[data-date="2027-06-01"]').getBoundingClientRect().top + window.scrollY);
await p.evaluate((y) => window.scrollTo(0, y - 250), gridTop); await p.waitForTimeout(400);
await p.screenshot({ path: 'cap/m_drag_00.png' });
meta.cells = {};
for (let d = 1; d <= 30; d++) {
  const c = await p.locator(`[data-date="2027-06-${String(d).padStart(2, '0')}"]`).first().boundingBox();
  meta.cells[d] = { x: c.x + c.width / 2, y: c.y + c.height / 2 };
}
const days = [11, 12, 13, 14, 15, 16, 17, 18];
await p.mouse.move(meta.cells[11].x, meta.cells[11].y); await p.mouse.down(); await p.waitForTimeout(120);
await p.screenshot({ path: 'cap/m_drag_01.png' });
for (let i = 1; i < days.length; i++) {
  const c = meta.cells[days[i]];
  await p.mouse.move(c.x, c.y, { steps: 4 }); await p.waitForTimeout(120);
  await p.screenshot({ path: `cap/m_drag_${String(i + 1).padStart(2, '0')}.png` });
}
await p.mouse.up(); await p.mouse.move(385, 5); await p.waitForTimeout(300);
await p.screenshot({ path: 'cap/m_drag_final.png' });
await p.getByRole('button', { name: 'Save Availability' }).click(); await p.waitForTimeout(1500);

await viewer.goto(`${BASE}/trip/${id}`); await settle(viewer);
meta.heatY = await heatY();
await viewer.evaluate((y) => window.scrollTo(0, y), meta.heatY); await viewer.waitForTimeout(300);
await viewer.screenshot({ path: 'cap/m_heat_6.png' });
meta.bestY = await viewer.evaluate(() => {
  const s = [...document.querySelectorAll('span')].find((e) => e.textContent.trim() === 'Best Dates');
  return s.closest('.rounded-lg').getBoundingClientRect().top + window.scrollY - 70;
});
await viewer.evaluate(() => window.scrollTo(0, 0)); await viewer.waitForTimeout(200);
await viewer.screenshot({ path: 'cap/m_full.png', fullPage: true });
meta.fullHeight = await viewer.evaluate(() => document.documentElement.scrollHeight);
await viewer.evaluate((y) => window.scrollTo(0, y), meta.bestY); await viewer.waitForTimeout(300);
await viewer.screenshot({ path: 'cap/m_best.png' });
fs.writeFileSync('cap/meta.json', JSON.stringify(meta, null, 1));
await b.close();
console.log(JSON.stringify(meta.og), meta.heatY, meta.bestY, meta.fullHeight);
