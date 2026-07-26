import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import {ChevronsUpDown} from "lucide-react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {getIcon} from "@/cards/icons";
import type {
  CollapsibleCardProps,
  CollapsibleCardEvents,
  CollapsibleTitleLevel,
} from "./collapsibleCard.types";

const TITLE_CLASSES: Record<CollapsibleTitleLevel, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
};

export const CollapsibleCardComponent = (
  props: PiCardProps<CollapsibleCardProps, CollapsibleCardEvents>,
): React.ReactNode => {
  const {
    title,
    titleLevel = "h4",
    titleCard,
    icon,
    contentCard,
    defaultOpen = false,
    open,
    onOpenChanged,
    className,
    headerClassName,
    contentClassName,
    style,
    cardName,
  } = props;

  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const openState = open !== undefined ? open : localOpen;

  function handleOpenChange(next: boolean): void {
    setLocalOpen(next);
    onOpenChanged?.({open: next});
  }

  const triggerIcon = icon ? (
    getIcon(icon)
  ) : (
    <ChevronsUpDown className="h-4 w-4" />
  );

  return (
    <CollapsiblePrimitive.Root
      open={openState}
      onOpenChange={handleOpenChange}
      className={cn("w-full", className)}
      style={style}
      data-pihanga={cardName}
    >
      <div
        className={cn(
          "flex items-center justify-between space-x-4 py-2",
          headerClassName,
        )}
      >
        {titleCard ? (
          <Card cardName={titleCard} parentCard={cardName} />
        ) : (
          <span className={TITLE_CLASSES[titleLevel]}>{title}</span>
        )}
        <CollapsiblePrimitive.Trigger asChild>
          <button
            type="button"
            className="shrink-0 rounded-sm p-1 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-expanded={openState}
            aria-label={openState ? "Collapse" : "Expand"}
          >
            {triggerIcon}
          </button>
        </CollapsiblePrimitive.Trigger>
      </div>
      <CollapsiblePrimitive.Content
        className={cn("overflow-hidden", contentClassName)}
      >
        {contentCard && <Card cardName={contentCard} parentCard={cardName} />}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
};
