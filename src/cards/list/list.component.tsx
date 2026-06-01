import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {getIcon} from "@/cards/icons";
import type {DecoratorT, ListEvents, ListItem, ListProps} from "./list.types";

// ---------------------------------------------------------------------------
// Size tokens
// ---------------------------------------------------------------------------

/** Padding + font-size + gap for item buttons */
const ITEM_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-1 text-xs gap-1.5",
  md: "px-2 py-1.5 text-sm gap-2",
  lg: "px-3 py-2 text-base gap-2.5",
};

/** Sub-title font-size (one step smaller than title) */
const SUB_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

/** Avatar size per density */
const AVATAR_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
};

// ---------------------------------------------------------------------------
// Decorator renderer
// ---------------------------------------------------------------------------

function renderDecorator(
  decorator: DecoratorT | undefined,
  size: "sm" | "md" | "lg",
  parentCard: string,
): React.ReactNode {
  if (!decorator) return null;

  switch (decorator.type) {
    case "icon":
      return (
        <span
          className={cn(
            "flex shrink-0 items-center [&>svg]:size-4",
            decorator.className,
          )}
        >
          {getIcon(decorator.name)}
        </span>
      );

    case "avatar":
      return (
        <Avatar className={cn(AVATAR_SIZE[size], decorator.className)}>
          <AvatarImage src={decorator.src} />
          <AvatarFallback>{decorator.fallback ?? ""}</AvatarFallback>
        </Avatar>
      );

    case "chip":
      return (
        <Badge variant="secondary" className={decorator.className}>
          {decorator.text}
        </Badge>
      );

    case "card":
      return <Card cardName={decorator.cardName} parentCard={parentCard} />;

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Single item row (recursive for nested)
// ---------------------------------------------------------------------------

type ItemRowProps = {
  item: ListItem;
  size: "sm" | "md" | "lg";
  onItemClicked: (ev: {itemID: string | number}) => void;
  cardName: string;
};

function ItemRow({
  item,
  size,
  onItemClicked,
  cardName,
}: ItemRowProps): React.ReactNode {
  const [open, setOpen] = React.useState(false);
  const hasNested = Boolean(item.nested?.length);

  function handleClick() {
    if (hasNested) {
      setOpen((prev) => !prev);
    } else {
      onItemClicked({itemID: item.id});
    }
  }

  return (
    <li>
      {/* Item button ---------------------------------------------------- */}
      <button
        type="button"
        className={cn(
          "flex w-full items-center rounded-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-1 focus-visible:ring-ring",
          item.isSelected && "bg-accent text-accent-foreground font-medium",
          ITEM_SIZE[size],
          item.className,
        )}
        onClick={handleClick}
        aria-expanded={hasNested ? open : undefined}
        data-selected={item.isSelected || undefined}
      >
        {/* Start decorator */}
        {renderDecorator(item.startDecorator, size, cardName)}

        {/* Title + subtitle */}
        <span className="flex min-w-0 flex-1 flex-col items-start">
          <span className="truncate leading-none">{item.title}</span>
          {item.subTitle && (
            <span
              className={cn(
                "mt-0.5 truncate text-muted-foreground",
                SUB_SIZE[size],
              )}
            >
              {item.subTitle}
            </span>
          )}
        </span>

        {/* End decorator (suppress if we're showing the chevron) */}
        {!hasNested && renderDecorator(item.endDecorator, size, cardName)}

        {/* Expand/collapse chevron for nested items */}
        {hasNested && (
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Nested list ---------------------------------------------------- */}
      {hasNested && open && (
        <ul
          className={cn(
            "ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2",
            "list-none p-0",
            // keep the indent aligned regardless of density
            size === "lg" ? "ml-4 pl-3" : "ml-3 pl-2",
          )}
        >
          {item.nested!.map((child, idx) => (
            <ItemRow
              key={child.id ?? idx}
              item={child}
              size={size}
              onItemClicked={onItemClicked}
              cardName={cardName}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// List card component
// ---------------------------------------------------------------------------

export const ListComponent = (
  props: PiCardProps<ListProps, ListEvents>,
): React.ReactNode => {
  const {
    items,
    size = "md",
    marker,
    className,
    style,
    onItemClicked,
    cardName,
  } = props;

  // When a marker is requested, expose it via CSS custom property so the
  // list-style-type cascade works without a wrapper element.
  const rootStyle: React.CSSProperties = {
    ...style,
    ...(marker && marker !== "none" ? {listStyleType: marker} : undefined),
  };

  return (
    <ul
      className={cn(
        "flex flex-col gap-0.5 p-0",
        marker && marker !== "none" ? "list-inside" : "list-none",
        className,
      )}
      style={rootStyle}
      data-pihanga={cardName}
    >
      {items.map((item, idx) => (
        <ItemRow
          key={item.id ?? idx}
          item={item}
          size={size}
          onItemClicked={onItemClicked}
          cardName={cardName}
        />
      ))}
    </ul>
  );
};
