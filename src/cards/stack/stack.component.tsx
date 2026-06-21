import * as React from "react";
import type {StackProps} from "./stack.types";

import {Card, type PiCardProps} from "@pihanga2/core";
import clsx from "clsx";
import {Fragment} from "react";

export type SelectSD = {
  root?: string;
};

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
  } = props;
  const sd: SelectSD = (style as {shad?: SelectSD} | undefined)?.shad || {};

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

  // const sx = style?.joy
  // const p = {
  //   direction,
  //   spacing,
  //   justifyContent,
  //   alignItems,
  //   divider: divider ? <Card cardName={divider} parentCard={cardName} /> : null,
  //   sx,
  //   className,
  // }

  function renderContent() {
    if (!content) return null;

    return content.map((cn, i) => (
      <Fragment key={i}>
        <Card cardName={cn} parentCard={cardName} key={`item-${i}`} />
        {divider && i < content.length - 1 && (
          <Card cardName={divider} parentCard={cardName} key={`divider-${i}`} />
        )}
      </Fragment>
    ));
  }

  return (
    <div className={clsx(cn)} data-pihanga={cardName}>
      {renderContent()}
      {props.children}
    </div>
  );
};
