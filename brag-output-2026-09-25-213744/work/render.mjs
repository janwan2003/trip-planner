import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
const FPS = 30, DUR = 37;
const mode = process.argv[2] || 'stills';
const html = fs.readFileSync('comp.html', 'utf8').replace('__META__', fs.readFileSync('rec/log.json', 'utf8'));
fs.writeFileSync('comp.built.html', html);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + process.cwd() + '/comp.built.html');
await p.evaluate(() => window.ready);
const shot = async (t, type = 'png') => { await p.evaluate((t) => window.render(t), t); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); return p.screenshot({ type, quality: type === 'jpeg' ? 95 : undefined }); };
if (mode === 'stills') {
  fs.mkdirSync('stills', { recursive: true });
  const ts = process.argv.slice(3).map(Number);
  for (const t of ts) fs.writeFileSync(`stills/t${t.toFixed(2)}.png`, await shot(t));
} else {
  const ff = spawn('/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', 'video.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(FPS * DUR);
  for (let i = 0; i < N; i++) {
    const buf = await shot(i / FPS, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log('frame', i, '/', N);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await b.close();
