/**
 * Playground definition for the `pi/select` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Select,
  onPiSelectChanged,
  onPiSelectOpened,
  onPiSelectClosed,
  type PiSelectProps,
} from "./index";

export default definePlayground<PiSelectProps>({
  cardId: "pi/select",
  title: "Select",

  introduction: `
A dropdown select input backed by Radix UI's \`<Select>\` primitive.

Use it inside a \`pi/form\` card (with \`name\`) to bind it to form state, or
standalone (with \`value\`) for directly controlled single-selection.

Set \`selfManaged: true\` to have the component update its own display immediately
on selection without waiting for the host app to update \`value\` via a reducer.

Provide \`placeholder\` text to show when no option is selected.
  `.trim(),

  preview: (props) => Select(props),

  defaultProps: {
    options: [
      {value: "apple", label: "Apple"},
      {value: "banana", label: "Banana"},
      {value: "cherry", label: "Cherry"},
      {value: "durian", label: "Durian", disabled: true},
    ],
    placeholder: "Select a fruit…",
    selfManaged: true,
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description:
        "Self-managed select with a placeholder and no initial selection.",
      props: {
        options: [
          {value: "apple", label: "Apple"},
          {value: "banana", label: "Banana"},
          {value: "cherry", label: "Cherry"},
        ],
        placeholder: "Select a fruit…",
        selfManaged: true,
      },
    },
    {
      id: "prefilled",
      title: "Prefilled",
      description:
        "Shows a controlled pre-selected value from application state.",
      props: {
        options: [
          {value: "us", label: "United States"},
          {value: "au", label: "Australia"},
          {value: "uk", label: "United Kingdom"},
          {value: "ca", label: "Canada"},
        ],
        value: "au",
        placeholder: "Select country…",
      },
    },
    {
      id: "with-disabled-option",
      title: "With disabled option",
      description: "One option is shown but cannot be selected.",
      props: {
        options: [
          {value: "free", label: "Free"},
          {value: "pro", label: "Pro"},
          {value: "enterprise", label: "Enterprise", disabled: true},
        ],
        placeholder: "Select plan…",
        selfManaged: true,
      },
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Entire select is non-interactive.",
      props: {
        options: [
          {value: "active", label: "Active"},
          {value: "inactive", label: "Inactive"},
        ],
        value: "active",
        disabled: true,
      },
    },
  ],

  controls: [
    {
      prop: "placeholder",
      type: "text",
      label: "Placeholder",
      placeholder: "No selection text…",
    },
    {prop: "disabled", type: "boolean", label: "Disabled"},
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {prop: "required", type: "boolean", label: "Required"},
  ],

  registerEvents: (r, logEvent) => {
    onPiSelectChanged(r, (state, ev) => {
      logEvent(state, "onPiSelectChanged", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
    onPiSelectOpened(r, (state) => {
      logEvent(state, "onPiSelectOpened", {});
    });
    onPiSelectClosed(r, (state) => {
      logEvent(state, "onPiSelectClosed", {});
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle selection changes:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {Select, onPiSelectChanged} from "@/cards/select";
import type {AppState} from "@/app.state";

const COUNTRY_OPTIONS = [
  {value: "us", label: "United States"},
  {value: "au", label: "Australia"},
  {value: "uk", label: "United Kingdom"},
];

register((r) => {
  onPiSelectChanged(r, (state, {name, value}) => {
    if (name === "country") {
      state.country = value;
    }
  });
});

registerCard("myApp/countrySelect", Select({
  name:        "country",
  options:     COUNTRY_OPTIONS,
  value:       memo((s: AppState) => s.country),
  placeholder: "Select country…",
}));
\`\`\`

When used inside a \`pi/form\` card, pass only \`name\` — the select reads
its value from form state and calls \`form.handleChange\` on selection:

\`\`\`ts
registerCard("myApp/profileForm", Form({
  initialValues: {country: "au"},
  content: [
    Field({
      label:     "Country",
      fieldCard: Select({
        name:    "country",
        options: COUNTRY_OPTIONS,
      }),
    }),
  ],
}));
\`\`\`
  `.trim(),
});
