/**
 * Playground definition for the `shad/resizable` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Resizable, type ResizableProps} from "./index";

export default definePlayground<ResizableProps>({
  cardId: "shad/resizable",
  title: "Resizable",

  preview: (props) => Resizable(props),

  defaultProps: {
    content: [
      {name: "left", content: "pi/empty", defaultSize: 50},
      {name: "right", content: "pi/empty", defaultSize: 50},
    ],
    direction: "horizontal",
    handles: {withHandle: true},
  },

  facets: [
    {
      id: "horizontal",
      title: "Horizontal",
      description: "Two side-by-side panels with a draggable vertical divider.",
      props: {
        content: [
          {name: "left", content: "pi/empty", defaultSize: 50},
          {name: "right", content: "pi/empty", defaultSize: 50},
        ],
        direction: "horizontal",
        handles: {withHandle: true},
      },
    },
    {
      id: "vertical",
      title: "Vertical",
      description: "Two stacked panels with a draggable horizontal divider.",
      props: {
        content: [
          {name: "top", content: "pi/empty", defaultSize: 50},
          {name: "bottom", content: "pi/empty", defaultSize: 50},
        ],
        direction: "vertical",
        handles: {withHandle: true},
      },
    },
    {
      id: "three-panels",
      title: "Three panels",
      description: "Three panels with independent resize handles.",
      props: {
        content: [
          {name: "left", content: "pi/empty", defaultSize: 20, minSize: 15},
          {name: "center", content: "pi/empty", defaultSize: 60},
          {name: "right", content: "pi/empty", defaultSize: 20, minSize: 15},
        ],
        direction: "horizontal",
        handles: {withHandle: true},
      },
    },
    {
      id: "collapsible",
      title: "Collapsible panel",
      description:
        "Left panel can be collapsed to zero width by dragging past its minimum.",
      props: {
        content: [
          {
            name: "sidebar",
            content: "pi/empty",
            defaultSize: 25,
            minSize: 0,
            collapsible: true,
          },
          {name: "main", content: "pi/empty", defaultSize: 75},
        ],
        direction: "horizontal",
        handles: {withHandle: true},
      },
    },
  ],

  controls: [
    {
      prop: "direction",
      type: "token",
      label: "Direction",
      options: ["horizontal", "vertical"],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. h-96",
    },
  ],

  note: `
Build a classic sidebar + main layout with a collapsible sidebar:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Resizable} from "@/cards/resizable";

registerCard("myApp/splitView", Resizable({
  direction: "horizontal",
  handles:   {withHandle: true},
  content:   [
    {
      name:        "sidebar",
      content:     "myApp/sidebar",
      defaultSize: 25,
      minSize:     15,
      maxSize:     40,
      collapsible: true,
    },
    {
      name:        "main",
      content:     "myApp/mainContent",
      defaultSize: 75,
    },
  ],
}));
\`\`\`
  `.trim(),
});
