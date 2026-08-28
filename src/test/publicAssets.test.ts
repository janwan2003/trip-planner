import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Everything in public/ is published and can be requested by a visitor, so its weight is
 * paid by the persona this product is built around: someone arriving cold from a link,
 * on a phone.
 *
 * This exists because two real regressions lived here. favicon.png shipped at 748 KB and
 * 1200x1200 to fill a 48px slot, and logo.png shipped at 794 KB while being requested by
 * nothing at all - it was only an input to scripts/generate-og-image.py, which is why it
 * now lives under scripts/assets/ instead.
 */
const PUBLIC_DIR = join(process.cwd(), 'public');
const MAX_KB = 200;

const filesInPublic = (): string[] =>
  readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

describe('published assets', () => {
  it('has files to check, so a broken path cannot make this pass vacuously', () => {
    expect(filesInPublic().length).toBeGreaterThan(3);
  });

  it.each(filesInPublic())('%s is under 200 KB', (name) => {
    const kb = statSync(join(PUBLIC_DIR, name)).size / 1024;
    expect(kb, `${name} is ${kb.toFixed(1)} KB`).toBeLessThan(MAX_KB);
  });

  it('does not publish the og-image generator input', () => {
    // It is a build input, not a runtime asset. Publishing it served 794 KB to nobody.
    expect(filesInPublic()).not.toContain('logo.png');
  });

  it('still publishes what the metadata and crawlers point at', () => {
    const files = filesInPublic();
    for (const required of ['favicon.png', 'favicon.ico', 'og-image.png', 'robots.txt']) {
      expect(files).toContain(required);
    }
  });
});
