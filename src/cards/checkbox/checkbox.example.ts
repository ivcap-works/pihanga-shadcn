/**
 * Playground definition for the `pi/checkbox` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Checkbox, onPiCheckboxChanged, type PiCheckboxProps} from "./index";

export default definePlayground<PiCheckboxProps>({
  cardId: "pi/checkbox",
  title: "Checkbox",

  introduction: `
A binary checked/unchecked input rendered as a shadcn \`<Checkbox>\`.

Use it inside a \`pi/form\` card (with \`name\`) to bind it to form state, or
standalone (with \`checked\`) for independently controlled boolean flags.

Provide an optional \`label\` to display descriptive text beside the checkbox.
Set \`disabled\` to make it non-interactive.
  `.trim(),

  preview: (props) => Checkbox(props),

  defaultProps: {
    checked: false,
    label: "Accept terms and conditions",
    disabled: false,
  },

  facets: [
    {
      id: "unchecked",
      title: "Unchecked",
      description:
        "Default unchecked state — the starting point for most checkboxes.",
      props: {checked: false, label: "Remember me"},
    },
    {
      id: "checked",
      title: "Checked",
      description: "Checked (active) state showing the tick mark.",
      props: {checked: true, label: "Remember me"},
    },
    {
      id: "no-label",
      title: "No label",
      description:
        "Standalone checkbox without a label — useful in table rows or icon grids.",
      props: {checked: false},
    },
    {
      id: "disabled-unchecked",
      title: "Disabled unchecked",
      description: "Non-interactive checkbox in the unchecked state.",
      props: {checked: false, label: "Email updates", disabled: true},
    },
    {
      id: "disabled-checked",
      title: "Disabled checked",
      description: "Non-interactive checkbox in the checked state.",
      props: {checked: true, label: "Email updates", disabled: true},
    },
  ],

  controls: [
    {prop: "checked", type: "boolean", label: "Checked"},
    {prop: "disabled", type: "boolean", label: "Disabled"},
    {
      prop: "label",
      type: "text",
      label: "Label",
      placeholder: "e.g. Accept terms…",
    },
  ],

  registerEvents: (r, logEvent) => {
    onPiCheckboxChanged(r, (state, ev) => {
      logEvent(state, "onPiCheckboxChanged", {
        name: ev.name ?? null,
        checked: ev.checked,
      });
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle checkbox changes with \`onPiCheckboxChanged\`:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Checkbox, onPiCheckboxChanged} from "@/cards/checkbox";

register((r) => {
  onPiCheckboxChanged(r, (state, {name, checked}) => {
    if (name === "termsAccepted") {
      state.termsAccepted = checked;
    }
  });
});

registerCard("myApp/termsCheckbox", Checkbox({
  name:    "termsAccepted",
  checked: memo((s: AppState) => s.termsAccepted),
  label:   "I accept the terms and conditions",
}));
\`\`\`

When used inside a \`pi/form\` card, pass only \`name\` — the checkbox reads
its initial value from form state and calls \`form.handleChange\` on toggle:

\`\`\`ts
registerCard("myApp/signupForm", Form({
  initialValues: {newsletter: false},
  content: [
    Checkbox({name: "newsletter", label: "Subscribe to newsletter"}),
  ],
}));
\`\`\`
  `.trim(),
});
