import React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import {
  Drawer as DrawerRoot,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/registry/ui/drawer";
import {Button} from "@/registry/ui/button";

import type {PiDrawerEvents, PiDrawerProps} from "./drawer.types";

export const DrawerComponent = (
  props: PiCardProps<PiDrawerProps, PiDrawerEvents>,
): React.ReactNode => {
  const {
    id,
    trigger,
    content,
    title,
    description,
    open: controlledOpen,
    direction = "bottom",
    dismissible = true,
    footer,
    footerCloseButtonText,
    className,
    cardName,
    onOpened,
    onClosed,
    onOpenChanged,
  } = props;

  const effectiveFooterCloseButtonText =
    footerCloseButtonText === undefined ? "Close" : footerCloseButtonText;

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const prevControlledOpenRef = React.useRef(controlledOpen);

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

  function renderTrigger() {
    if (!trigger) return null;
    return (
      <span className="inline-flex" data-pihanga-trigger-wrapper>
        <Card cardName={trigger} parentCard={cardName} />
      </span>
    );
  }

  function renderHeader() {
    if (!title && !description) return null;
    return (
      <DrawerHeader>
        {title && <DrawerTitle>{title}</DrawerTitle>}
        {description && <DrawerDescription>{description}</DrawerDescription>}
      </DrawerHeader>
    );
  }

  function renderFooter() {
    if (footer) {
      return (
        <DrawerFooter>
          <Card cardName={footer} parentCard={cardName} />
        </DrawerFooter>
      );
    }
    if (effectiveFooterCloseButtonText !== null) {
      return (
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {effectiveFooterCloseButtonText}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      );
    }
    return null;
  }

  return (
    <DrawerRoot
      open={open}
      onOpenChange={handleOpenChange}
      direction={direction}
      dismissible={dismissible}
    >
      {trigger && <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>}
      <DrawerContent data-pihanga={cardName} className={className}>
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-4">
          <Card cardName={content} parentCard={cardName} />
        </div>
        {renderFooter()}
      </DrawerContent>
    </DrawerRoot>
  );
};
