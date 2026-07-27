import {Button} from "@/cards/button";
import {
  Sheet,
  onSheetOpened,
  onSheetClosed,
  onSheetOpenChanged,
} from "./index";
import {definePlayground} from "@/playground/definePlayground";

export const rightSheetExample = Sheet({
  id: "right-sheet",
  trigger: Button({label: "Open Sheet", opts: {variant: "default"}}),
  content: Button({label: "Sheet Content", opts: {variant: "ghost"}}),
  title: "Settings",
  description: "Adjust your preferences here.",
  side: "right",
});

export const leftSheetExample = Sheet({
  id: "left-sheet",
  trigger: Button({label: "Open Left Sheet", opts: {variant: "outline"}}),
  content: Button({label: "Navigation Content", opts: {variant: "ghost"}}),
  title: "Navigation",
  side: "left",
});

export const bottomSheetExample = Sheet({
  id: "bottom-sheet",
  trigger: Button({label: "Open Bottom Sheet", opts: {variant: "outline"}}),
  content: Button({label: "Action Content", opts: {variant: "ghost"}}),
  title: "Actions",
  description: "Choose an action below.",
  side: "bottom",
});

export const controlledSheetExample = Sheet({
  id: "controlled-sheet",
  open: false,
  content: Button({label: "Controlled content", opts: {variant: "ghost"}}),
  title: "Controlled Sheet",
  description: "Opened programmatically via the open prop.",
});

export const noFooterSheetExample = Sheet({
  id: "no-footer-sheet",
  trigger: Button({label: "No Footer", opts: {variant: "ghost"}}),
  content: Button({label: "Content only", opts: {variant: "ghost"}}),
  title: "Minimal Sheet",
  footerCloseButtonText: null,
});

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/sheet",
  title: "Sheet",

  introduction: `
A slide-in panel anchored to any edge of the viewport — backed by shadcn/ui's
Sheet component (Radix Dialog under the hood).

Supports four sides (\`right\`, \`left\`, \`top\`, \`bottom\`), optional header,
optional footer, and both trigger-driven and fully programmatic (controlled)
open/close.

Unlike Drawer (Vaul-based, optimised for touch), Sheet is modal-dialog-based:
clicking outside or pressing Escape dismisses it, and it fires standard
accessibility events.
  `.trim(),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props: any) =>
    Sheet({
      ...props,
      id: "playground-sheet-preview",
      trigger: Button({label: "Open Sheet", opts: {variant: "default"}}),
      content: Button({label: "Sheet Content", opts: {variant: "ghost"}}),
    }),

  defaultProps: {
    id: "preview",
    title: "Sheet Title",
    description: "Optional description below the title.",
    content: "playground/sheet-content",
    side: "right",
  },

  facets: [
    {
      id: "right",
      title: "Right (default)",
      description: "Slides in from the right — ideal for detail/settings panels.",
      props: {
        id: "right",
        trigger: "myApp/open-button",
        content: "myApp/sheet-content",
        title: "Settings",
        side: "right",
      },
    },
    {
      id: "left",
      title: "Left",
      description: "Slides in from the left — great for navigation drawers.",
      props: {
        id: "left",
        trigger: "myApp/open-button",
        content: "myApp/sheet-content",
        title: "Navigation",
        side: "left",
      },
    },
    {
      id: "bottom",
      title: "Bottom",
      description: "Slides up from the bottom — useful for mobile action sheets.",
      props: {
        id: "bottom",
        trigger: "myApp/open-button",
        content: "myApp/sheet-content",
        title: "Actions",
        side: "bottom",
      },
    },
    {
      id: "controlled",
      title: "Controlled",
      description: "Visibility driven by the `open` prop. Wire `onClosed` to reset the flag.",
      props: {
        id: "controlled",
        open: false,
        content: "myApp/sheet-content",
        title: "Controlled Sheet",
      },
    },
  ],

  controls: [
    {prop: "title", type: "text", label: "Title", placeholder: "Sheet title…"},
    {prop: "description", type: "text", label: "Description", placeholder: "Optional subtitle…"},
    {prop: "side", type: "token", label: "Side", options: ["right", "left", "top", "bottom"]},
    {prop: "footerCloseButtonText", type: "text", label: "Close button text"},
  ],

  registerEvents: (r, logEvent) => {
    onSheetOpened(r, (state, ev) => {
      logEvent(state, "onSheetOpened", {id: ev.id});
    });
    onSheetClosed(r, (state, ev) => {
      logEvent(state, "onSheetClosed", {id: ev.id, reason: ev.reason});
    });
    onSheetOpenChanged(r, (state, ev) => {
      logEvent(state, "onSheetOpenChanged", {open: ev.open, id: ev.id});
    });
  },

  note: `
**Trigger-driven** sheet:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Sheet, onSheetClosed} from "@pihanga2/shadcn";
import {Button} from "@pihanga2/shadcn";

register((r) => {
  onSheetClosed(r, (state, {id}) => {
    if (id === "settings") state.settingsOpen = false;
  });
});

registerCard("myApp/settingsSheet", Sheet({
  id:          "settings",
  trigger:     Button({label: "Settings", opts: {variant: "outline"}}),
  content:     "myApp/settingsContent",
  title:       "Settings",
  description: "Adjust your preferences.",
  side:        "right",
}));
\`\`\`

**Programmatic** (controlled via state):

\`\`\`ts
registerCard("myApp/sheet", Sheet({
  open:    memo((s: AppState) => s.sheetOpen),
  content: "myApp/sheetContent",
  title:   "Details",
  side:    "right",
}));
\`\`\`
  `.trim(),
});
