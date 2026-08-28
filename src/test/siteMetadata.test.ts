import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The share card and the structured data live in static HTML rather than in
 * React, because the crawlers and link unfurlers that consume them do not run
 * JavaScript. Nothing in the app exercises them, so they are tested here: a
 * silently broken og:image is invisible until someone pastes the link into a
 * group chat and gets a bare URL.
 */

const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const meta = (attr: 'property' | 'name', key: string): string | undefined => {
  const match = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
  return match?.[1];
};

/** Width and height out of a PNG's IHDR chunk, which starts at byte 16. */
const pngSize = (path: string): { width: number; height: number } => {
  const buf = readFileSync(path);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

describe('index.html share metadata', () => {
  it('points og:image and twitter:image at an absolute URL', () => {
    // Relative paths are silently dropped by most unfurlers, including WhatsApp.
    expect(meta('property', 'og:image')).toBe('https://wegowhen.com/og-image.png');
    expect(meta('name', 'twitter:image')).toBe('https://wegowhen.com/og-image.png');
  });

  it('ships the share card at the dimensions it declares', () => {
    const declared = {
      width: Number(meta('property', 'og:image:width')),
      height: Number(meta('property', 'og:image:height')),
    };
    expect(declared).toEqual({ width: 1200, height: 630 });
    expect(pngSize(resolve(root, 'public/og-image.png'))).toEqual(declared);
  });

  it('describes the card for people using a screen reader', () => {
    expect(meta('property', 'og:image:alt')?.length).toBeGreaterThan(20);
    expect(meta('name', 'twitter:image:alt')?.length).toBeGreaterThan(20);
  });

  it('keeps the title and description inside what search engines render', () => {
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    expect(title).toContain('WeGoWhen');
    expect(title.length).toBeLessThanOrEqual(65);

    const description = meta('name', 'description') ?? '';
    expect(description.length).toBeGreaterThan(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('declares a canonical URL', () => {
    expect(html).toContain('<link rel="canonical" href="https://wegowhen.com/" />');
  });
});

describe('index.html structured data', () => {
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];

  it('is valid JSON-LD for a web application', () => {
    expect(json).toBeDefined();
    const data = JSON.parse(json!);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebApplication');
    expect(data.url).toBe('https://wegowhen.com/');
    expect(data.featureList.length).toBeGreaterThan(2);
  });

  it('claims no ratings or review counts', () => {
    // There are no users and no reviews yet. Inventing either would be a lie and
    // a structured-data violation; this test is what keeps it out.
    const data = JSON.parse(json!);
    expect(data.aggregateRating).toBeUndefined();
    expect(data.review).toBeUndefined();
  });
});

describe('reciprocal launch-directory badges', () => {
  // OpenHunts and Fazier verify the badge by fetching this file, not by running
  // the app, so these links have to be in the served HTML. They were in React
  // first, which meant curl saw nothing and verification failed.
  it('are in the served HTML, outside #root', () => {
    const body = html.slice(html.indexOf('<div id="root">'));
    expect(body).toContain('https://openhunts.com');
    expect(body).toContain('https://cdn.openhunts.com/badges/club.webp');
    expect(body).toContain('https://fazier.com');
    expect(body).toContain('https://fazier.com/api/v1/public/badges/launch_badges.svg');
  });

  it('are lazy and carry intrinsic dimensions, so they cannot shift layout', () => {
    const badges = html.match(/<img src="https:\/\/(?:cdn\.openhunts\.com|fazier\.com)[^>]*>/g) ?? [];
    expect(badges).toHaveLength(2);
    for (const img of badges) {
      expect(img).toContain('loading="lazy"');
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });
});
