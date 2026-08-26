import * as React from "react";
import type {StackProps} from "./stack.types";

import {Card, type PiCardProps, type PiCardRef} from "@pihanga2/core";
import clsx from "clsx";
import {Fragment} from "react";

export type SelectSD = {
  root?: string;
};

/**
 * Cheap, non-cryptographic FNV-1a hash — good enough to turn an arbitrary
 * string into a short, stable identifier for use as a React key.
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Derive a stable React key for a `PiCardRef`.
 *
 * - Strings (card names) are already unique — used as-is.
 * - Inline `PiCardDef` objects have no identity of their own, and two
 *   structurally-identical defs created on different renders are different
 *   object references. We hash the (key-sorted) JSON content so that
 *   identical content maps to the same key — preserving React's
 *   reconciliation identity across re-renders/reorders — while still
 *   appending `i` so a hash collision (or two genuinely different defs
 *   that hash the same) can never produce a duplicate key within the list.
 */
function cardRefKey(cn: PiCardRef, i: number): string {
  if (typeof cn === "string") return cn;
  const sortedKeys = Object.keys(cn).sort();
  const json = JSON.stringify(cn, sortedKeys);
  return `${fnv1aHash(json)}-${i}`;
}

export const Component = (props: PiCardProps<StackProps>): React.ReactNode => {
  const {
    content,
    direction,
    divider,
    spacing,
    justifyContent,
    alignItems,
    className,
    style,
    cardName,
    data,
  } = props;
  const sd: SelectSD = (style as SelectSD | undefined) ?? {};

  const cn = [className, sd.root, "flex"];
  if (direction) {
    switch (direction) {
      // "column-reverse" | "column" | "row-reverse" | "row"
      case "row":
        cn.push("flex-row");
        break;
      case "row-reverse":
        cn.push("flex-row-reverse");
        break;
      case "column":
        cn.push("flex-col");
        break;
      case "column-reverse":
        cn.push("flex-col-reverse");
        break;
    }
  }
  if (justifyContent) {
    switch (justifyContent) {
      // "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"
      case "flex-start":
        cn.push("justify-start");
        break;
      case "center":
        cn.push("justify-center");
        break;
      case "flex-end":
        cn.push("justify-end");
        break;
      case "space-between":
        cn.push("justify-between");
        break;
      case "space-around":
        cn.push("justify-around");
        break;
      case "space-evenly":
        cn.push("justify-evenly");
        break;
    }
  }
  if (alignItems) {
    switch (alignItems) {
      // "flex-start" | "center" | "flex-end" | "normal" | "stretch" | "start" | "end" | "baseline" | "initial" | "inherit"
      case "flex-start":
        cn.push("items-start");
        break;
      case "center":
        cn.push("items-center");
        break;
      case "stretch":
        cn.push("items-stretch");
        break;
      case "flex-end":
        cn.push("items-end");
        break;
      case "baseline":
        cn.push("items-baseline");
        break;
      default:
        console.warn("stack: unsupported 'alignItems' property", alignItems);
    }
  }
  if (spacing && spacing > 0) {
    if (
      direction === undefined ||
      direction === "row" ||
      direction === "row-reverse"
    ) {
      cn.push(`gap-${spacing}`);
    } else {
      cn.push(`gap-${spacing}`);
    }
  }

  function renderContent() {
    if (!content) return null;

    return content.map((cn, i) => {
      const key = cardRefKey(cn, i);
      return (
        <Fragment key={key}>
          <Card cardName={cn} parentCard={cardName} key={`item-${key}`} />
          {divider && i < content.length - 1 && (
            <Card
              cardName={divider}
              parentCard={cardName}
              key={`divider-${key}`}
            />
          )}
        </Fragment>
      );
    });
  }

  const dataAttrs = data
    ? Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]))
    : {};

  return (
    <div className={clsx(cn)} data-pihanga={cardName} {...dataAttrs}>
      {renderContent()}
      {props.children}
    </div>
  );
};
