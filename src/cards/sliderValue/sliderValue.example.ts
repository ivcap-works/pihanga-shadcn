/**
 * Playground definition for the `shad/slider-value` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {SliderValue, type PiSliderValueProps} from "./index";

export default definePlayground<PiSliderValueProps>({
  cardId: "shad/slider-value",
  title: "Slider Value",

  introduction: `
A read-only companion to the interactive \`shad/slider\` card.

Renders the same track + filled-range visual as the slider but without a thumb
and without any user interaction.  The fill width is proportional to \`value\`
within the \`[min, max]\` range, so both cards look visually consistent side by
side or in alternating read/edit contexts.

Use \`shad/slider-value\` in summary panels, data tables, or anywhere you want
to display a bounded numeric value at a glance without allowing edits.
  `.trim(),

  preview: (props) => SliderValue(props),

  defaultProps: {
    value: 65,
    min: 0,
    max: 100,
    label: "Progress",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description:
        "A labelled read-only slider showing a value of 65 out of 100.",
      props: {value: 65, min: 0, max: 100, label: "Progress"},
    },
    {
      id: "no-label",
      title: "No label",
      description:
        "Track-only display without a label — useful in compact cells or icon grids.",
      props: {value: 40, min: 0, max: 100},
    },
    {
      id: "custom-range",
      title: "Custom range",
      description:
        "Display a value within a custom min/max — here a score from 0 to 10.",
      props: {value: 7, min: 0, max: 10, label: "Score"},
    },
    {
      id: "full",
      title: "Full",
      description: "Value at maximum — track completely filled.",
      props: {value: 100, min: 0, max: 100, label: "Complete"},
    },
    {
      id: "empty",
      title: "Empty",
      description: "Value at minimum — track completely empty.",
      props: {value: 0, min: 0, max: 100, label: "Empty"},
    },
  ],

  controls: [
    {prop: "value", type: "number", label: "Value"},
    {prop: "min", type: "number", label: "Min"},
    {prop: "max", type: "number", label: "Max"},
    {prop: "label", type: "text", label: "Label", placeholder: "e.g. Progress"},
  ],

  note: `
\`shad/slider-value\` is a pure display card — it emits no events.

\`\`\`ts
import {registerCard, memo} from "@pihanga2/core";
import {SliderValue} from "@/cards/sliderValue";
import type {AppState} from "@/app.state";

registerCard("myApp/healthBar", SliderValue({
  value: memo((s: AppState) => s.health),
  min:   0,
  max:   100,
  label: "Health",
}));
\`\`\`

To show the interactive and read-only versions side by side:

\`\`\`ts
import {Slider, onPiSliderChanged} from "@/cards/slider";
import {SliderValue}               from "@/cards/sliderValue";

// editable
registerCard("myApp/editVolume", Slider({
  name: "volume", value: memo((s) => s.volume), label: "Volume",
}));

// read-only summary
registerCard("myApp/displayVolume", SliderValue({
  value: memo((s: AppState) => s.volume), label: "Volume",
}));
\`\`\`
  `.trim(),
});
