/**
 * Playground definition for the `shad/box` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Box} from "./index";
import type {BoxProps} from "./box.types";

export default definePlayground<BoxProps>({
  cardId: "shad/box",
  title: "Box",

  preview: (props) => Box(props),

  defaultProps: {
    content: [],
    className: "border border-dashed border-muted-foreground p-4 rounded",
  },

  facets: [
    {
      id: "empty",
      title: "Empty",
      description: "An unstyled empty container — the base for custom layouts.",
      props: {content: [], className: "bg-blue-500/50"},
    },
    {
      id: "with-padding",
      title: "With padding",
      description: "Padded box — use for inset content regions.",
      props: {
        content: [],
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        className: "border rounded bg-blue-500/50",
      },
    },
    {
      id: "fixed-size",
      title: "Fixed size",
      description:
        "Box with explicit pixel dimensions — useful for thumbnail slots.",
      props: {
        content: [],
        width: 120,
        height: 80,
        className: "border rounded bg-blue-500/50",
      },
    },
    {
      id: "with-margin",
      title: "With margin",
      description:
        "Outer margin pushes the box away from surrounding elements. " +
        "All four sides are demonstrated here — the muted preview background " +
        "is visible through each margin gap.",
      props: {
        content: [],
        width: 220,
        height: 60,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 32,
        marginRight: 32,
        className: "border border-dashed rounded bg-blue-500/50",
      },
    },
  ],

  controls: [
    {prop: "width", type: "text", label: "Width (px)", placeholder: "e.g. 120"},
    {
      prop: "height",
      type: "text",
      label: "Height (px)",
      placeholder: "e.g. 80",
    },
    {
      prop: "paddingTop",
      type: "text",
      label: "Padding top (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "paddingBottom",
      type: "text",
      label: "Padding bottom (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "paddingLeft",
      type: "text",
      label: "Padding left (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "paddingRight",
      type: "text",
      label: "Padding right (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "marginTop",
      type: "text",
      label: "Margin top (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "marginBottom",
      type: "text",
      label: "Margin bottom (px)",
      placeholder: "e.g. 16",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. border rounded",
    },
  ],

  note: `
Use \`Box\` to add spacing between cards in a \`Stack\` layout:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Box} from "@/cards/box";
import {Stack} from "@/cards/stack";

// A fixed-height spacer
registerCard("myApp/spacer", Box({height: 24}));

// A padded content region
registerCard("myApp/contentRegion", Box({
  content:       ["myApp/card1", "myApp/card2"],
  paddingTop:    16,
  paddingBottom: 16,
  paddingLeft:   24,
  paddingRight:  24,
  className:     "rounded-lg border bg-card",
}));

registerCard("myApp/page", Stack({
  direction: "column",
  spacing:   4,
  content:   ["myApp/header", "myApp/contentRegion", "myApp/footer"],
}));
\`\`\`
  `.trim(),
});
