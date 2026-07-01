/**
 * Playground definition for the `pi/field` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Field, type PiFieldProps} from "./index";

export default definePlayground<PiFieldProps>({
  cardId: "pi/field",
  title: "Field",

  preview: (props) => Field(props),

  defaultProps: {
    label: "Email address",
    fieldCard: "pi/empty",
    description: "We'll never share your email.",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Label and control — the minimum required configuration.",
      props: {
        label: "Username",
        fieldCard: "pi/empty",
      },
    },
    {
      id: "with-description",
      title: "With description",
      description: "Helper text below the control gives formatting guidance.",
      props: {
        label: "Email address",
        fieldCard: "pi/empty",
        description: "We'll never share your email.",
      },
    },
    {
      id: "with-error",
      title: "With error",
      description: "Static error message displayed below the control.",
      props: {
        label: "Password",
        fieldCard: "pi/empty",
        error: "Must be at least 8 characters.",
      },
    },
    {
      id: "with-description-and-error",
      title: "Description + error",
      description: "Both hint and validation error are shown simultaneously.",
      props: {
        label: "Phone number",
        fieldCard: "pi/empty",
        description: "Include country code (e.g. +61)",
        error: "Invalid phone number format.",
      },
    },
  ],

  controls: [
    {prop: "label", type: "text", label: "Label", placeholder: "Field label…"},
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Helper text…",
    },
    {
      prop: "error",
      type: "text",
      label: "Error",
      placeholder: "Error message…",
    },
  ],

  note: `
Wrap any input card with \`Field\` to add a label and error handling:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Field} from "@/cards/field";
import {TextField} from "@/cards/textField";
import {Select} from "@/cards/select";
import {Form} from "@/cards/form";

registerCard("myApp/signupForm", Form({
  initialValues: {email: "", role: ""},
  content: [
    Field({
      label:       "Email address",
      name:        "email",
      description: "We'll never share your email.",
      fieldCard:   TextField({
        name:        "email",
        type:        "email",
        placeholder: "you@example.com",
      }),
    }),
    Field({
      label:     "Role",
      name:      "role",
      fieldCard: Select({
        name:    "role",
        options: [
          {value: "admin", label: "Admin"},
          {value: "viewer", label: "Viewer"},
        ],
      }),
    }),
  ],
}));
\`\`\`
  `.trim(),
});
