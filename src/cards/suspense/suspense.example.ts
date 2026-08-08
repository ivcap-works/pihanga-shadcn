/**
 * Playground definition for the `shad/suspense` card.
 *
 * NOTE: In the playground we can't demonstrate true async suspension
 * (no lazy-loaded card), so we show the skeleton fallback directly by
 * rendering the card with a non-existent content reference, which leaves
 * the Suspense boundary in its fallback state.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Suspense, type SuspenseProps} from "./index";

export default definePlayground<SuspenseProps>({
  cardId: "shad/suspense",
  title: "Suspense",

  preview: (props) => Suspense(props),

  defaultProps: {
    content: "__suspense_demo_placeholder__",
    rows: 3,
    rowSize: "md",
    spacing: "md",
  },

  facets: [
    {
      id: "default-skeleton",
      title: "Default skeleton fallback",
      description:
        "When content suspends the built-in shimmer skeleton is shown.",
      props: {content: "__suspense_demo_placeholder__", rows: 3, rowSize: "md"},
    },
    {
      id: "large-rows",
      title: "Large skeleton rows",
      description: "Tall rows for editor or graph placeholders.",
      props: {
        content: "__suspense_demo_placeholder__",
        rows: 4,
        rowSize: "lg",
        spacing: "lg",
      },
    },
    {
      id: "xl-rows",
      title: "XL skeleton rows",
      description: "Very tall rows — e.g. image thumbnails or hero sections.",
      props: {
        content: "__suspense_demo_placeholder__",
        rows: 2,
        rowSize: "xl",
        spacing: "lg",
      },
    },
  ],

  controls: [
    {
      prop: "rowSize",
      type: "token",
      label: "Row size",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      prop: "spacing",
      type: "token",
      label: "Spacing",
      options: ["sm", "md", "lg"],
    },
    {prop: "rows", type: "text", label: "Row count", placeholder: "3"},
    {
      prop: "rowClassName",
      type: "text",
      label: "Row classes",
      placeholder: "overrides rowSize",
    },
    {
      prop: "className",
      type: "text",
      label: "Wrapper classes",
      placeholder: "overrides spacing",
    },
  ],

  note: `
**Step 1 — lazy-register the heavy card component:**

\`\`\`ts
import React from "react";
import {registerCardComponent} from "@pihanga2/core";
import {MY_HEAVY_CARD} from "./myHeavyCard.types";

const MyHeavyComponent = React.lazy(() =>
  import("./myHeavyCard.component")
    .then(m => ({ default: m.MyHeavyComponent }))
);

registerCardComponent({ name: MY_HEAVY_CARD, component: MyHeavyComponent });
\`\`\`

**Step 2 — wrap it with \`PiSuspense\` (default skeleton fallback):**

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {PiSuspense} from "@/cards/suspense";

registerCard("myApp/editorSection", PiSuspense({
  content: "myApp/codeEditor",
  rows:    5,
  rowSize: "lg",
}));
\`\`\`

**Or use a custom fallback card:**

\`\`\`ts
registerCard("myApp/graphSection", PiSuspense({
  content:  "myApp/graphView",
  fallback: "myApp/graphPlaceholder",
}));
\`\`\`
  `.trim(),
});
