import {definePlayground} from "@/playground/definePlayground";
import {JsonViewer, type JsonViewerProps} from "./index";

export default definePlayground<JsonViewerProps>({
  cardId: "json-viewer",
  title: "JSON Viewer",

  preview: (props) => JsonViewer(props),

  defaultProps: {
    source: {
      name: "Alice",
      age: 30,
      active: true,
      address: {street: "123 Main St", city: "Springfield"},
      tags: ["admin", "editor"],
    },
    collapsed: 1,
    copyToClipboard: true,
  },

  facets: [
    {
      id: "copy-to-clipboard",
      title: "Copy to clipboard",
      description:
        "Hover over the viewer to reveal the copy icon in the top-right corner. Clicking it copies the pretty-printed JSON to the clipboard. The icon briefly changes to a green check mark on success.",
      props: {
        source: {
          name: "Alice",
          age: 30,
          active: true,
          address: {street: "123 Main St", city: "Springfield"},
          tags: ["admin", "editor"],
        },
        collapsed: 1,
        copyToClipboard: true,
      },
    },
    {
      id: "collapsed-1",
      title: "Root expanded (collapsed: 1)",
      description:
        "Only the root level is expanded by default. Click a key to expand nested objects.",
      props: {
        source: {
          name: "Alice",
          age: 30,
          active: true,
          address: {street: "123 Main St", city: "Springfield"},
          tags: ["admin", "editor"],
        },
        collapsed: 1,
      },
    },
    {
      id: "all-expanded",
      title: "All expanded (collapsed: false)",
      description: "Every node is expanded on initial render.",
      props: {
        source: {
          id: "abc-123",
          status: "running",
          metrics: {cpu: 0.42, memory: 1024},
        },
        collapsed: false,
      },
    },
    {
      id: "array",
      title: "Array source",
      description: "Works with top-level arrays too.",
      props: {
        source: [
          {id: 1, label: "First"},
          {id: 2, label: "Second"},
          {id: 3, label: "Third"},
        ],
        collapsed: 1,
      },
    },
  ],

  controls: [
    {
      prop: "collapsed",
      type: "token",
      label: "Collapsed depth",
      options: ["false", "true", "1", "2"],
    },
    {
      prop: "copyToClipboard",
      type: "boolean",
      label: "Copy to clipboard",
    },
    {
      prop: "copyIcon",
      type: "text",
      label: "Copy icon name",
      placeholder: "e.g. save (registry name; blank = Lucide Copy)",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. text-sm font-mono",
    },
  ],

  note: `
Inside \`app.pihanga.ts\`, use \`JsonViewer\` to embed live data:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {JsonViewer} from "@/cards/jsonViewer";
import type {AppState} from "@/app.state";

registerCard("myApp/debugPanel", JsonViewer({
  source: memo((s: AppState) => s.selectedItem),
  collapsed: 1,
  copyToClipboard: true,
}));
\`\`\`
  `.trim(),
});
