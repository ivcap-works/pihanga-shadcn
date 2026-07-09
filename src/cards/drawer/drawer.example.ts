import {Button} from "@/cards/button";
import {
  Drawer,
  onDrawerOpened,
  onDrawerClosed,
  onDrawerOpenChanged,
} from "./index";
import {definePlayground} from "@/playground/definePlayground";

/**
 * Simple bottom drawer with a button trigger.
 */
export const simpleDrawerExample = Drawer({
  id: "simple-drawer",
  trigger: Button({
    label: "Open Drawer",
    opts: {variant: "default"},
  }),
  content: Button({
    label: "Drawer Content Card",
    opts: {variant: "ghost"},
  }),
  title: "Example Drawer",
  description: "This is a simple bottom drawer example.",
  direction: "bottom",
});

/**
 * Right-side drawer (panel / sheet style).
 */
export const rightDrawerExample = Drawer({
  id: "right-drawer",
  trigger: Button({
    label: "Open Right Drawer",
    opts: {variant: "outline"},
  }),
  content: Button({
    label: "Side Panel Content",
    opts: {variant: "ghost"},
  }),
  title: "Right Panel",
  description: "Slides in from the right — great for detail panels.",
  direction: "right",
});

/**
 * Controlled drawer (programmatic open/close).
 */
export const controlledDrawerExample = Drawer({
  id: "controlled-drawer",
  open: false,
  trigger: Button({
    label: "Controlled Drawer",
    opts: {variant: "outline"},
  }),
  content: Button({
    label: "Controlled content",
  }),
  title: "Controlled Drawer",
});

/**
 * Non-dismissible drawer.
 */
export const nonDismissibleDrawerExample = Drawer({
  id: "non-dismissible-drawer",
  trigger: Button({
    label: "Non-dismissible",
    opts: {variant: "destructive"},
  }),
  content: Button({
    label: "Must use the close button",
  }),
  title: "Non-dismissible Drawer",
  description: "Drag or click outside won't close this drawer.",
  dismissible: false,
});

/**
 * Drawer with no footer.
 */
export const noFooterDrawerExample = Drawer({
  id: "no-footer-drawer",
  trigger: Button({
    label: "No Footer",
    opts: {variant: "ghost"},
  }),
  content: Button({
    label: "No footer content",
  }),
  title: "No Footer Drawer",
  footerCloseButtonText: null,
});

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/drawer",
  title: "Drawer",

  introduction: `
A slide-in drawer panel backed by [Vaul](https://github.com/emilkowalski/vaul)
(the same primitive used by shadcn/ui's Drawer component).

Supports four slide directions (\`bottom\`, \`top\`, \`left\`, \`right\`),
optional header, footer, and both trigger-driven and programmatic open/close.
  `.trim(),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props: any) =>
    Drawer({
      ...props,
      id: "playground-drawer-preview",
      trigger: Button({label: "Open Drawer", opts: {variant: "default"}}),
      content: Button({label: "Drawer Content", opts: {variant: "ghost"}}),
    }),

  defaultProps: {
    id: "preview",
    title: "Drawer Title",
    description: "Optional description below the title.",
    content: "playground/drawer-content",
    direction: "bottom",
    dismissible: true,
  },

  facets: [
    {
      id: "bottom",
      title: "Bottom (default)",
      description:
        "Slides up from the bottom — the most common mobile pattern.",
      props: {
        id: "bottom",
        trigger: "myApp/open-button",
        content: "myApp/drawer-content",
        title: "Bottom Drawer",
        direction: "bottom",
      },
    },
    {
      id: "right",
      title: "Right panel",
      description:
        "Slides in from the right — useful for detail or settings panels.",
      props: {
        id: "right",
        trigger: "myApp/open-button",
        content: "myApp/drawer-content",
        title: "Right Panel",
        direction: "right",
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
        content: "myApp/drawer-content",
        title: "Controlled Drawer",
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
        content: "myApp/drawer-content",
        title: "Must close explicitly",
        dismissible: false,
      },
    },
  ],

  controls: [
    {prop: "title", type: "text", label: "Title", placeholder: "Drawer title…"},
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Optional subtitle…",
    },
    {
      prop: "direction",
      type: "token",
      label: "Direction",
      options: ["bottom", "top", "left", "right"],
    },
    {prop: "dismissible", type: "boolean", label: "Dismissible"},
  ],

  registerEvents: (r, logEvent) => {
    onDrawerOpened(r, (state, ev) => {
      logEvent(state, "onDrawerOpened", {id: ev.id});
    });
    onDrawerClosed(r, (state, ev) => {
      logEvent(state, "onDrawerClosed", {id: ev.id, reason: ev.reason});
    });
    onDrawerOpenChanged(r, (state, ev) => {
      logEvent(state, "onDrawerOpenChanged", {open: ev.open, id: ev.id});
    });
  },

  note: `
**Trigger-driven** drawer:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Drawer, onDrawerClosed} from "@pihanga2/shadcn";
import {Button} from "@pihanga2/shadcn";

register((r) => {
  onDrawerClosed(r, (state, {id}) => {
    if (id === "settings") {
      state.settingsOpen = false;
    }
  });
});

registerCard("myApp/settingsDrawer", Drawer({
  id:          "settings",
  trigger:     Button({label: "Settings", opts: {variant: "outline"}}),
  content:     "myApp/settingsContent",
  title:       "Settings",
  direction:   "right",
}));
\`\`\`

**Programmatic** (controlled via state):

\`\`\`ts
registerCard("myApp/drawer", Drawer({
  open:    memo((s: AppState) => s.drawerOpen),
  content: "myApp/drawerContent",
  title:   "Details",
  direction: "bottom",
}));
\`\`\`
  `.trim(),
});
