/**
 * Playground definition for the `shad/slider` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Slider,
  onSliderChanged,
  onSliderCommitted,
  type PiSliderProps,
} from "./index";

export default definePlayground<PiSliderProps>({
  cardId: "shad/slider",
  title: "Slider",

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
    className: "w-full",
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
        "suppressChangedEvents=true silences all onSliderChanged actions during drag.  Only onSliderCommitted fires (on mouse-up).  Ideal for expensive handlers such as API calls that should never run mid-drag.",
      props: {
        defaultValue: 70,
        selfManaged: true,
        suppressChangedEvents: true,
        label: "Commit on release",
      },
    },
    {
      id: "ticks",
      title: "With ticks",
      description:
        "showTicks=true renders tick marks and labels below the track.  Major ticks are taller and labelled; minor ticks are shorter.  The default majorTickStep is (max−min)/5.",
      props: {
        value: 40,
        min: 0,
        max: 100,
        step: 5,
        tickStep: 5,
        majorTickStep: 25,
        showTicks: true,
        selfManaged: true,
        label: "Volume",
      },
    },
    {
      id: "ticks-no-labels",
      title: "Ticks, no labels",
      description:
        "suppressTickLabels=true shows only tick marks — no numeric or custom labels at all.",
      props: {
        value: 40,
        min: 0,
        max: 100,
        step: 5,
        tickStep: 5,
        majorTickStep: 25,
        showTicks: true,
        suppressTickLabels: true,
        selfManaged: true,
        label: "Volume",
      },
    },
    {
      id: "ticks-minor-labels",
      title: "Minor ticks with labels",
      description:
        "majorTickStep=0 hides major ticks; minor ticks are shown and, since there are no major ticks to carry labels, every minor tick gets a label instead.",
      props: {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        tickStep: 1,
        majorTickStep: 0,
        showTicks: true,
        selfManaged: true,
        label: "Rating",
      },
    },
    {
      id: "ticks-custom-labels",
      title: "Ticks with custom labels",
      description:
        "tickLabels overrides the default numeric label for specific values — handy for named presets like Eco / Mid / Turbo.",
      props: {
        value: 10,
        min: 0,
        max: 20,
        step: 1,
        tickStep: 1,
        majorTickStep: 10,
        showTicks: true,
        selfManaged: true,
        tickLabels: {0: "Eco", 10: "Mid", 20: "Turbo"},
        label: "Mode",
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
    {prop: "showTicks", type: "boolean", label: "Show ticks"},
    {prop: "tickStep", type: "number", label: "Tick step"},
    {prop: "majorTickStep", type: "number", label: "Major tick step"},
    {
      prop: "suppressTickLabels",
      type: "boolean",
      label: "Suppress tick labels",
    },
  ],

  registerEvents: (r, logEvent) => {
    onSliderChanged(r, (state, ev) => {
      logEvent(state, "onSliderChanged", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
    onSliderCommitted(r, (state, ev) => {
      logEvent(state, "onSliderCommitted", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
  },

  note: `
**Controlled (external state)**

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {Slider, onSliderChanged, onSliderCommitted} from "@/cards/slider";
import type {AppState} from "@/app.state";

register((r) => {
  // Option A: every drag position
  onSliderChanged(r, (state: AppState, {name, value}) => {
    if (name === "volume") state.volume = value;
  });

  // Option B: only on release (slide end)
  onSliderCommitted(r, (state: AppState, {name, value}) => {
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

---

**Tick marks**

Enable tick marks by setting \`showTicks: true\`.  All tick props are optional.

| Prop | Default | Effect |
|---|---|---|
| \`showTicks\` | \`false\` | Show/hide the tick strip |
| \`tickStep\` | \`step\` | Spacing between minor (short) tick marks.  \`0\` = no minor ticks |
| \`majorTickStep\` | \`(max−min)/5\` rounded to \`tickStep\` | Spacing between major (tall, labelled) ticks.  \`0\` = no major ticks |
| \`suppressTickLabels\` | \`false\` | Hide all labels (marks only) |
| \`tickLabels\` | — | Override label text keyed by value |

**Tick modes at a glance**

\`\`\`
tickStep > 0, majorTickStep > 0   →  minor + major ticks, labels on major
tickStep > 0, majorTickStep = 0   →  minor ticks only, labels on every minor tick
tickStep = 0, majorTickStep > 0   →  major ticks only (auto-calc from step if not set)
tickStep = 0, majorTickStep = 0   →  nothing shown
suppressTickLabels = true         →  tick marks only, no labels
\`\`\`

Example — named presets (Eco / Mid / Turbo):

\`\`\`ts
Slider({
  min: 0, max: 20, step: 1,
  showTicks: true,
  tickStep: 1, majorTickStep: 10,
  tickLabels: {0: "Eco", 10: "Mid", 20: "Turbo"},
  selfManaged: true,
  label: "Mode",
})
\`\`\`
  `.trim(),
});
