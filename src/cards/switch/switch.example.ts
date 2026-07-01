import {Switch, onPiSwitchChanged, type PiSwitchProps} from "./index";
import {definePlayground} from "@/playground/definePlayground";

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<PiSwitchProps>({
  cardId: "pi/switch",
  title: "Switch",

  preview: (props) => Switch(props),

  defaultProps: {
    checked: false,
    label: "Enable feature",
    disabled: false,
  },

  facets: [
    {
      id: "off",
      title: "Off",
      description: "Default unchecked state.",
      props: {
        checked: false,
        label: "Notifications",
      },
    },
    {
      id: "on",
      title: "On",
      description: "Checked (active) state.",
      props: {
        checked: true,
        label: "Notifications",
      },
    },
    {
      id: "no-label",
      title: "No label",
      description:
        "Switch without a label — useful inside table cells or tight layouts.",
      props: {
        checked: true,
      },
    },
    {
      id: "disabled-off",
      title: "Disabled off",
      description: "Non-interactive switch in the unchecked state.",
      props: {
        checked: false,
        label: "Auto-save",
        disabled: true,
      },
    },
    {
      id: "disabled-on",
      title: "Disabled on",
      description: "Non-interactive switch in the checked state.",
      props: {
        checked: true,
        label: "Auto-save",
        disabled: true,
      },
    },
  ],

  controls: [
    {prop: "checked", type: "boolean", label: "Checked"},
    {prop: "disabled", type: "boolean", label: "Disabled"},
    {
      prop: "label",
      type: "text",
      label: "Label",
      placeholder: "e.g. Enable feature",
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever the switch is toggled in the live preview.
    onPiSwitchChanged(r, (state, ev) => {
      logEvent(state, "onPiSwitchChanged", {
        name: ev.name,
        checked: ev.checked,
      });
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle the toggle event with \`onPiSwitchChanged\`:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Switch, onPiSwitchChanged} from "@/cards/switch";

register((r) => {
  onPiSwitchChanged(r, (state, {name, checked}) => {
    if (name === "notifications") {
      state.notificationsEnabled = checked;
    }
  });
});

registerCard("myApp/notificationsToggle", Switch({
  name: "notifications",
  label: "Enable notifications",
  checked: memo((s: AppState) => s.notificationsEnabled),
}));
\`\`\`

When used inside a \`pi/form\` card, pass only \`name\` — the switch reads its
initial value from the form state and calls \`form.handleChange\` on toggle
without dispatching \`onPiSwitchChanged\`:

\`\`\`ts
registerCard("myApp/settingsForm", Form({
  initialValues: {darkMode: false},
  content: [
    Switch({name: "darkMode", label: "Dark mode"}),
  ],
  onSubmit: (state, {values}) => {
    state.darkMode = values.darkMode;
  },
}));
\`\`\`
  `.trim(),
});
