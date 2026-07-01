/**
 * Playground definition for the `shad/mode-toggle` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {ModeToggle, onModeToggleChanged, type ModeToggleProps} from "./index";

export default definePlayground<ModeToggleProps>({
  cardId: "shad/mode-toggle",
  title: "Mode Toggle",

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
