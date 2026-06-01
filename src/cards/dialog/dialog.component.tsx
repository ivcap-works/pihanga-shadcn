import React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import {
  Dialog as DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/registry/ui/dialog";
import {Button} from "@/registry/ui/button";

import type {PiDialogEvents, PiDialogProps} from "./dialog.types";

export const DialogComponent = (
  props: PiCardProps<PiDialogProps, PiDialogEvents>,
): React.ReactNode => {
  const {
    id,
    trigger,
    content,
    title,
    description,
    open: controlledOpen,
    size,
    variant,
    desktopVariant,
    mobileVariant,
    dismissible,
    hideClose,
    className,
    footer,
    footerCloseButtonText,
    cardName,
    onOpened,
    onClosed,
    onOpenChanged,
  } = props;

  // Apply default for footer close button text
  const effectiveFooterCloseButtonText =
    footerCloseButtonText === undefined ? "Close" : footerCloseButtonText;

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;

  // Track previous open state to detect programmatic changes
  const prevControlledOpenRef = React.useRef(controlledOpen);

  React.useEffect(() => {
    // Detect programmatic close via props.open changing from true to false
    if (
      prevControlledOpenRef.current === true &&
      controlledOpen === false &&
      open === false
    ) {
      // This is a programmatic close
      onClosed({id, reason: "programmatic"});
    }
    prevControlledOpenRef.current = controlledOpen;
  }, [controlledOpen, open, id, onClosed]);

  const handleOpenChange = (nextOpen: boolean) => {
    // Update internal state if not controlled
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }

    // Emit events
    onOpenChanged({open: nextOpen, id});

    if (nextOpen) {
      onOpened({id});
    } else {
      // When user dismisses (not programmatic), reason is 'user'
      // We only get here from user actions when controlled open is undefined
      // or when the dialog component itself triggers the change
      if (controlledOpen === undefined) {
        onClosed({id, reason: "user"});
      }
    }
  };

  function renderTrigger() {
    if (!trigger) return null;

    // Similar to dropDownMenu: wrap trigger in a DOM element so Radix
    // can attach handlers via asChild even when trigger is a Pihanga card.
    return (
      <span className="inline-flex" data-pihanga-trigger-wrapper>
        <Card cardName={trigger} parentCard={cardName} />
      </span>
    );
  }

  function renderHeader() {
    if (!title && !description) return null;

    return (
      <DialogHeader>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
    );
  }

  function renderFooter() {
    // Custom footer card takes precedence
    if (footer) {
      return (
        <DialogFooter className="bg-muted/50">
          <Card cardName={footer} parentCard={cardName} />
        </DialogFooter>
      );
    }

    // Default close button (if not explicitly disabled)
    if (effectiveFooterCloseButtonText !== null) {
      return (
        <DialogFooter className="bg-muted/50">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {effectiveFooterCloseButtonText}
          </Button>
        </DialogFooter>
      );
    }

    // No footer
    return null;
  }

  // Use fixed layout when we have header or footer
  const hasFixedLayout = !!(
    title ||
    description ||
    footer ||
    effectiveFooterCloseButtonText
  );

  return (
    <DialogRoot
      open={open}
      onOpenChange={handleOpenChange}
      desktopVariant={desktopVariant}
      mobileVariant={mobileVariant}
    >
      {trigger && <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>}
      <DialogContent
        data-pihanga={cardName}
        size={size}
        variant={variant === "drawer" ? undefined : variant}
        dismissible={dismissible}
        hideClose={hideClose}
        fixed={hasFixedLayout}
        className={className}
      >
        {renderHeader()}
        <DialogBody>
          <Card cardName={content} parentCard={cardName} />
        </DialogBody>
        {renderFooter()}
      </DialogContent>
    </DialogRoot>
  );
};
