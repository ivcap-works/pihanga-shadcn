"use client";

import * as React from "react";

// ── Named breakpoints ─────────────────────────────────────────────────────────

/** Named Tailwind-compatible breakpoints → pixel values. */
const NAMED_PX: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// ── Selector parsers ──────────────────────────────────────────────────────────

/**
 * Convert a user-supplied breakpoint selector string into a CSS media-query
 * string suitable for `window.matchMedia`.
 *
 * Supported selector formats
 * ──────────────────────────
 *  Named (Tailwind)  │ `sm`  `md`  `lg`  `xl`  `2xl`
 *  Min-width         │ `640px`   `>=640px`
 *  Exclusive min     │ `>640px`  (≡ min-width: 641px)
 *  Max-width         │ `<=1024px`
 *  Exclusive max     │ `<1024px` (≡ max-width: 1023px)
 */
export function selectorToMediaQuery(selector: string): string {
  if (NAMED_PX[selector]) return `(min-width: ${NAMED_PX[selector]}px)`;

  if (/^>=\d+(\.\d+)?px$/.test(selector))
    return `(min-width: ${selector.slice(2)})`;

  if (/^>\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(1));
    return `(min-width: ${px + 1}px)`;
  }

  if (/^<=\d+(\.\d+)?px$/.test(selector))
    return `(max-width: ${selector.slice(2)})`;

  if (/^<\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(1));
    return `(max-width: ${px - 1}px)`;
  }

  if (/^\d+(\.\d+)?px$/.test(selector)) return `(min-width: ${selector})`;

  // Fallback: treat as a raw CSS media feature
  return selector;
}

/**
 * Convert a breakpoint selector string into a predicate that tests a pixel
 * width directly.  Used by `useContainerBreakpoint` to evaluate the selector
 * against an element's `contentRect.width` rather than the viewport.
 *
 * Returns `() => true` for unrecognised selectors (fail-open).
 */
export function selectorToWidthTest(
  selector: string,
): (width: number) => boolean {
  // Named Tailwind breakpoints → min-width
  if (NAMED_PX[selector]) {
    const threshold = NAMED_PX[selector];
    return (w) => w >= threshold;
  }

  // >=Npx
  if (/^>=\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(2));
    return (w) => w >= px;
  }

  // >Npx
  if (/^>\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(1));
    return (w) => w > px;
  }

  // <=Npx
  if (/^<=\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(2));
    return (w) => w <= px;
  }

  // <Npx
  if (/^<\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector.slice(1));
    return (w) => w < px;
  }

  // Bare Npx  →  min-width
  if (/^\d+(\.\d+)?px$/.test(selector)) {
    const px = parseFloat(selector);
    return (w) => w >= px;
  }

  // Unrecognised → always visible
  return () => true;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Returns `true` when the **viewport** matches the given breakpoint selector,
 * and reactively updates on resize via `window.matchMedia`.
 *
 * When `selector` is `undefined` the hook always returns `true` (no restriction).
 *
 * @param selector  A breakpoint name (`sm` | `md` | `lg` | `xl` | `2xl`),
 *                  a pixel expression (`>400px`, `>=640px`, `<768px`,
 *                  `<=1024px`, `400px`), or `undefined`.
 */
export function useBreakpoint(selector: string | undefined): boolean {
  const mediaQuery = React.useMemo(
    () => (selector ? selectorToMediaQuery(selector) : null),
    [selector],
  );

  const [matches, setMatches] = React.useState<boolean>(() => {
    if (!mediaQuery || typeof window === "undefined") return true;
    return window.matchMedia(mediaQuery).matches;
  });

  React.useEffect(() => {
    if (!mediaQuery) {
      setMatches(true);
      return;
    }

    const mql = window.matchMedia(mediaQuery);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [mediaQuery]);

  return matches;
}

/**
 * Returns `true` when the width of the element referenced by `ref` matches
 * the given breakpoint selector.  Uses `ResizeObserver` so it reacts to
 * any layout change — not just window resize.
 *
 * When `selector` is `undefined` the hook always returns `true`.
 *
 * **Note:** The caller must attach `ref` to a DOM element.  A thin wrapper
 * `<div ref={ref} style={{ width: "100%" }}>` whose width equals its parent's
 * content width is the canonical usage pattern, allowing the breakpoint to be
 * evaluated against the **enclosing container** rather than the viewport.
 *
 * @param selector  Same format as {@link useBreakpoint}.
 * @param ref       A React ref attached to the element whose width is measured.
 */
export function useContainerBreakpoint(
  selector: string | undefined,
  ref: React.RefObject<HTMLElement | null>,
): boolean {
  // Build the width-test predicate once per selector change.
  const test = React.useMemo(
    () => (selector ? selectorToWidthTest(selector) : null),
    [selector],
  );

  // Default to `true` (optimistic / SSR-safe) until the observer fires.
  const [matches, setMatches] = React.useState(true);

  React.useEffect(() => {
    if (!test) {
      setMatches(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Run immediately so the first render is correct.
    setMatches(test(el.getBoundingClientRect().width));

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // `contentBoxSize` is the standard; fall back to `contentRect` for
        // older Safari.
        const width =
          entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        setMatches(test(width));
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [test, ref]);

  return matches;
}
