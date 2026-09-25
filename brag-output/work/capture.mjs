import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:8788';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctxOpts = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-US', timezoneId: 'Europe/Lisbon' };
const meta = {};
const settle = (p) => p.evaluate(() => document.fonts.ready).then(() => p.waitForTimeout(700));
const card = (p, title) => p.locator('div.rounded-lg.bg-card', { has: p.getByRole('heading', { name: title, exact: true }) }).last();

// 1. Home + form
const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage();
await p.goto(BASE + '/'); await settle(p);
await p.screenshot({ path: 'cap/home.png' });
const form = card(p, 'Plan Your Trip');
meta.formBox = await form.boundingBox();
const name = 'Lisbon, June 2027';
const input = p.getByLabel('Trip Name');
await input.click();
await form.screenshot({ path: 'cap/form_00.png' });
for (let i = 1; i <= name.length; i++) {
  await input.pressSequentially(name[i - 1]);
  await p.waitForTimeout(60);
  await form.screenshot({ path: `cap/form_${String(i).padStart(2, '0')}.png` });
}
async function pick(label, day, months) {
  await p.getByRole('button', { name: label }).click(); await p.waitForTimeout(400);
  for (let i = 0; i < months; i++) { await p.getByRole('button', { name: 'Go to the Next Month' }).click(); await p.waitForTimeout(60); }
  await p.locator(`[role=dialog] button[aria-label*="June ${day}"][aria-label*="2027"]:not([disabled])`).first().click();
  await p.waitForTimeout(400);
}
await pick(/start date/i, 1, 9);
await form.screenshot({ path: 'cap/form_start.png' });
await pick(/end date/i, 30, 0);
await p.mouse.move(0, 0); await p.waitForTimeout(300);
await form.screenshot({ path: 'cap/form_end.png' });
const btn = p.getByRole('button', { name: 'Create Trip' });
const bb = await btn.boundingBox();
meta.createBtn = { x: bb.x - meta.formBox.x + bb.width / 2, y: bb.y - meta.formBox.y + bb.height / 2 };
await btn.click();
await p.waitForURL(/\/trip\//); await settle(p);
const tripId = p.url().split('/trip/')[1];
meta.tripId = tripId;
await p.screenshot({ path: 'cap/trip-empty.png', fullPage: true });

// 2. Seed friends one by one, screenshot the group heat map each time
const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => `2027-06-${String(a + i).padStart(2, '0')}`);
const friends = [
  ['Maya', range(5, 20)],
  ['Tom', [...range(1, 4), ...range(10, 18)]],
  ['Priya', [...range(8, 16), ...range(24, 30)]],
  ['Leo', range(11, 22)],
  ['Sam', [...range(3, 7), ...range(11, 15), ...range(26, 28)]],
];
const viewer = await b.newContext(ctxOpts); const v = await viewer.newPage();
for (let k = 0; k < friends.length; k++) {
  const [n, d] = friends[k];
  const r = await fetch(`${BASE}/api/trips/${tripId}/participants`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: n, availableDates: d }) });
  if (!r.ok) throw new Error(n + ' ' + r.status + ' ' + await r.text());
  await v.goto(`${BASE}/trip/${tripId}`); await settle(v);
  await card(v, 'Group Availability').screenshot({ path: `cap/heat_${k + 1}.png` });
}
await v.screenshot({ path: 'cap/trip-5.png', fullPage: true });

// 3. Jess joins and drags June 10 -> 16 on the real calendar
await p.reload(); await settle(p);
await p.getByLabel('Your Name').fill('Jess');
await p.getByRole('button', { name: 'Mark my dates' }).click(); await settle(p);
const mark = card(p, 'Mark Your Availability');
await mark.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
const mb = await mark.boundingBox(); meta.markBox = mb;
await mark.screenshot({ path: 'cap/drag_00.png' });
meta.cells = {};
for (let d = 1; d <= 30; d++) {
  const c = await p.locator(`[data-date="2027-06-${String(d).padStart(2, '0')}"]`).first().boundingBox();
  meta.cells[d] = { x: c.x - mb.x + c.width / 2, y: c.y - mb.y + c.height / 2, w: c.width, h: c.height };
}
const cellPt = async (d) => { const c = await p.locator(`[data-date="2027-06-${String(d).padStart(2, '0')}"]`).first().boundingBox(); return [c.x + c.width / 2, c.y + c.height / 2]; };
let [x, y] = await cellPt(10);
await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(120);
await mark.screenshot({ path: 'cap/drag_01.png' });
for (let d = 11, i = 2; d <= 16; d++, i++) {
  [x, y] = await cellPt(d);
  await p.mouse.move(x, y, { steps: 4 }); await p.waitForTimeout(120);
  await mark.screenshot({ path: `cap/drag_${String(i).padStart(2, '0')}.png` });
}
await p.mouse.up(); await p.waitForTimeout(200);
await p.mouse.move(0, 0); await p.waitForTimeout(300);
await mark.screenshot({ path: 'cap/drag_final.png' });
await p.getByRole('button', { name: 'Save Availability' }).click();
await p.waitForTimeout(1500); await settle(p);

// 4. Group view with all six, and Best Dates
await v.goto(`${BASE}/trip/${tripId}`); await settle(v);
await card(v, 'Group Availability').screenshot({ path: 'cap/heat_6.png' });
await v.locator('div.rounded-lg.bg-card', { has: v.getByText('Best Dates', { exact: true }) }).last().screenshot({ path: 'cap/best.png' });
await v.screenshot({ path: 'cap/trip-6.png', fullPage: true });
fs.writeFileSync('cap/meta.json', JSON.stringify(meta, null, 1));
await b.close();
console.log('trip', tripId);
