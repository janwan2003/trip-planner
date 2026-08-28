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
