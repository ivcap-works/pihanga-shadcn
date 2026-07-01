import {definePlayground} from "@/playground/definePlayground";
import {Form, onPiFormSubmitted} from "./index";
import {Stack} from "@/cards/stack";
import {Field} from "@/cards/field";
import {PiInput} from "@/cards/input";

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/form",
  title: "Form",

  preview: () =>
    Form({
      id: "login",
      content: [
        Stack({
          content: [
            Field({
              label: "Email",
              fieldCard: PiInput({
                name: "email",
                type: "email",
                placeholder: "you@example.com",
              }),
            }),
            Field({
              label: "Password",
              fieldCard: PiInput({
                name: "password",
                type: "password",
                placeholder: "••••••••",
              }),
            }),
          ],
        }),
      ],
      submitLabel: "Log in",
    }),

  defaultProps: {
    id: "preview",
    content: [],
    submitLabel: "Submit",
  },

  facets: [
    {
      id: "login",
      title: "Login form",
      description:
        "Email, password, and remember-me bound to form context via `name`.",
      props: {
        id: "login",
        content: ["myForm/email", "myForm/password", "myForm/remember"],
        initialValues: {email: "", password: "", remember: false},
        submitLabel: "Log in",
      },
    },
    {
      id: "preferences",
      title: "Preferences form",
      description: "Form with a Select field for theme preference.",
      props: {
        id: "preferences",
        content: ["prefForm/theme"],
        submitLabel: "Save",
      },
    },
  ],

  controls: [
    {
      prop: "submitLabel",
      type: "text",
      label: "Submit label",
      placeholder: "Submit",
    },
    {prop: "hideSubmit", type: "boolean", label: "Hide submit button"},
  ],

  registerEvents: (r, logEvent) => {
    // Fires when the user clicks the Submit button (carries a snapshot of all field values).
    onPiFormSubmitted(r, (state, ev) => {
      logEvent(state, "onPiFormSubmitted", {
        id: ev.id,
        formData: ev.formData,
      });
    });
  },

  note: `
**Login form** with \`TextField\` and \`Checkbox\`:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Form, TextField, Checkbox, onPiFormSubmitted} from "@/cards/form";

registerCard("myForm/email",    TextField({name: "email",    label: "Email",    type: "email"}));
registerCard("myForm/password", TextField({name: "password", label: "Password", type: "password"}));
registerCard("myForm/remember", Checkbox({name:  "remember", label: "Remember me"}));

registerCard("myApp/loginForm", Form({
  content:       ["myForm/email", "myForm/password", "myForm/remember"],
  initialValues: {email: "", password: "", remember: false},
  submitLabel:   "Log in",
}));

register((r) => {
  onPiFormSubmitted(r, (state, {formData}) => {
    const {email, password} = formData as {email: string; password: string};
    // send to API, update state, etc.
    state.isLoggingIn = true;
  });
});
\`\`\`

**Standalone \`TextField\`** (outside a Form, event-driven):

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {TextField, onPiTextFieldChanged} from "@/cards/form";
import type {AppState} from "@/app.state";

registerCard("myApp/search", TextField({
  label:       "Search",
  value:       memo((s: AppState) => s.searchQuery, (v) => v ?? ""),
  placeholder: "Type to search…",
}));

register((r) => {
  onPiTextFieldChanged(r, (state: AppState, {value}) => {
    state.searchQuery = value;
  });
});
\`\`\`
  `.trim(),
});
