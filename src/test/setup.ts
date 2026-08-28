/**
 * Tests run in a negative UTC offset by default.
 *
 * This is a product about calendar days, and UTC is the one timezone in which the
 * timezone bugs are invisible: `new Date('2026-09-01')` is 1 September there and 31
 * August in New York. A suite that only ever ran at UTC+0 passed for months while
 * `getDatesBetween` shifted every date in every trip back a day for everyone west of
 * Greenwich - the start date included - and while a test that claimed to guard exactly
 * that stubbed `getTimezoneOffset`, a method the implementation never called.
 *
 * Set WGW_TEST_TZ to check another offset; UTC and Asia/Tokyo are both worth a run when
 * touching date code.
 */
process.env.TZ = process.env.WGW_TEST_TZ ?? 'America/New_York';

import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom defines navigator.clipboard as a getter-only property, so tests cannot assign
// to it. Define it once here; individual tests replace writeText with their own spy.
Object.defineProperty(window.navigator, "clipboard", {
  writable: true,
  configurable: true,
  value: { writeText: () => Promise.resolve() },
});

// jsdom does no layout, so it does not implement elementFromPoint. The touch-drag code
// depends on it; tests that exercise a drag replace this with their own mapping from
// synthetic coordinates to the cell they mean.
if (!document.elementFromPoint) {
  Object.defineProperty(document, "elementFromPoint", {
    writable: true,
    configurable: true,
    value: () => null,
  });
}
