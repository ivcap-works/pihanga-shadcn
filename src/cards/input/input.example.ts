/**
 * Playground definition for the `pi/input` card.
 *
 * Demonstrates the full range of the `PiInputProps` surface:
 * text / email / password / search / file types, optional label,
 * helper description, disabled state, and form integration.
 *
 * See `src/playground/PLAYGROUND_PLAN.md` for the PlaygroundDef spec.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  PiInput,
  onPiInputChanged,
  onPiInputCommitted,
  type PiInputProps,
} from "./index";

export default definePlayground<PiInputProps>({
  cardId: "pi/input",
  title: "Input",

  preview: (props) => PiInput(props),

  defaultProps: {
    label: "Your email",
    type: "email",
    placeholder: "you@example.com",
    name: "email",
  },

  facets: [
    // ── 1. Basic ────────────────────────────────────────────────────────────
    {
      id: "basic",
      title: "Basic",
      description: "Minimal text input — no label, no description.",
      props: {
        type: "text",
        placeholder: "Type something…",
      },
    },
    // ── 2. Labelled ─────────────────────────────────────────────────────────
    {
      id: "labelled",
      title: "Labelled",
      description:
        "Email input with a label automatically associated via `htmlFor`.",
      props: {
        label: "Your email",
        type: "email",
        placeholder: "you@example.com",
        name: "email",
      },
    },
    // ── 3. With description ─────────────────────────────────────────────────
    {
      id: "described",
      title: "With description",
      description:
        "Helper text rendered below the input for hints or guidance.",
      props: {
        label: "Username",
        placeholder: "johndoe",
        name: "username",
        description: "This is your public display name.",
      },
    },
    // ── 4. Password ─────────────────────────────────────────────────────────
    {
      id: "password",
      title: "Password",
      description: 'type="password" masks the value with bullet characters.',
      props: {
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        name: "password",
      },
    },
    // ── 5. Disabled ─────────────────────────────────────────────────────────
    {
      id: "disabled",
      title: "Disabled",
      description:
        "Set `disabled: true` to prevent interaction. Applies the shadcn disabled style.",
      props: {
        label: "Disabled field",
        placeholder: "You cannot edit this",
        disabled: true,
      },
    },
    // ── 6. File ─────────────────────────────────────────────────────────────
    {
      id: "file",
      title: "File upload",
      description: 'type="file" renders the browser\'s native file picker.',
      props: {
        label: "Upload a file",
        type: "file",
        name: "attachment",
      },
    },
    // ── 7. Search ───────────────────────────────────────────────────────────
    {
      id: "search",
      title: "Search",
      description:
        'type="search" adds a platform-native clear button on some browsers.',
      props: {
        type: "search",
        placeholder: "Search…",
      },
    },
  ],

  controls: [
    {
      prop: "type",
      type: "token",
      label: "Type",
      options: ["text", "email", "password", "search", "number", "file"],
    },
    {
      prop: "label",
      type: "text",
      label: "Label",
      placeholder: "Optional label text…",
    },
    {
      prop: "placeholder",
      type: "text",
      label: "Placeholder",
      placeholder: "Placeholder text…",
    },
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Helper / hint text…",
    },
    {
      prop: "disabled",
      type: "boolean",
      label: "Disabled",
    },
  ],

  registerEvents: (r, logEvent) => {
    // onPiInputChanged fires on every keystroke.
    onPiInputChanged(r, (state, ev) => {
      logEvent(state, "onPiInputChanged", {name: ev.name, value: ev.value});
    });
    // onPiInputCommitted fires once when the user blurs or presses Enter.
    onPiInputCommitted(r, (state, ev) => {
      logEvent(state, "onPiInputCommitted", {name: ev.name, value: ev.value});
    });
  },

  note: `
**Standalone usage** (outside \`pi/form\`):

\`\`\`ts
import {memo, register, registerCard} from "@pihanga2/core";
import {PiInput, onPiInputChanged} from "@/cards/input";
import type {AppState} from "@/app.state";

register((r) => {
  onPiInputChanged(r, (state: AppState, {name, value}) => {
    if (name === "query") state.searchQuery = value;
  });
});

registerCard("myApp/search", PiInput({
  name:        "query",
  type:        "search",
  placeholder: "Search…",
  value:       memo((s: AppState) => s.searchQuery),
}));
\`\`\`

**Inside \`pi/form\`** (no reducer needed — form handles state internally):

\`\`\`ts
registerCard("myApp/loginForm", Form({
  content: [
    Stack({
      content: [
        Field({ label: "Email",    fieldCard: PiInput({ name: "email",    type: "email"    }) }),
        Field({ label: "Password", fieldCard: PiInput({ name: "password", type: "password" }) }),
      ],
    }),
  ],
}));
\`\`\`
  `.trim(),
});
