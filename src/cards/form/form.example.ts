import {definePlayground} from "@/playground/definePlayground";
import {Form, onPiFormSubmitted, onFormCancelled, onFormAbandoned} from "./index";
import {Stack} from "@/cards/stack";
import {Field} from "@/cards/field";
import {Input} from "@/cards/input";
import {Checkbox} from "@/cards/checkbox";
import {Select} from "@/cards/select";
import {Button} from "@/cards/button";
import {registerIcon} from "@/cards/icons";
import {Check, X} from "lucide-react";

// Example icon registration (usually done once during app init)
registerIcon("form-check", Check);
registerIcon("form-cancel", X);

// Shared field cards for the "Login form" facet — built once so the same
// card refs are reused whenever this facet's props are (re-)applied.
const LOGIN_FIELDS = Stack({
  content: [
    Field({
      label: "Email",
      fieldCard: Input({
        name: "email",
        type: "email",
        placeholder: "you@example.com",
      }),
    }),
    Field({
      label: "Password",
      fieldCard: Input({
        name: "password",
        type: "password",
        placeholder: "••••••••",
      }),
    }),
    // No Field wrapper here: Checkbox already renders its own checkbox+label
    // pair aligned via flex items-center (checkbox.component.tsx) — wrapping
    // it in a labelless Field previously reserved an empty label row above
    // it, misaligning it relative to the Email/Password fields' rows.
    Checkbox({name: "remember", label: "Remember me"}),
  ],
});

// Field card(s) for the "Preferences form" facet.
const PREFERENCES_FIELDS = Field({
  label: "Theme",
  fieldCard: Select({
    name: "theme",
    options: [
      {value: "light", label: "Light"},
      {value: "dark", label: "Dark"},
      {value: "system", label: "System"},
    ],
  }),
});

// Field card for the "Submit on Enter" facet: a single input where pressing
// Enter submits the form — no extra buttons needed, unlike the inline
// submit/cancel facet below.
const SUBMIT_ON_ENTER_FIELD = Field({
  label: "Search",
  fieldCard: Input({
    name: "query",
    placeholder: "Type and press Enter…",
    // Requests the form's submit action on Enter, equivalent to clicking
    // the default footer submit button.
    submitOnEnter: true,
  }),
});

// Row layout for the "Inline submit/cancel" facet: a text input followed by
// two icon-only buttons — a checkmark (submit) and an X (cancel) — instead
// of a separate submit-button row below the fields.
const INLINE_SUBMIT_CANCEL = Stack({
  direction: "row",
  alignItems: "center",
  spacing: 2,
  content: [
    Input({
      name: "value",
      placeholder: "Type a value…",
      className: "flex-1",
      // Pressing Enter requests the form's submit action, same as clicking
      // the confirm button (formAction: "submit") below.
      submitOnEnter: true,
    }),
    Button({
      id: "confirm",
      iconLabel: "form-check",
      ariaLabel: "Confirm",
      tooltip: "Confirm",
      opts: {variant: "outline", size: "icon"},
      // Triggers the Form's onSubmitted, same as the default footer button.
      formAction: "submit",
    }),
    Button({
      id: "cancel",
      iconLabel: "form-cancel",
      ariaLabel: "Cancel",
      tooltip: "Cancel",
      opts: {variant: "outline", size: "icon"},
      // Fires the Form's onCancelled instead of this button's own
      // onClicked, and never submits the form.
      formAction: "cancel",
    }),
  ],
});

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/form",
  title: "Form",

  preview: (props) => Form(props),

  defaultProps: {
    id: "preview",
    content: [LOGIN_FIELDS],
    submitLabel: "Log in",
  },

  facets: [
    {
      id: "login",
      title: "Login form",
      description:
        "Email, password, and remember-me bound to form context via `name`.",
      props: {
        id: "login",
        content: [LOGIN_FIELDS],
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
        content: [PREFERENCES_FIELDS],
        submitLabel: "Save",
      },
    },
    {
      id: "submit-on-enter",
      title: "Submit on Enter",
      description:
        "`submitOnEnter: true` on the Input lets the user submit by pressing " +
        "Enter, in addition to clicking the footer submit button.",
      props: {
        id: "submit-on-enter",
        content: [SUBMIT_ON_ENTER_FIELD],
        submitLabel: "Search",
      },
    },
    {
      id: "inline-submit-cancel",
      title: "Inline submit/cancel",
      description:
        "Input field followed by icon-only confirm/cancel buttons instead of a footer submit button. " +
        "`hideSubmit: true` removes the default footer button; the confirm button uses " +
        '`formAction: "submit"` to trigger `onSubmitted`, and the cancel button uses ' +
        '`formAction: "cancel"` to fire a dedicated `onCancelled` event without submitting the form.',
      props: {
        id: "inline-submit-cancel",
        content: [INLINE_SUBMIT_CANCEL],
        hideSubmit: true,
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
    // Fires when the "cancel" icon button (inline-submit-cancel facet) is
    // clicked — a dedicated Form event, distinct from a generic button click,
    // and never accompanied by a form submission.
    onFormCancelled(r, (state, ev) => {
      logEvent(state, "onFormCancelled", {
        id: ev.id,
        formData: ev.formData,
      });
    });
    // Fires automatically if the Form card is ever removed from the screen
    // without having been submitted or cancelled first (e.g. its parent
    // pi/dialog is dismissed via Escape/outside-click/X). Not reachable from
    // this playground page directly, but shown here so the pattern is
    // documented alongside the other two form-lifecycle events.
    onFormAbandoned(r, (state, ev) => {
      logEvent(state, "onFormAbandoned", {
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

**Submit on Enter** — inside a \`pi/form\`, \`Input\`'s \`submitOnEnter\` prop lets the
user press Enter to submit, in addition to clicking the footer submit button:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Form, onPiFormSubmitted} from "@/cards/form";
import {Field} from "@/cards/field";
import {Input} from "@/cards/input";

registerCard("myApp/searchForm", Form({
  submitLabel: "Search",
  content: [
    Field({
      label:     "Search",
      fieldCard: Input({name: "query", submitOnEnter: true}),
    }),
  ],
}));

register((r) => {
  onPiFormSubmitted(r, (state, {formData}) => {
    const {query} = formData as {query: string};
    // run the search, update state, etc.
  });
});
\`\`\`

**Inline submit/cancel** — icon buttons next to the input instead of a footer button.
The full form-lifecycle contract has three events:
\`onSubmitted\` (explicit submit), \`onCancelled\` (explicit \`formAction: "cancel"\`),
and \`onAbandoned\` (the form is removed from screen — e.g. a dialog is dismissed —
without either of the above happening first):

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Form, onPiFormSubmitted, onFormCancelled, onFormAbandoned} from "@/cards/form";
import {Dialog} from "@/cards/dialog";
import {Stack} from "@/cards/stack";
import {Input} from "@/cards/input";
import {Button} from "@/cards/button";
import {registerIcon} from "@/cards/icons";
import {Check, X} from "lucide-react";

registerIcon("check", Check);
registerIcon("cancel", X);

registerCard("myApp/inlineForm", Form({
  id:         "editComment",
  hideSubmit: true, // suppress the default footer submit button
  content: [
    Stack({
      direction: "row",
      alignItems: "center",
      spacing: 2,
      content: [
        // submitOnEnter lets the user also submit by pressing Enter,
        // consistent with the confirm button's formAction: "submit".
        Input({name: "value", className: "flex-1", submitOnEnter: true}),
        Button({
          id:         "confirm",
          iconLabel:  "check",
          ariaLabel:  "Confirm",
          opts:       {variant: "outline", size: "icon"},
          formAction: "submit", // triggers the Form's onSubmitted
        }),
        Button({
          id:         "cancel",
          iconLabel:  "cancel",
          ariaLabel:  "Cancel",
          opts:       {variant: "outline", size: "icon"},
          // Fires the Form's dedicated onCancelled event (not onClicked)
          // and never submits the form.
          formAction: "cancel",
        }),
      ],
    }),
  ],
}));

// Optionally host the form inside a dialog — closing the dialog via the X
// button, Escape, or an outside click unmounts the Form *without* going
// through onSubmitted/onCancelled, which is exactly when onAbandoned fires.
registerCard("myApp/editCommentDialog", Dialog({
  id:                    "editComment",
  content:               "myApp/inlineForm",
  title:                 "Edit comment",
  footerCloseButtonText: null, // Form supplies its own submit/cancel buttons
}));

register((r) => {
  onPiFormSubmitted(r, (state, {id, formData}) => {
    if (id !== "editComment") return;
    // handle confirmed value, e.g. also close the dialog
  });
  onFormCancelled(r, (state, {id}) => {
    if (id !== "editComment") return;
    // handle explicit cancel, e.g. also close the dialog
  });
  onFormAbandoned(r, (state, {id}) => {
    if (id !== "editComment") return;
    // clean up any related state — the dialog was dismissed some other
    // way (Escape / outside click / X) without an explicit submit/cancel
  });
});
\`\`\`
  `.trim(),
});
