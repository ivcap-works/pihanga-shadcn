import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";
import type React from "react";

export const EMPTY_CARD = "empty-card";

export type EmptyCardProps = {
  /**
   * Icon name from the pihanga icon registry.
   * When provided, renders an `EmptyMedia` slot with `variant="icon"`.
   */
  icon?: string;

  /**
   * Pihanga card reference rendered inside `EmptyContent`.
   * Use this to show a call-to-action button, form, or any other card.
   */
  content?: PiCardRef;

  /** Additional Tailwind / CSS classes forwarded to the root `Empty` element. */
  className?: string;

  /** Inline styles forwarded to the root `Empty` element. */
  style?: React.CSSProperties;
};

/**
 * Factory function for declaring an `empty-card` instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {EmptyCard} from "@/cards/emptyCard";
 * import {Button} from "@/cards/button";
 *
 * registerCard("myApp/noResults", EmptyCard({
 *   icon: "search",
 *   content: "myApp/createButton",
 * }));
 *
 * registerCard("myApp/createButton", Button({label: "Create new"}));
 * ```
 */
export const EmptyCard = createCardDeclaration<EmptyCardProps>(EMPTY_CARD);
