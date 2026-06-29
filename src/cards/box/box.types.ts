import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";
import { AlignItemsT } from "../types";

export const BOX_CARD = "shad/box";

/**
 * Responsive display grid breakpoints.
 *
 * Each key maps to a CSS display value applied at that viewport width:
 * - `xs`: < 640 px (default / mobile-first)
 * - `sm`: ≥ 640 px
 * - `md`: ≥ 768 px
 * - `lg`: ≥ 1024 px
 * - `xl`: ≥ 1280 px
 * - `xxl`: ≥ 1536 px
 */
export type DisplayGridT = {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
};

export type BoxProps<S = object> = {
  /** Child card refs rendered inside the box */
  content?: PiCardRef[];

  /** Override the root element type */
  component?: React.ElementType;

  /** Fixed height in pixels */
  height?: number;
  /** Fixed width in pixels */
  width?: number;

  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;

  alignItems?: AlignItemsT;
  /** Tailwind gap spacing units */
  gap?: number;
  /** Uniform padding in pixels */
  padding?: number;
  /** Responsive display grid breakpoints */
  display?: DisplayGridT;

  /** Card style object (use the `shad` key for Tailwind-compatible overrides) */
  style?: S;
  /** Additional Tailwind utility classes */
  className?: string;
};

/**
 * Factory function for declaring a `shad/box` card instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {Box} from "@/cards/box";
 *
 * registerCard("myApp/spacer", Box({height: 24}));
 *
 * registerCard("myApp/contentRegion", Box({
 *   content:    ["myApp/card1", "myApp/card2"],
 *   paddingTop: 16,
 *   className:  "rounded-lg border bg-card",
 * }));
 * ```
 */
export const Box = createCardDeclaration<BoxProps>(BOX_CARD);
