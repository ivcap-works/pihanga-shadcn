import * as React from "react";
import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";

export const TYPOGRAPHY_CARD = "shad/typography";

export const Typography =
  createCardDeclaration<TypographyProps>(TYPOGRAPHY_CARD);

/**
 * Semantic level controls both the rendered HTML element and default
 * Tailwind prose styling (following shadcn/ui typography conventions).
 */
export type TypographyLevel =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "code"
  | "lead" // large muted intro paragraph
  | "large" // large text, semibold
  | "small" // small, medium-weight
  | "muted"; // small, muted-foreground

export type TypographyProps = {
  /** Plain text content. */
  text?: string;
  /** A child card rendered as content. */
  childCard?: PiCardRef;
  /** Inline paragraph: mix of literal strings and nested TypographyProps. */
  paragraph?: (string | TypographyProps)[];

  /** Semantic level — controls the HTML element and default prose styling. */
  level?: TypographyLevel;

  /** Additional CSS classes applied directly to the element. */
  className?: string;
  /** Inline styles applied directly to the element. */
  style?: React.CSSProperties;
};
