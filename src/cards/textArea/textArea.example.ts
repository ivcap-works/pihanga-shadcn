/**
 * Playground definition for the `pi/text-area` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  TextArea,
  onTextAreaChanged,
  onTextAreaSubmitted,
  type PiTextAreaProps,
} from "./index";

export default definePlayground<PiTextAreaProps>({
  cardId: "pi/text-area",
  title: "Text Area",

  preview: (props) => TextArea(props),

  defaultProps: {
    value: "",
    placeholder: "Enter text…",
    fieldSizing: "fixed",
    rows: 4,
    selfManaged: true,
  },

  facets: [
    {
      id: "fixed",
      title: "A1 · Fixed (default)",
      description:
        "Baseline: rows=4, no field-sizing. Never grows with content.",
      props: {value: "", rows: 4, fieldSizing: "fixed"},
    },
    {
      id: "vertical-autogrow",
      title: "A2 · Vertical auto-grow",
      description:
        "width:100%; field-sizing:content; resize:none. The flagship case — " +
        "width stays constant, height tracks line count.",
      props: {
        value: "Type multiple\nlines and watch\nthe height grow.",
        fieldSizing: "content",
        width: "100%",
      },
    },
    {
      id: "unconstrained",
      title: "A3 · Unconstrained growth (cautionary)",
      description:
        "field-sizing:content, no width. Empty it's an ~11px stub; it " +
        "widens then wraps as you type. Always pair with maxWidth.",
      props: {value: "", fieldSizing: "content"},
    },
    {
      id: "bounded",
      title: "A4 · Bounded growth",
      description:
        "min-height:2lh; max-height:8lh. Starts at 2 lines, scrolls " +
        "(not grows) past 8.",
      props: {
        value: "Line one",
        fieldSizing: "content",
        minHeight: "2lh",
        maxHeight: "8lh",
        width: "100%",
      },
    },
    {
      id: "fixed-scroll-pane",
      title: "A5 · Fixed-height scroll pane",
      description:
        "height:200px, no field-sizing. Auto-grow is wrong by design here.",
      props: {
        value: "This box has a fixed height of 200px.\n".repeat(10),
        height: 200,
        width: "100%",
      },
    },
    {
      id: "explicit-width-content",
      title: "B2 · Explicit width + content",
      description:
        "width:600px + field-sizing:content — inline (width) frozen, block " +
        "(height) still grows.",
      props: {value: "Start typing…", fieldSizing: "content", width: 600},
    },
    {
      id: "explicit-height-content",
      title: "B2b · Explicit height + content (anti-pattern)",
      description:
        "width:58px + height:100px + field-sizing:content — both frozen; " +
        "content clips instead of growing. Shown as the anti-pattern.",
      props: {
        value: "This will clip because both axes are frozen.",
        fieldSizing: "content",
        width: 58,
        height: 100,
      },
    },
    {
      id: "max-width-guard",
      title: "B4 · max-width overflow guard",
      description:
        "Without maxWidth an unconstrained content box can escape its " +
        "parent. Here it's clamped to 600px.",
      props: {
        value: "A very long unbroken run of text keeps this from overflowing.",
        fieldSizing: "content",
        maxWidth: 600,
      },
    },
    {
      id: "multiline-placeholder",
      title: "C1 · Multi-line placeholder",
      description:
        "A 4-line placeholder sizes the empty box under field-sizing:content.",
      props: {
        value: "",
        placeholder: "Line one\nLine two\nLine three\nLine four",
        fieldSizing: "content",
        width: 500,
      },
    },
    {
      id: "long-string",
      title: "C5 · Long unbroken string",
      description:
        "A long unbroken string in a narrow box — verifies it breaks " +
        "(wraps) rather than overflowing.",
      props: {
        value: "x".repeat(300),
        fieldSizing: "content",
        width: 200,
        maxWidth: 200,
      },
    },
    {
      id: "resize-escape-hatch",
      title: "D2 · resize:vertical escape hatch",
      description:
        "field-sizing:content with resize:vertical — grows with content but " +
        "the user may still drag it taller/shorter.",
      props: {
        value: "Grows automatically, but you can still drag-resize.",
        fieldSizing: "content",
        width: "100%",
        resize: "vertical",
      },
    },
    {
      id: "vertical-writing-mode",
      title: "D3 · Vertical writing mode",
      description:
        "writing-mode:vertical-rl; height:300px. Growth under " +
        "field-sizing:content follows the inline axis — horizontally, not " +
        "top-to-bottom.",
      props: {
        value: "縦書きテキスト",
        fieldSizing: "content",
        writingMode: "vertical-rl",
        height: 300,
      },
    },
    {
      id: "rtl",
      title: "D4 · RTL",
      description:
        "Same component with dir=rtl — checks padding/scrollbar placement.",
      props: {value: "مرحبا بالعالم", dir: "rtl", fieldSizing: "fixed"},
    },
    {
      id: "disabled-grown",
      title: "D5 · Disabled at a grown size",
      description:
        "disabled=true on an already content-grown box — sizing survives.",
      props: {
        value: "Line one\nLine two\nLine three",
        fieldSizing: "content",
        disabled: true,
        width: 400,
      },
    },
    {
      id: "readonly-grown",
      title: "D5b · Read-only at a grown size",
      description: "readOnly=true on a grown box.",
      props: {
        value: "Line one\nLine two\nLine three",
        fieldSizing: "content",
        readOnly: true,
        width: 400,
      },
    },
    {
      id: "submit-on-enter",
      title: "Submit on Enter",
      description:
        "Press Enter to fire onSubmitted with the current text; Shift+Enter " +
        "still inserts a newline.",
      props: {
        value: "",
        placeholder: "Type a message and press Enter…",
        submitOnEnter: true,
        fieldSizing: "content",
        width: "100%",
        maxHeight: "8lh",
      },
    },
    {
      id: "self-managed-default",
      title: "E1 · Self-managed (default, no debounce)",
      description:
        "selfManaged is on by default — typing updates the box instantly, " +
        "but onChanged only fires on blur, not on every keystroke.",
      props: {
        value: "",
        placeholder: "Type here, then click away…",
        fieldSizing: "content",
        width: "100%",
      },
    },
    {
      id: "self-managed-debounced",
      title: "E2 · Self-managed + debounced",
      description:
        "debounceMs=500 added on top of the default selfManaged=true — " +
        "onChanged fires at most twice a second while typing, and also on " +
        "blur.",
      props: {
        value: "",
        placeholder: "Type continuously…",
        debounceMs: 500,
        fieldSizing: "content",
        width: "100%",
      },
    },
    {
      id: "per-keystroke-opt-out",
      title: "E3 · Opt out (selfManaged=false)",
      description:
        "selfManaged explicitly disabled — reverts to firing onChanged on " +
        "every keystroke, the pre-default behaviour.",
      props: {
        value: "",
        placeholder: "Fires onChanged on every keystroke…",
        selfManaged: false,
        fieldSizing: "content",
        width: "100%",
      },
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
      prop: "placeholder",
      type: "text",
      label: "Placeholder",
      placeholder: "Hint text…",
    },
    {
      prop: "fieldSizing",
      type: "token",
      label: "Field sizing",
      options: ["fixed", "content"],
    },
    {
      prop: "resize",
      type: "token",
      label: "Resize",
      options: ["none", "vertical", "horizontal", "both"],
    },
    {prop: "rows", type: "number", label: "Rows (fixed mode only)"},
    {prop: "cols", type: "number", label: "Cols (fixed mode only)"},
    {prop: "minHeight", type: "text", label: "Min height"},
    {prop: "maxHeight", type: "text", label: "Max height"},
    {prop: "width", type: "text", label: "Width"},
    {prop: "height", type: "text", label: "Height"},
    {prop: "maxWidth", type: "text", label: "Max width"},
    {
      prop: "dir",
      type: "token",
      label: "Direction",
      options: ["ltr", "rtl"],
    },
    {
      prop: "writingMode",
      type: "token",
      label: "Writing mode",
      options: ["horizontal-tb", "vertical-rl", "vertical-lr"],
    },
    {prop: "submitOnEnter", type: "boolean", label: "Submit on Enter"},
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {prop: "debounceMs", type: "number", label: "Debounce ms (self-managed)"},
    {prop: "disabled", type: "boolean", label: "Disabled"},
    {prop: "readOnly", type: "boolean", label: "Read-only"},
    {prop: "autoFocus", type: "boolean", label: "Auto-focus on show"},
  ],

  registerEvents: (r, logEvent) => {
    onTextAreaChanged(r, (state, ev) => {
      logEvent(state, "onTextAreaChanged", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
    onTextAreaSubmitted(r, (state, ev) => {
      logEvent(state, "onTextAreaSubmitted", {
        name: ev.name ?? null,
        value: ev.value,
      });
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle text area changes and Enter-to-submit:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {TextArea, onTextAreaChanged, onTextAreaSubmitted} from "@/cards/textArea";
import type {AppState} from "@/app.state";

register((r) => {
  onTextAreaChanged(r, (state, {name, value}) => {
    if (name === "message") {
      state.message = value;
    }
  });

  onTextAreaSubmitted(r, (state, {value}) => {
    state.messages.push(value);
    state.message = "";
  });
});

registerCard("myApp/composer", TextArea({
  name:          "message",
  value:         memo((s: AppState) => s.message),
  placeholder:   "Type a message…",
  fieldSizing:   "content",
  width:         "100%",
  maxHeight:     "8lh",
  submitOnEnter: true,
}));
\`\`\`

### Sizing cheat-sheet

- Vertical auto-grow: \`fieldSizing="content" width="100%" resize="none"\`
- Bounded growth: add \`minHeight="2lh" maxHeight="8lh"\`
- Fixed-height scroll pane: \`height={200}\` and omit \`fieldSizing\`
- Always pair unconstrained \`fieldSizing="content"\` with \`maxWidth\` to
  avoid the field escaping its parent container.

### Throttling change events (self-managed)

Standalone usage defaults to \`selfManaged: true\` — typing stays instant but
the outgoing \`onChanged\` only fires on blur. Add \`debounceMs\` to also get
periodic commits during long edits, or set \`selfManaged: false\` to opt back
into the pre-default per-keystroke behaviour:

\`\`\`ts
registerCard("myApp/notes", TextArea({
  name:        "notes",
  debounceMs:  500, // commit at most twice a second while typing
}));
\`\`\`

Inside a \`pi/form\` card, \`selfManaged\`/\`debounceMs\` are ignored — form
fields always commit on every keystroke via \`form.handleChange\`, matching
\`pi/input\` and \`pi/text-field\`.
  `.trim(),
});
