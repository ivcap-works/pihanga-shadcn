/**
 * Playground definition for the `shad/observable` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Observable,
  onObservableClicked,
  onObservableMouseEnter,
  onObservableMouseLeave,
  onObservableMouseMove,
  onObservableDoubleClicked,
  onObservableKeyDown,
  type ObservableProps,
} from "./index";

export default definePlayground<ObservableProps>({
  cardId: "shad/observable",
  title: "Observable",

  introduction: `
A transparent wrapper \`<div>\` around a single \`content\` card that reports
low-level DOM interaction events: clicks, double-clicks, mouse down/up,
mouse enter/move/leave, context menu, wheel, key down/up, and focus/blur.

Every event type is opt-in via the \`enable\` prop — an event that is not
enabled is neither listened for nor reported, so there is zero overhead for
events you don't need.

All mouse/wheel events report pointer position both **absolutely** (relative
to the top-left of the page, i.e. \`absoluteX\`/\`absoluteY\`) and **relatively**
(relative to the card's own top-left corner, i.e. \`relativeX\`/\`relativeY\`).

Use \`Observable\` to add interaction telemetry, custom drag/gesture logic, or
hover-driven UI to any existing card without modifying that card itself —
just wrap it.
  `.trim(),

  preview: (props) => Observable(props),

  defaultProps: {
    content: undefined,
    enable: {clicked: true, mouseEnter: true, mouseLeave: true},
    className:
      "border border-dashed border-muted-foreground p-8 rounded text-center",
  },

  facets: [
    {
      id: "click-only",
      title: "Click only",
      description: "Only the click event is captured and reported.",
      props: {enable: {clicked: true}},
    },
    {
      id: "hover-tracking",
      title: "Hover tracking",
      description:
        "Track mouse enter/move/leave — useful for custom hover UIs or heatmaps.",
      props: {enable: {mouseEnter: true, mouseMove: true, mouseLeave: true}},
    },
    {
      id: "full-mouse",
      title: "Full mouse events",
      description:
        "All mouse-related events enabled: click, double-click, down/up, enter/move/leave, context menu, wheel.",
      props: {
        enable: {
          clicked: true,
          doubleClicked: true,
          mouseDown: true,
          mouseUp: true,
          mouseEnter: true,
          mouseMove: true,
          mouseLeave: true,
          contextMenu: true,
          wheel: true,
        },
      },
    },
    {
      id: "keyboard",
      title: "Keyboard events",
      description:
        "Key down/up and focus/blur — the wrapper becomes focusable (tabIndex 0) automatically.",
      props: {
        enable: {keyDown: true, keyUp: true, focus: true, blur: true},
      },
    },
  ],

  controls: [
    {prop: "enable.clicked", type: "boolean", label: "Enable clicked"},
    {
      prop: "enable.doubleClicked",
      type: "boolean",
      label: "Enable doubleClicked",
    },
    {prop: "enable.mouseDown", type: "boolean", label: "Enable mouseDown"},
    {prop: "enable.mouseUp", type: "boolean", label: "Enable mouseUp"},
    {prop: "enable.mouseEnter", type: "boolean", label: "Enable mouseEnter"},
    {prop: "enable.mouseMove", type: "boolean", label: "Enable mouseMove"},
    {prop: "enable.mouseLeave", type: "boolean", label: "Enable mouseLeave"},
    {
      prop: "enable.contextMenu",
      type: "boolean",
      label: "Enable contextMenu",
    },
    {prop: "enable.wheel", type: "boolean", label: "Enable wheel"},
    {prop: "enable.keyDown", type: "boolean", label: "Enable keyDown"},
    {prop: "enable.keyUp", type: "boolean", label: "Enable keyUp"},
    {prop: "enable.focus", type: "boolean", label: "Enable focus"},
    {prop: "enable.blur", type: "boolean", label: "Enable blur"},
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. border rounded",
    },
  ],

  registerEvents: (r, logEvent) => {
    onObservableClicked(r, (state, ev) => {
      logEvent(state, "onClicked", {
        absoluteX: ev.absoluteX,
        absoluteY: ev.absoluteY,
        relativeX: ev.relativeX,
        relativeY: ev.relativeY,
      });
    });
    onObservableDoubleClicked(r, (state, ev) => {
      logEvent(state, "onDoubleClicked", {
        relativeX: ev.relativeX,
        relativeY: ev.relativeY,
      });
    });
    onObservableMouseEnter(r, (state, ev) => {
      logEvent(state, "onMouseEnter", {
        relativeX: ev.relativeX,
        relativeY: ev.relativeY,
      });
    });
    onObservableMouseMove(r, (state, ev) => {
      logEvent(state, "onMouseMove", {
        relativeX: ev.relativeX,
        relativeY: ev.relativeY,
      });
    });
    onObservableMouseLeave(r, (state, ev) => {
      logEvent(state, "onMouseLeave", {
        relativeX: ev.relativeX,
        relativeY: ev.relativeY,
      });
    });
    onObservableKeyDown(r, (state, ev) => {
      logEvent(state, "onKeyDown", {key: ev.key, code: ev.code});
    });
  },

  note: `
Wrap any card's content and selectively enable the interaction events you need:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Observable, onObservableClicked, onObservableMouseMove} from "@/cards/observable";

register((r) => {
  onObservableClicked(r, (state, {id, relativeX, relativeY}) => {
    state.lastClick = {id, relativeX, relativeY};
  });

  onObservableMouseMove(r, (state, {absoluteX, absoluteY}) => {
    state.cursor = {absoluteX, absoluteY};
  });
});

registerCard("myApp/trackedCard", Observable({
  id:      "hero-image",
  content: "myApp/heroImage",
  enable:  {clicked: true, mouseMove: true},
}));
\`\`\`
  `.trim(),
});
