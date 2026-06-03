/**
 * Playground definition for the `shad/mode-toggle` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {ModeToggle, onModeToggleChanged, type ModeToggleProps} from "./index";

export default definePlayground<ModeToggleProps>({
  cardId: "shad/mode-toggle",
  title: "Mode Toggle",

  introduction: `
A dropdown button that switches the application colour scheme between
**light**, **dark**, and **system** modes.

Place it once in your app header (e.g. inside \`PageWithNavbar\`'s
\`headerRightCard\`) to give users a global theme selector.

The button's appearance is controlled by \`variant\` (defaults to
\`"outline"\`).  The selected mode is persisted to \`localStorage\` under the
key \`"shadcn-ui-theme"\` by the \`ThemeProvider\` wrapper in the Framework card.
  `.trim(),

  preview: (props) => ModeToggle(props),

  defaultProps: {
    variant: "outline",
  },

  facets: [
    {
      id: "outline",
      title: "Outline",
      description:
        "Bordered button — the default style, works well in most headers.",
      props: {variant: "outline"},
    },
    {
      id: "ghost",
      title: "Ghost",
      description: "No background — blends into toolbars and sidebars.",
      props: {variant: "ghost"},
    },
    {
      id: "secondary",
      title: "Secondary",
      description: "Muted filled button — subtle but still visible.",
      props: {variant: "secondary"},
    },
  ],

  controls: [
    {
      prop: "variant",
      type: "token",
      label: "Variant",
      options: ["default", "secondary", "destructive", "outline", "ghost"],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. ml-2",
    },
  ],

  registerEvents: (r, logEvent) => {
    onModeToggleChanged(r, (state, ev) => {
      logEvent(state, "onModeToggleChanged", {mode: ev.mode});
    });
  },

  note: `
Add the mode toggle to the app header via \`PageWithNavbar\`:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {ModeToggle} from "@/cards/modeToggle";
import {PageWithNavbar} from "@/cards/pageWithNavbar";

registerCard("myApp/modeToggle", ModeToggle({
  variant: "outline",
}));

registerCard("myApp/page", PageWithNavbar({
  title:           "My App",
  main:            "myApp/content",
  headerRightCard: "myApp/modeToggle",
}));
\`\`\`

React to mode changes in a reducer:

\`\`\`ts
import {register} from "@pihanga2/core";
import {onModeToggleChanged} from "@/cards/modeToggle";

register((r) => {
  onModeToggleChanged(r, (state, {mode}) => {
    state.theme = mode;
  });
});
\`\`\`
  `.trim(),
});
