import {Button} from "@/cards/button";
import {
  Dialog,
  onDialogOpened,
  onDialogClosed,
  onDialogOpenChanged,
} from "./index";
import {definePlayground} from "@/playground/definePlayground";

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
 */
export const controlledDialogExample = Dialog({
  id: "controlled-dialog",
  open: false,
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
 */
export const programmaticDialogExample = Dialog({
  id: "programmatic-dialog",
  open: false,
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
  footerCloseButtonText: null,
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

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/dialog",
  title: "Dialog",

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props: any) =>
    Dialog({
      // Spread live props from the Controls panel (title, description,
      // size, variant, desktopVariant, mobileVariant, dismissible, hideClose…)
      ...props,
      // Fixed id to avoid card-name collisions in the playground
      id: "playground-dialog-preview",
      // Always provide real card components for trigger and content so the
      // preview works regardless of which facet / defaultProps is active.
      trigger: Button({label: "Open Dialog", opts: {variant: "default"}}),
      content: Button({label: "Dialog Content", opts: {variant: "ghost"}}),
    }),

  defaultProps: {
    id: "preview",
    title: "Confirm Action",
    description: "Are you sure you want to continue?",
    content: "playground/dialog-content",
    size: "md",
    dismissible: true,
  },

  facets: [
    {
      id: "with-trigger",
      title: "With trigger",
      description:
        "Dialog opened by a trigger card (typically a Button). Most common usage.",
      props: {
        id: "with-trigger",
        trigger: "myApp/open-button",
        content: "myApp/dialog-content",
        title: "Confirm",
        description: "This action cannot be undone.",
        size: "md",
      },
    },
    {
      id: "controlled",
      title: "Controlled",
      description:
        "Visibility driven by `open` prop from state. Wire `onClosed` to reset the flag.",
      props: {
        id: "controlled",
        open: false,
        content: "myApp/dialog-content",
        title: "Controlled Dialog",
      },
    },
    {
      id: "drawer",
      title: "Drawer on mobile",
      description: "Shows as a modal on desktop and a bottom drawer on mobile.",
      props: {
        id: "drawer",
        trigger: "myApp/open-button",
        content: "myApp/dialog-content",
        title: "Responsive Dialog",
        desktopVariant: "modal",
        mobileVariant: "drawer",
      },
    },
    {
      id: "sizes",
      title: "Full screen",
      description: 'The `variant: "full"` dialog occupies the entire viewport.',
      props: {
        id: "full-screen",
        trigger: "myApp/open-button",
        content: "myApp/dialog-content",
        title: "Full Screen",
        variant: "full",
      },
    },
    {
      id: "non-dismissible",
      title: "Non-dismissible",
      description:
        "Set `dismissible: false` to require the user to click the close button.",
      props: {
        id: "non-dismissible",
        trigger: "myApp/open-button",
        content: "myApp/dialog-content",
        title: "Must close explicitly",
        dismissible: false,
      },
    },
  ],

  controls: [
    {prop: "title", type: "text", label: "Title", placeholder: "Dialog title…"},
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Optional subtitle…",
    },
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    },
    {
      prop: "variant",
      type: "token",
      label: "Variant",
      options: ["modal", "drawer", "full"],
    },
    {prop: "dismissible", type: "boolean", label: "Dismissible"},
    {prop: "hideClose", type: "boolean", label: "Hide close button"},
  ],

  registerEvents: (r, logEvent) => {
    // Fires when the dialog becomes visible.
    onDialogOpened(r, (state, ev) => {
      logEvent(state, "onDialogOpened", {id: ev.id});
    });
    // Fires when the dialog is dismissed (reason: 'user' or 'programmatic').
    onDialogClosed(r, (state, ev) => {
      logEvent(state, "onDialogClosed", {id: ev.id, reason: ev.reason});
    });
    // Fires on every open-state transition (combines open + close).
    onDialogOpenChanged(r, (state, ev) => {
      logEvent(state, "onDialogOpenChanged", {open: ev.open, id: ev.id});
    });
  },

  note: `
**Trigger-driven** dialog:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Dialog, onDialogClosed} from "@/cards/dialog";
import {Button} from "@/cards/button";

register((r) => {
  onDialogClosed(r, (state, {id}) => {
    if (id === "confirm-delete") {
      state.deleteDialogOpen = false;
    }
  });
});

registerCard("myApp/deleteDialog", Dialog({
  id:          "confirm-delete",
  trigger:     Button({label: "Delete", opts: {variant: "destructive"}}),
  content:     "myApp/deleteConfirmContent",
  title:       "Delete item?",
  description: "This action cannot be undone.",
  size:        "sm",
}));
\`\`\`

**Programmatic** (controlled via state):

\`\`\`ts
registerCard("myApp/dialog", Dialog({
  open:    memo((s: AppState) => s.dialogOpen),
  content: "myApp/dialogContent",
  title:   "Status",
}));
\`\`\`
  `.trim(),
});
