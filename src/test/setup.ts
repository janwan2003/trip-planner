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
