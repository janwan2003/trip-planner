import { describe, expect, it, vi } from 'vitest';

import { applyLegacyHashRedirect, pathFromLegacyHash } from './legacyHashRoute';

/**
 * Links shared while the app used HashRouter are the ones most likely to be sitting in
 * a group chat right now. If this mapping is wrong, those trips become unreachable —
 * and possession of the link is the only credential the product has.
 */
describe('pathFromLegacyHash', () => {
  it('turns a legacy trip link into its path form', () => {
    expect(pathFromLegacyHash('#/trip/abc123')).toBe('/trip/abc123');
  });

  it('handles the content pages too', () => {
    expect(pathFromLegacyHash('#/about')).toBe('/about');
    expect(pathFromLegacyHash('#/')).toBe('/');
  });

  it('keeps a query string that came before the hash', () => {
    expect(pathFromLegacyHash('#/trip/abc', '?utm_source=whatsapp')).toBe(
      '/trip/abc?utm_source=whatsapp',
    );
  });

  it('prefers the query inside the hash, which is the more specific of the two', () => {
    expect(pathFromLegacyHash('#/trip/abc?name=Ada', '?utm_source=x')).toBe('/trip/abc?name=Ada');
  });

  it('leaves a path-form URL alone', () => {
    expect(pathFromLegacyHash('')).toBeNull();
    expect(pathFromLegacyHash('#section')).toBeNull();
    expect(pathFromLegacyHash('#')).toBeNull();
  });
});

describe('applyLegacyHashRedirect', () => {
  it('replaces the history entry so the hash URL never lingers in the address bar', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    applyLegacyHashRedirect({ hash: '#/trip/xyz', search: '' } as Location);

    expect(replaceState).toHaveBeenCalledWith(null, '', '/trip/xyz');
    replaceState.mockRestore();
  });

  it('does nothing when there is no legacy hash', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    applyLegacyHashRedirect({ hash: '', search: '?a=1' } as Location);

    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});
