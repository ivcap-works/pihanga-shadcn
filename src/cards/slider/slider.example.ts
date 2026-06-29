/**
 * Playground definition for the `shad/slider` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Slider,
  onPiSliderChanged,
  onPiSliderCommitted,
  type PiSliderProps,
} from "./index";

export default definePlayground<PiSliderProps>({
  cardId: "shad/slider",
  title: "Slider",

  introduction: `
An interactive range slider built on the [Radix UI Slider](https://www.radix-ui.com/primitives/docs/components/slider) primitive.

Use it to let users select a numeric value within a bounded range (e.g. volume, opacity, price).
When placed inside a \`pi/form\` card with a \`name\` prop, the slider reads its value from form
state and writes back via \`form.handleChange\`.  In standalone mode, handle changes with
\`onPiSliderChanged\`.

**Controlling event frequency**

By default \`onPiSliderChanged\` fires on every drag position.  Two props let you reduce that:

- \`debounceMs\` — coalesces \`onChanged\` events; only the last value in each quiet window is
  dispatched.  The thumb still moves immediately.
- \`onCommitted\` / \`onPiSliderCommitted\` — fires exactly once when the user releases the thumb
  (mouse-up / touch-end).  Use this when only the final settled value matters.

Both can be combined: \`debounceMs\` throttles \`onChanged\` during drag while \`onPiSliderCommitted\`
delivers the definitive final value.

Set \`selfManaged: true\` to have the slider maintain its own internal value — the thumb moves
immediately without an external state update.

An optional \`label\` is rendered above the track with the current value shown on the right,
keeping the layout consistent with the read-only \`shad/slider-value\` card.
  `.trim(),

  preview: (props) => Slider(props),

  defaultProps: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    label: "Volume",
    selfManaged: false,
    debounceMs: 0,
    suppressChangedEvents: false,
    disabled: false,
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description:
        "A labelled slider in its default interactive state.  Drag the thumb or click the track to change the value.",
      props: {value: 40, min: 0, max: 100, step: 1, label: "Volume"},
    },
    {
      id: "no-label",
      title: "No label",
      description:
        "Slider without a label — useful inside compact layouts or when the context is self-evident.",
      props: {value: 60, min: 0, max: 100},
    },
    {
      id: "stepped",
      title: "Stepped",
      description:
        "A stepped slider snapping to multiples of 10 — useful for coarse adjustments such as brightness levels.",
      props: {value: 30, min: 0, max: 100, step: 10, label: "Brightness"},
    },
    {
      id: "custom-range",
      title: "Custom range",
      description:
        "Slider with a custom min/max range — here a temperature selector from −20 to 40.",
      props: {value: 20, min: -20, max: 40, step: 1, label: "Temperature (°C)"},
    },
    {
      id: "self-managed",
      title: "Self-managed",
      description:
        "With selfManaged=true the slider tracks its own value internally — no external state update needed.  onChanged still fires so you can react or log.",
      props: {defaultValue: 25, selfManaged: true, label: "Balance"},
    },
    {
      id: "debounced",
      title: "Debounced",
      description:
        "debounceMs=300 coalesces onChanged events — only the last value in each 300 ms quiet window is dispatched while the thumb moves smoothly.  Watch the Events panel: onChanged fires once per quiet window; onCommitted fires on mouse-up.",
      props: {
        defaultValue: 50,
        selfManaged: true,
        debounceMs: 300,
        label: "Debounced (300 ms)",
      },
    },
    {
      id: "committed-only",
      title: "Committed only",
      description:
        "suppressChangedEvents=true silences all onPiSliderChanged actions during drag.  Only onPiSliderCommitted fires (on mouse-up).  Ideal for expensive handlers such as API calls that should never run mid-drag.",
      props: {
        defaultValue: 70,
        selfManaged: true,
        suppressChangedEvents: true,
        label: "Commit on release",
      },
    },
    {
      id: "disabled",
      title: "Disabled",
      description:
        "Non-interactive state.  Use when the value is fixed or editing is not permitted in the current context.",
      props: {value: 55, min: 0, max: 100, label: "Level", disabled: true},
    },
  ],

  controls: [
    {prop: "value", type: "number", label: "Value"},
    {prop: "min", type: "number", label: "Min"},
    {prop: "max", type: "number", label: "Max"},
    {prop: "step", type: "number", label: "Step"},
    {prop: "debounceMs", type: "number", label: "Debounce ms"},
    {prop: "label", type: "text", label: "Label", placeholder: "e.g. Volume"},
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {
      prop: "suppressChangedEvents",
      type: "boolean",
      label: "Suppress changed events",
    },
    {prop: "disabled", type: "boolean", label: "Disabled"},
  ],

  registerEvents: (r, logEvent) => {
    onPiSliderChanged(r, (state, ev) => {
      logEvent(state, "onPiSliderChanged", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
    onPiSliderCommitted(r, (state, ev) => {
      logEvent(state, "onPiSliderCommitted", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
  },

  note: `
**Controlled (external state)**

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {Slider, onPiSliderChanged, onPiSliderCommitted} from "@/cards/slider";
import type {AppState} from "@/app.state";

register((r) => {
  // Option A: every drag position
  onPiSliderChanged(r, (state: AppState, {name, value}) => {
    if (name === "volume") state.volume = value;
  });

  // Option B: only on release (slide end)
  onPiSliderCommitted(r, (state: AppState, {name, value}) => {
    if (name === "volume") state.volume = value;
  });
});

registerCard("myApp/volumeSlider", Slider({
  name:  "volume",
  value: memo((s: AppState) => s.volume),
  min:   0,
  max:   100,
  label: "Volume",
}));
\`\`\`

**Self-managed with debounce** — no external state needed, but still notifies on change:

\`\`\`ts
registerCard("myApp/opacitySlider", Slider({
  defaultValue: 80,
  selfManaged:  true,
  debounceMs:   200,   // max 5 events/sec during drag
  label:        "Opacity",
}));
\`\`\`

**Inside a \`pi/form\` card** — pass only \`name\`:

\`\`\`ts
registerCard("myApp/settingsForm", Form({
  initialValues: {brightness: 75},
  content: [
    Slider({name: "brightness", min: 0, max: 100, label: "Brightness"}),
  ],
}));
\`\`\`
  `.trim(),
});
