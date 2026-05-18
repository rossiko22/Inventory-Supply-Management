// Vitest test setup — polyfills jsdom is missing and global mocks shared across specs.

// jsdom does not implement window.matchMedia; several components/services (ThemeService)
// query it on init, so stub it out before any TestBed runs.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
