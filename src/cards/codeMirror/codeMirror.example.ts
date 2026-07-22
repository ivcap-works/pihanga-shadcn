import {CodeMirrorCard} from "./codeMirror.types";
import {definePlayground} from "@/playground/definePlayground";
import type {CodeMirrorCardProps} from "./codeMirror.types";

const PYTHON_SNIPPET = `\
def greet(name: str) -> str:
    """Return a greeting string."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
`;

const YAML_SNIPPET = `\
name: my-app
version: 1.0.0

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  api:
    image: node:20-alpine
    environment:
      NODE_ENV: production
`;

/** Basic read-only viewer with no language extension. */
export const codeMirrorBasicExample = CodeMirrorCard({
  value: PYTHON_SNIPPET,
  readOnly: true,
  height: "200px",
});

/**
 * Full-featured editable example with Python syntax highlighting.
 *
 * Register the StreamParser once at app initialisation time, then reference
 * it by key — props must be JSON-serialisable strings, not live objects.
 *
 * @example
 * import { python } from "@codemirror/legacy-modes/mode/python";
 * import { registerStreamParser } from "@pihanga2/shadcn/codeMirror";
 * registerStreamParser("python", python);
 * CodeMirrorCard({ streamLanguage: "python", value: "..." });
 */
export const codeMirrorPythonExample = CodeMirrorCard({
  value: PYTHON_SNIPPET,
  readOnly: false,
  height: "300px",
  // streamLanguage: "python",  ← set after calling registerStreamParser("python", python)
});

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<CodeMirrorCardProps>({
  cardId: "code-mirror",
  title: "Code Mirror",

  preview: (props) => CodeMirrorCard(props),

  defaultProps: {
    value: PYTHON_SNIPPET,
    readOnly: false,
    lineNumbers: true,
    height: "auto",
  },

  facets: [
    {
      id: "readonly",
      title: "Read-only viewer",
      description: "Display code without allowing edits.",
      props: {
        value: PYTHON_SNIPPET,
        readOnly: true,
        height: "200px",
      },
    },
    {
      id: "yaml",
      title: "YAML snippet",
      description: "Editable YAML content (no language extension applied).",
      props: {
        value: YAML_SNIPPET,
        readOnly: false,
        height: "300px",
      },
    },
    {
      id: "no-gutter",
      title: "No line numbers",
      description: "Minimal editor without the line-number gutter.",
      props: {
        value: "const x = 42;\nconsole.log(x);",
        lineNumbers: false,
        height: "120px",
      },
    },
  ],

  controls: [
    {prop: "value", type: "text", label: "Code content"},
    {prop: "height", type: "text", label: "Height", placeholder: "auto"},
    {prop: "readOnly", type: "boolean", label: "Read-only"},
    {prop: "lineNumbers", type: "boolean", label: "Line numbers"},
    {
      prop: "streamLanguage",
      type: "text",
      label: "Stream language key",
      placeholder: "e.g. python",
    },
    {
      prop: "extensionsKey",
      type: "text",
      label: "Extensions key",
      placeholder: "e.g. oneDark",
    },
    {prop: "theme", type: "token", label: "Theme", options: ["light", "dark"]},
  ],

  note: `
\`\`\`ts
import { registerCard } from "@pihanga2/core";
import {
  CodeMirrorCard,
  registerStreamParser,
  registerExtensions,
} from "@pihanga2/shadcn/codeMirror";
import { python } from "@codemirror/legacy-modes/mode/python";
import { oneDark } from "@codemirror/theme-one-dark";

// Register complex values once at app initialisation time.
// Props must be plain strings — not live library objects.
registerStreamParser("python", python);
registerExtensions("oneDark", [oneDark]);

// Plain editor — no language extension
registerCard("myApp/editor", CodeMirrorCard({
  value: "...",
  height: "400px",
}));

// With StreamLanguage highlighting
registerCard("myApp/pythonEditor", CodeMirrorCard({
  streamLanguage: "python",
  value: "def hello(): pass",
  height: "400px",
}));

// With a custom theme extension bundle
registerCard("myApp/darkEditor", CodeMirrorCard({
  streamLanguage: "python",
  extensionsKey: "oneDark",
  value: "def hello(): pass",
  height: "400px",
}));
\`\`\`
  `.trim(),
});
