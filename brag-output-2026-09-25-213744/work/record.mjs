import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:8788';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({
  viewport: { width: 390, height: 693 }, deviceScaleFactor: 3, locale: 'en-US', timezoneId: 'Europe/Lisbon',
});
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
// A "show touches" dot, the way a phone screen recording can show taps.
await ctx.addInitScript(() => {
  addEventListener('DOMContentLoaded', () => {
    const d = document.createElement('div');
    Object.assign(d.style, { position: 'fixed', width: '38px', height: '38px', margin: '-19px 0 0 -19px', borderRadius: '50%',
      background: 'rgba(90,90,96,.42)', border: '1.5px solid rgba(255,255,255,.8)', pointerEvents: 'none', zIndex: 2147483647,
      opacity: 0, transition: 'opacity .12s' });
    document.documentElement.appendChild(d);
    const at = (e) => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; };
    addEventListener('mousedown', (e) => { at(e); d.style.opacity = 1; }, true);
    addEventListener('mousemove', (e) => { at(e); }, true);
    addEventListener('mouseup', () => { setTimeout(() => (d.style.opacity = 0), 90); }, true);
  });
});
const p = await ctx.newPage();
fs.mkdirSync('rec/frames', { recursive: true });
const cdp = await ctx.newCDPSession(p);
const frames = [];
cdp.on('Page.screencastFrame', async (f) => {
  const n = frames.length;
  fs.writeFileSync(`rec/frames/${String(n).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64'));
  frames.push([n, f.metadata.timestamp]);
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1170, maxHeight: 2079, everyNthFrame: 1 });
const T0 = Date.now();
const log = [];
const mark = (name) => { log.push([name, (Date.now() - T0) / 1000]); console.log(name, ((Date.now() - T0) / 1000).toFixed(2)); };
const wait = (ms) => p.waitForTimeout(ms);
const rnd = (a, z) => a + Math.random() * (z - a);
async function tap(loc, hold = 90) {
  let bb = await loc.boundingBox();
  if (bb.y + bb.height > 693 - 40 || bb.y < 60) { await scroll(bb.y - 693 * 0.55, 14); await wait(350); bb = await loc.boundingBox(); }
  const x = bb.x + bb.width * rnd(0.4, 0.6), y = bb.y + bb.height * rnd(0.4, 0.6);
  await p.mouse.move(x, y); await p.mouse.down(); await wait(hold); await p.mouse.up();
}
async function type(text) {
  for (const ch of text) { await p.keyboard.type(ch); await wait(rnd(70, 190)); }
}
async function scroll(dy, steps = 14) {
  for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, dy / steps); await wait(28); }
}

await p.goto(BASE + '/'); await p.evaluate(() => document.fonts.ready); await wait(900);
mark('home');
await wait(1400);
await tap(p.getByLabel('Trip Name')); await wait(500);
mark('type');
await type('Lisbno'); await wait(350);
await p.keyboard.press('Backspace'); await wait(160); await p.keyboard.press('Backspace'); await wait(260);
await type('on in november'); await wait(700);
mark('dates');
await tap(p.getByRole('button', { name: /start date/i })); await wait(900);
await tap(p.getByRole('button', { name: 'Go to the Next Month' })); await wait(600);
await tap(p.getByRole('button', { name: 'Go to the Next Month' })); await wait(700);
await tap(p.locator('[role=dialog] button[aria-label*="November 1st"]:not([disabled])').first()); await wait(900);
await tap(p.getByRole('button', { name: /end date/i })); await wait(900);
await tap(p.locator('[role=dialog] button[aria-label*="November 30th"]:not([disabled])').first()); await wait(900);
mark('create');
await tap(p.getByRole('button', { name: 'Create Trip' }));
await p.waitForURL(/\/trip\//); await p.evaluate(() => document.fonts.ready);
mark('trip');
const tripId = p.url().split('/trip/')[1];
await wait(1500);
mark('share');
await tap(p.getByRole('button', { name: /^share/i })); await wait(2400);
mark('join');
await tap(p.getByLabel('Your Name')); await wait(300);
await type('Jess'); await wait(500);
await tap(p.getByRole('button', { name: 'Mark my dates' })); await wait(1200);
const cell = async (d) => { const c = await p.locator(`[data-date="2026-11-${String(d).padStart(2, '0')}"]`).first().boundingBox(); return [c.x + c.width / 2, c.y + c.height / 2]; };
const top = await p.evaluate(() => document.querySelector('[data-date="2026-11-01"]').getBoundingClientRect().top);
await scroll(top - 230, 18); await wait(700);
mark('drag');
let [x, y] = await cell(12);
await p.mouse.move(x, y); await p.mouse.down(); await wait(220);
for (const d of [13, 14, 15, 16, 17, 18]) { [x, y] = await cell(d); await p.mouse.move(x, y, { steps: 9 }); await wait(rnd(90, 160)); }
await wait(200); await p.mouse.up(); await wait(900);
mark('tapday');
[x, y] = await cell(21); await p.mouse.move(x, y); await p.mouse.down(); await wait(90); await p.mouse.up(); await wait(900);
await scroll(260, 12); await wait(500);
mark('save');
await tap(p.getByRole('button', { name: 'Save Availability' })); await wait(2200);
mark('cut');

// "a few days later": friends have answered
const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => `2026-11-${String(a + i).padStart(2, '0')}`);
const friends = [
  ['Maya', range(6, 22)], ['Tom', [...range(2, 5), ...range(11, 19)]], ['Priya', [...range(9, 17), ...range(25, 30)]],
  ['Leo', range(12, 23)], ['Sam', [...range(4, 8), ...range(12, 16), ...range(27, 29)]],
];
for (const [n, d] of friends) {
  const r = await fetch(`${BASE}/api/trips/${tripId}/participants`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: n, availableDates: d }) });
  if (!r.ok) throw new Error(n + r.status);
}
await p.evaluate(() => window.scrollTo(0, 0));
await p.reload(); await p.evaluate(() => document.fonts.ready); await wait(700);
mark('later');
await wait(1200);
const back = p.getByRole('button', { name: /back to trip view/i });
if (await back.count()) { await tap(back); await wait(1000); }
mark('group');
const bestTop = await p.evaluate(() => { const s = [...document.querySelectorAll('span')].find((e) => e.textContent.trim() === 'Best Dates'); return s.closest('.rounded-lg').getBoundingClientRect().top; });
await scroll(bestTop - 150, 24); await wait(2800);
mark('best');
const heatTop = await p.evaluate(() => { const h = [...document.querySelectorAll('h3,h2')].find((e) => e.textContent.trim() === 'Group Availability'); return h.closest('.rounded-lg').getBoundingClientRect().top; });
await scroll(heatTop - 60, 26); await wait(2600);
mark('heat');
mark('end');
await cdp.send('Page.stopScreencast');
fs.writeFileSync('rec/log.json', JSON.stringify({ tripId, T0: T0 / 1000, log, frames }, null, 1));
await ctx.close(); await b.close();
console.log('saved');
