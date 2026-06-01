/**
 * Screen size breakpoints matching Tailwind CSS defaults.
 *
 * Used with {@link SizeMap} to render different cards (or none at all)
 * depending on the viewport width.
 */
export enum ScreenSize {
  XS = "xs", // default / < 640px
  SM = "sm", // ≥ 640px
  MD = "md", // ≥ 768px
  LG = "lg", // ≥ 1024px
  XL = "xl", // ≥ 1280px
  XXL = "2xl", // ≥ 1536px
}

/**
 * Ascending order of breakpoints — used for cascade resolution.
 * @internal
 */
export const SCREEN_SIZE_ORDER: ScreenSize[] = [
  ScreenSize.XS,
  ScreenSize.SM,
  ScreenSize.MD,
  ScreenSize.LG,
  ScreenSize.XL,
  ScreenSize.XXL,
];

/**
 * Minimum viewport widths (px) for each breakpoint.
 * @internal
 */
export const SCREEN_SIZE_WIDTHS: Record<ScreenSize, number> = {
  [ScreenSize.XS]: 0,
  [ScreenSize.SM]: 640,
  [ScreenSize.MD]: 768,
  [ScreenSize.LG]: 1024,
  [ScreenSize.XL]: 1280,
  [ScreenSize.XXL]: 1536,
};

/**
 * Map a value {@link T} to specific screen-size breakpoints.
 *
 * Resolution follows a **mobile-first cascade**: the entry with the
 * largest breakpoint that is ≤ the current viewport size wins.
 *
 * ```ts
 * // Show "desktopCard" on md and above, nothing on xs/sm:
 * { [ScreenSize.MD]: "desktopCard" }
 *
 * // Show a different card per breakpoint:
 * { [ScreenSize.XS]: "mobileCard", [ScreenSize.MD]: "desktopCard" }
 *
 * // Explicitly hide on md and above:
 * { [ScreenSize.XS]: "card", [ScreenSize.MD]: null }
 * ```
 *
 * Set `default` as a final fallback when no breakpoint entry matches.
 */
export type SizeMap<T> = Partial<Record<ScreenSize, T | null>> & {
  default?: T | null;
};
