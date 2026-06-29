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

// ---------------------------------------------------------------------------
// Shadcn / Tailwind-native shared primitive types
//
// These types replace what was previously imported from `@pihanga2/cards` and
// are expressed in terms of Shadcn's design system and Tailwind utility tokens.
// ---------------------------------------------------------------------------

/**
 * Shadcn button / badge visual variant.
 *
 * Maps directly to the `variant` prop accepted by `@/components/ui/button`
 * and `@/components/ui/badge`.
 */
export type VariantT =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

/**
 * Shadcn component size token.
 *
 * Maps directly to the `size` prop accepted by `@/components/ui/button`.
 */
export type SizeT = "default" | "sm" | "lg" | "icon";

/**
 * Tailwind colour token (e.g. `"red"`, `"emerald"`, `"sky"`) or an arbitrary
 * CSS colour string.  Kept as `string` so consumers can pass any Tailwind
 * palette key without being locked to a finite union.
 */
export type ColorT = string;

/**
 * A decorator displayed before or after a button / menu-item label.
 *
 * Expressed as a registered icon name (resolved at render time via the icon
 * registry) or an arbitrary Tailwind-class string for inline SVG icons.
 */
export type DecoratorT = string;

/**
 * CSS `align-items` values supported by the Box & Stack card.
 */
export type AlignItemsT =
  | "normal"
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end"
  | "start"
  | "end"
  | "baseline"
  | "initial"
  | "inherit";
