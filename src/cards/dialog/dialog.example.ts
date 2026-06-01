import {Button} from "@/cards/button";
import {Dialog} from "./dialog.types";

/**
 * Simple dialog example with a button trigger.
 */
export const simpleDialogExample = Dialog({
  id: "simple-dialog",
  trigger: Button({
    label: "Open Dialog",
    opts: {variant: "default"},
  }),
  content: Button({
    label: "Dialog Content Card",
    opts: {variant: "ghost"},
  }),
  title: "Example Dialog",
  description: "This is a simple dialog example with a button as content.",
  size: "md",
});

/**
 * Dialog with controlled open state (programmatic control).
 *
 * To use this pattern, manage the `open` state externally and
 * listen to `onClosed` to update your state.
 *
 * Example in a reducer:
 * ```ts
 * const [dialogOpen, setDialogOpen] = useState(false);
 *
 * const myDialog = Dialog({
 *   id: "controlled-dialog",
 *   open: dialogOpen,
 *   trigger: myTriggerButton,
 *   content: myContentCard,
 *   title: "Controlled Dialog",
 * });
 *
 * // Register event handler:
 * onDialogClosed((ev) => {
 *   if (ev.id === "controlled-dialog") {
 *     setDialogOpen(false);
 *   }
 * });
 *
 * // Open programmatically:
 * setDialogOpen(true);
 * ```
 */
export const controlledDialogExample = Dialog({
  id: "controlled-dialog",
  open: false, // Externally managed
  trigger: Button({
    label: "Controlled Dialog",
    opts: {variant: "outline"},
  }),
  content: Button({
    label: "Content",
  }),
  title: "Controlled Example",
});

/**
 * Purely programmatic dialog (no trigger).
 *
 * This dialog has no trigger button and must be opened/closed
 * entirely via the `open` prop. Useful for dialogs triggered
 * by application logic rather than user clicks.
 *
 * Example usage:
 * ```ts
 * const [showDialog, setShowDialog] = useState(false);
 *
 * const programmaticDialog = Dialog({
 *   id: "programmatic-dialog",
 *   open: showDialog,
 *   // No trigger!
 *   content: myContentCard,
 *   title: "Programmatic Dialog",
 * });
 *
 * // Open from anywhere in your code:
 * setShowDialog(true);
 * ```
 */
export const programmaticDialogExample = Dialog({
  id: "programmatic-dialog",
  open: false, // Must be controlled externally
  // No trigger - purely programmatic
  content: Button({
    label: "This dialog was opened programmatically",
    opts: {variant: "secondary"},
  }),
  title: "Programmatic Dialog",
  description: "This dialog has no trigger button and opens via state changes.",
});

/**
 * Full-screen dialog variant.
 */
export const fullScreenDialogExample = Dialog({
  id: "fullscreen-dialog",
  trigger: Button({
    label: "Full Screen",
    opts: {variant: "secondary"},
  }),
  content: Button({
    label: "Full screen content",
  }),
  title: "Full Screen Dialog",
  variant: "full",
});

/**
 * Drawer variant (mobile-friendly).
 */
export const drawerDialogExample = Dialog({
  id: "drawer-dialog",
  trigger: Button({
    label: "Open Drawer",
    opts: {variant: "ghost"},
  }),
  content: Button({
    label: "Drawer content",
  }),
  title: "Drawer Example",
  mobileVariant: "drawer",
  desktopVariant: "modal",
});

/**
 * Non-dismissible dialog (can't click outside to close).
 */
export const nonDismissibleDialogExample = Dialog({
  id: "non-dismissible-dialog",
  trigger: Button({
    label: "Non-dismissible",
    opts: {variant: "destructive"},
  }),
  content: Button({
    label: "Must use close button",
  }),
  title: "Non-dismissible Dialog",
  description: "You must click the X button to close this dialog.",
  dismissible: false,
});

/**
 * Dialog with custom footer close button text.
 */
export const customFooterTextExample = Dialog({
  id: "custom-footer-text",
  trigger: Button({
    label: "Custom Footer Text",
    opts: {variant: "default"},
  }),
  content: Button({
    label: "Content",
  }),
  title: "Custom Footer",
  footerCloseButtonText: "Got it!",
});

/**
 * Dialog with no footer (close button hidden).
 */
export const noFooterExample = Dialog({
  id: "no-footer",
  trigger: Button({
    label: "No Footer",
    opts: {variant: "ghost"},
  }),
  content: Button({
    label: "No footer here!",
  }),
  title: "No Footer",
  footerCloseButtonText: null, // Explicitly hide footer
});

/**
 * Dialog with custom footer card.
 */
export const customFooterCardExample = Dialog({
  id: "custom-footer-card",
  trigger: Button({
    label: "Custom Footer Card",
    opts: {variant: "secondary"},
  }),
  content: Button({
    label: "Content with custom footer",
  }),
  title: "Custom Footer Card",
  footer: Button({
    label: "Custom Footer Button",
    opts: {variant: "default"},
  }),
});
