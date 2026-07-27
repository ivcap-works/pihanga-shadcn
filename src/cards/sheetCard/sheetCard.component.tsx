import React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {
  Sheet as SheetRoot,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/registry/ui/sheet";
import {Button} from "@/registry/ui/button";

import type {PiSheetEvents, PiSheetProps} from "./sheetCard.types";

export const SheetCardComponent = (
  props: PiCardProps<PiSheetProps, PiSheetEvents>,
): React.ReactNode => {
  const {
    id,
    trigger,
    content,
    title,
    description,
    open: controlledOpen,
    side = "right",
    footer,
    footerCloseButtonText,
    className,
    headerClassName,
    contentClassName,
    footerClassName,
    cardName,
    onOpened,
    onClosed,
    onOpenChanged,
  } = props;

  const effectiveCloseText =
    footerCloseButtonText === undefined ? "Close" : footerCloseButtonText;

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const prevControlledOpenRef = React.useRef(controlledOpen);

  // Detect programmatic close (controlled open: true → false)
  React.useEffect(() => {
    if (
      prevControlledOpenRef.current === true &&
      controlledOpen === false &&
      open === false
    ) {
      onClosed({id, reason: "programmatic"});
    }
    prevControlledOpenRef.current = controlledOpen;
  }, [controlledOpen, open, id, onClosed]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChanged({open: nextOpen, id});
    if (nextOpen) {
      onOpened({id});
    } else if (controlledOpen === undefined) {
      onClosed({id, reason: "user"});
    }
  };

  function renderHeader() {
    if (!title && !description) return null;
    return (
      <SheetHeader className={headerClassName}>
        {title && <SheetTitle>{title}</SheetTitle>}
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
    );
  }

  function renderFooter() {
    if (footer) {
      return (
        <SheetFooter className={footerClassName}>
          <Card cardName={footer} parentCard={cardName} />
        </SheetFooter>
      );
    }
    if (effectiveCloseText !== null) {
      return (
        <SheetFooter className={footerClassName}>
          <SheetClose asChild>
            <Button variant="outline">{effectiveCloseText}</Button>
          </SheetClose>
        </SheetFooter>
      );
    }
    return null;
  }

  return (
    <SheetRoot open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <SheetTrigger asChild>
          <span className="inline-flex" data-pihanga-trigger-wrapper>
            <Card cardName={trigger} parentCard={cardName} />
          </span>
        </SheetTrigger>
      )}
      <SheetContent
        data-pihanga={cardName}
        side={side}
        className={className}
      >
        {renderHeader()}
        <div className={cn("flex-1 overflow-y-auto p-4", contentClassName)}>
          <Card cardName={content} parentCard={cardName} />
        </div>
        {renderFooter()}
      </SheetContent>
    </SheetRoot>
  );
};
