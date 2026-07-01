import {
  ToggleGroup,
  onPiToggleGroupChanged,
  type PiToggleGroupProps,
} from "./index";
import {definePlayground} from "@/playground/definePlayground";

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<PiToggleGroupProps>({
  cardId: "pi/toggle-group",
  title: "Toggle Group",

  preview: (props) => ToggleGroup(props),

  defaultProps: {
    items: [
      {value: "bold", label: "Bold"},
      {value: "italic", label: "Italic"},
      {value: "underline", label: "Underline"},
    ],
    type: "single",
    value: "bold",
    selfManaged: true,
    variant: "outline",
    size: "default",
    spacing: 0,
  },

  facets: [
    {
      id: "single",
      title: "Single",
      description:
        "Only one item can be active at a time — behaves like a radio group.",
      props: {
        items: [
          {value: "left", label: "Left"},
          {value: "center", label: "Center"},
          {value: "right", label: "Right"},
        ],
        type: "single",
        value: "left",
        selfManaged: true,
        variant: "outline",
        spacing: 0,
      },
    },
    {
      id: "multiple",
      title: "Multiple",
      description:
        "Any number of items can be active simultaneously — behaves like checkboxes.",
      props: {
        items: [
          {value: "bold", label: "Bold"},
          {value: "italic", label: "Italic"},
          {value: "underline", label: "Underline"},
        ],
        type: "multiple",
        value: ["bold", "italic"],
        selfManaged: true,
        variant: "outline",
        spacing: 0,
      },
    },
    {
      id: "spaced",
      title: "Spaced",
      description: "Buttons are separated — set `spacing` to a positive value.",
      props: {
        items: [
          {value: "day", label: "Day"},
          {value: "week", label: "Week"},
          {value: "month", label: "Month"},
        ],
        type: "single",
        value: "week",
        selfManaged: true,
        variant: "outline",
        spacing: 1,
      },
    },
    {
      id: "default-variant",
      title: "Default variant",
      description:
        "The `default` variant has no border; active items use the accent colour.",
      props: {
        items: [
          {value: "grid", label: "Grid"},
          {value: "list", label: "List"},
        ],
        type: "single",
        value: "grid",
        selfManaged: true,
        variant: "default",
        spacing: 0,
      },
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Entire group is disabled.",
      props: {
        items: [
          {value: "a", label: "Option A"},
          {value: "b", label: "Option B"},
        ],
        type: "single",
        value: "a",
        selfManaged: true,
        variant: "outline",
        disabled: true,
      },
    },
  ],

  controls: [
    {
      prop: "type",
      type: "token",
      label: "Type",
      options: ["single", "multiple"],
    },
    {
      prop: "variant",
      type: "token",
      label: "Variant",
      options: ["default", "outline"],
    },
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["sm", "default", "lg"],
    },
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {prop: "disabled", type: "boolean", label: "Disabled"},
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever any toggle button is clicked in the live preview.
    onPiToggleGroupChanged(r, (state, ev) => {
      logEvent(state, "onPiToggleGroupChanged", {
        name: ev.name,
        value: ev.value,
      });
    });
  },

  note: `
**Self-managed** (no external state needed):

\`\`\`ts
registerCard("myApp/textFormatGroup", ToggleGroup({
  type: "multiple",
  selfManaged: true,
  value: ["bold"],           // initial selection
  items: [
    {value: "bold",      label: "Bold"},
    {value: "italic",    label: "Italic"},
    {value: "underline", label: "Underline"},
  ],
  variant: "outline",
}));
\`\`\`

**Externally controlled** (state lives in the Redux store):

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {ToggleGroup, onPiToggleGroupChanged} from "@/cards/toggleGroup";

register((r) => {
  onPiToggleGroupChanged(r, (state, {name, value}) => {
    if (name === "textFormat") {
      state.textFormat = value;   // string (single) or string[] (multiple)
    }
  });
});

registerCard("myApp/textFormatGroup", ToggleGroup({
  name: "textFormat",
  type: "multiple",
  items: [
    {value: "bold",      label: "Bold"},
    {value: "italic",    label: "Italic"},
    {value: "underline", label: "Underline"},
  ],
  variant: "outline",
}));
\`\`\`
  `.trim(),
});
