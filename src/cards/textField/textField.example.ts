/**
 * Playground definition for the `pi/text-field` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {TextField, onPiTextFieldChanged, type PiTextFieldProps} from "./index";

export default definePlayground<PiTextFieldProps>({
  cardId: "pi/text-field",
  title: "Text Field",

  introduction: `
A minimal single-line text input rendered as a shadcn \`<Input>\`.

Use it inside a \`pi/form\` card (with \`name\`) to bind it to form state, or
standalone (with \`value\`) for directly controlled string inputs.

Set \`type\` to \`"email"\`, \`"password"\`, \`"number"\`, etc. for semantic HTML
input types.  Set \`disabled\` to make the field non-interactive.

> For a richer, self-contained input with a built-in label and description,
> prefer the \`pi/input\` card.  Use \`pi/text-field\` when you need a bare
> control that a \`pi/field\` wrapper will label externally.
  `.trim(),

  preview: (props) => TextField(props),

  defaultProps: {
    value: "",
    placeholder: "Enter text…",
    disabled: false,
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Plain text input — the most common standalone usage.",
      props: {value: "", placeholder: "Enter your name…"},
    },
    {
      id: "email",
      title: "Email",
      description:
        "Semantic email input — activates the correct mobile keyboard.",
      props: {type: "email", value: "", placeholder: "you@example.com"},
    },
    {
      id: "password",
      title: "Password",
      description: "Masks the value — use for password and secret fields.",
      props: {type: "password", value: "secret"},
    },
    {
      id: "prefilled",
      title: "Prefilled",
      description: "Shows a controlled value supplied from application state.",
      props: {value: "Jane Smith", placeholder: "Full name"},
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Non-interactive field — value is read-only.",
      props: {value: "Read-only content", disabled: true},
    },
  ],

  controls: [
    {
      prop: "value",
      type: "text",
      label: "Value",
      placeholder: "Current value…",
    },
    {
      prop: "type",
      type: "token",
      label: "Type",
      options: ["text", "email", "password", "number", "url"],
    },
    {
      prop: "placeholder",
      type: "text",
      label: "Placeholder",
      placeholder: "Hint text…",
    },
    {prop: "disabled", type: "boolean", label: "Disabled"},
  ],

  registerEvents: (r, logEvent) => {
    onPiTextFieldChanged(r, (state, ev) => {
      logEvent(state, "onPiTextFieldChanged", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle text field changes:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {TextField, onPiTextFieldChanged} from "@/cards/textField";
import type {AppState} from "@/app.state";

register((r) => {
  onPiTextFieldChanged(r, (state, {name, value}) => {
    if (name === "username") {
      state.username = value;
    }
  });
});

registerCard("myApp/usernameField", TextField({
  name:        "username",
  value:       memo((s: AppState) => s.username),
  placeholder: "Enter username…",
}));
\`\`\`

When used inside a \`pi/form\` card, pass only \`name\` — the field reads its
value from form state and calls \`form.handleChange\` on every keystroke:

\`\`\`ts
registerCard("myApp/profileForm", Form({
  initialValues: {bio: ""},
  content: [
    Field({
      label:     "Bio",
      fieldCard: TextField({name: "bio", placeholder: "Tell us about yourself…"}),
    }),
  ],
}));
\`\`\`
  `.trim(),
});
