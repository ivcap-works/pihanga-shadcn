import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import type {ConditionalProps} from "./conditional.types";

/**
 * ConditionalComponent
 *
 * Transparent pass-through: renders the `content` card when `show` is `true`,
 * returns `null` otherwise.  No extra DOM wrapper is added — the mounted
 * card's own root element is the only node in the tree.
 */
export const ConditionalComponent = (
  props: PiCardProps<ConditionalProps>,
): React.ReactNode => {
  const {cardName, show, content} = props;
  if (!show) return null;
  return <Card cardName={content} parentCard={cardName} />;
};
