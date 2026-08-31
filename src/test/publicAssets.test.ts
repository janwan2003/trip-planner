import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
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

describe('_redirects', () => {
  const redirects = readFileSync(join(PUBLIC_DIR, '_redirects'), 'utf8');

  it('has no catch-all rewrite', () => {
    // `/* /index.html 200` answered every unknown path with a 200 and the home page's
    // head - an unbounded supply of soft 404s. Pages now falls through to 404.html.
    expect(redirects).not.toMatch(/^\/\*\s/m);
  });

  it('rewrites trip links to the empty shell, not to the prerendered landing page', () => {
    expect(redirects).toMatch(/^\/trip\/\*\s+\/trip-shell\s+200$/m);
  });

  it('names that target without the .html Pages strips', () => {
    // A `.html` target makes Pages 308 to the extensionless form instead of serving
    // the file, so the 200 rewrite silently becomes a redirect on every trip link.
    // Checked on the rule lines, since the comment above them has to name the spelling
    // it is warning about.
    const rules = redirects
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.trimStart().startsWith('#'));

    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule, `${rule} names a .html target`).not.toMatch(/\s\S*\.html\s/);
    }
  });

  it('301s www to the apex', () => {
    expect(redirects).toMatch(/www\.wegowhen\.com\/\*\s+https:\/\/wegowhen\.com\/:splat\s+301/);
  });
});

describe('_headers', () => {
  const headers = readFileSync(join(PUBLIC_DIR, '_headers'), 'utf8');

  it('caches content-hashed assets immutably', () => {
    // Every /assets URL carries a content hash, so revalidating it can only ever
    // confirm what the browser already has.
    expect(headers).toContain('/assets/*');
    expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
  });

  it('sends HSTS without committing subdomains that do not exist', () => {
    // Checked on the directive line rather than the file, which explains the omission
    // in a comment right above it.
    const hsts = headers
      .split('\n')
      .filter((line) => line.trim().startsWith('Strict-Transport-Security:'));

    expect(hsts).toHaveLength(1);
    expect(hsts[0]).toContain('max-age=31536000');
    expect(hsts[0]).not.toContain('includeSubDomains');
  });
});
