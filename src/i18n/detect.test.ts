import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCALE_STORAGE_KEY, detectLocale, formattingTag, persistLocale } from './detect';

const setLanguages = (languages: string[]) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(languages[0] ?? '');
};

describe('detectLocale', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('uses the first browser language we ship', () => {
    setLanguages(['fr-FR', 'nl-NL', 'en-US']);
    expect(detectLocale()).toBe('nl');
  });

  it('treats a regional tag as its language', () => {
    setLanguages(['de-AT']);
    expect(detectLocale()).toBe('de');
    setLanguages(['es-PY']);
    expect(detectLocale()).toBe('es');
    setLanguages(['pl-PL']);
    expect(detectLocale()).toBe('pl');
  });

  it('falls back to English when nothing matches', () => {
    setLanguages(['vi-VN', 'ko-KR']);
    expect(detectLocale()).toBe('en');
  });

  it('prefers a choice made in the switcher over the browser', () => {
    setLanguages(['en-US']);
    persistLocale('nl');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
    expect(detectLocale()).toBe('nl');
  });

  it('ignores a stored value that is not a language we ship', () => {
    setLanguages(['de-DE']);
    localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    expect(detectLocale()).toBe('de');
  });

  it('survives storage that throws, as Safari private mode and blocked site data do', () => {
    setLanguages(['es-ES']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(detectLocale()).toBe('es');
    expect(() => persistLocale('de')).not.toThrow();
  });
});

describe('formattingTag', () => {
  afterEach(() => vi.restoreAllMocks());

  it("formats with the browser's own region when it speaks the UI language", () => {
    setLanguages(['en-GB', 'de-CH']);
    expect(formattingTag('en')).toBe('en-GB');
    expect(formattingTag('de')).toBe('de-CH');
  });

  it('falls back to the bare language otherwise', () => {
    setLanguages(['en-US']);
    expect(formattingTag('nl')).toBe('nl');
  });
});
