import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";
import {AlignItemsT} from "../types";

export const STACK_CARD = "pi/stack";

/**
 * Factory function for declaring a `stack` card instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {Stack} from "@/cards/stack";
 *
 * registerCard("myApp/toolbar", Stack({
 *   direction:      "row",
 *   spacing:        2,
 *   alignItems:     "center",
 *   justifyContent: "space-between",
 *   content:        ["myApp/logo", "myApp/navLinks", "myApp/userMenu"],
 * }));
 * ```
 */
export const Stack = createCardDeclaration<StackProps>(STACK_CARD);

/**
 * CSS `flex-direction` values supported by the Stack card.
 */
export type DirectionT = "column-reverse" | "column" | "row-reverse" | "row";

/**
 * CSS `justify-content` values supported by the Stack card.
 */
export type JustifyContentT =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type StackProps<S = object> = {
  /** Ordered list of child card refs to render */
  content: PiCardRef[];

  /** Flex direction — defaults to `"column"` */
  direction?: DirectionT;
  /** Optional card ref rendered as a separator between children */
  divider?: PiCardRef;
  /** Tailwind gap spacing units between children */
  spacing?: number;

  justifyContent?: JustifyContentT;
  alignItems?: AlignItemsT;

  /** Additional Tailwind utility classes */
  className?: string;
  /** Card style object (use the `shad` key for Tailwind-compatible overrides) */
  style?: S;
};
