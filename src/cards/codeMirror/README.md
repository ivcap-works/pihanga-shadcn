# CodeMirror Card

A Pihanga card wrapping [`@uiw/react-codemirror`](https://github.com/uiwjs/react-codemirror) with a **StreamLanguage plugin extension mechanism** for per-registration language customisation.

## Features

- 📝 Editable or read-only code editor via `readOnly`
- 🔌 **Language support by key** — register a `StreamParser` (legacy modes) or a full CodeMirror 6 extension bundle once, then reference it by string key from any card
- 🌙 Built-in `light` / `dark` themes, plus **any registered theme** by key
- 🧩 Editor setup flags (`lineNumbers`, `foldGutter`, `dropCursor`, `allowMultipleSelections`, `indentOnInput`)
- 📐 Sizing with `height`, `minHeight`, `maxHeight`

## Installation

```sh
npm install @pihanga2/codemirror
```

Peer dependencies:

```sh
npm install react react-dom @pihanga2/core
```

## Basic usage

```ts
import "@pihanga2/codemirror/cards/codeMirror";
import { CodeMirror } from "@pihanga2/codemirror/cards/codeMirror";
import { registerCard } from "@pihanga2/core";

registerCard("myApp/editor", CodeMirror({
  value: 'console.log("hello")',
  height: "400px",
}));
```

## Installing and registering a language

Props must be plain JSON, so a language is always **installed**, **registered under a key**
at app start-up, and then **referenced by that key** in the card.

Use the modern `@codemirror/lang-*` package whenever one exists. It provides highlighting plus
completion, folding, and auto-closing where the language supports them. Use
`@codemirror/legacy-modes` only for languages with no modern package, such as shell.

| Language | Package to install | Register with | Use in card |
|---|---|---|---|
| Python | `@codemirror/lang-python` | `registerExtensions(key, [python()])` | `extensionsKey: key` |
| YAML | `@codemirror/lang-yaml` | `registerExtensions(key, [yaml()])` | `extensionsKey: key` |
| XML | `@codemirror/lang-xml` | `registerExtensions(key, [xml()])` | `extensionsKey: key` |
| JSON | `@codemirror/lang-json` | `registerExtensions(key, [json()])` | `extensionsKey: key` |
| Shell (no modern package) | `@codemirror/legacy-modes` | `registerStreamParser(key, shell)` | `streamLanguage: key` |

### Modern languages (recommended)

Python, YAML, XML, and JSON each have a `@codemirror/lang-*` package. Each exports a factory
function that returns a `LanguageSupport` extension, so register it with `registerExtensions()`:

```sh
npm install @codemirror/lang-python @codemirror/lang-yaml @codemirror/lang-xml @codemirror/lang-json
```

```ts
// app start-up, once
import { python } from "@codemirror/lang-python";
import { yaml } from "@codemirror/lang-yaml";
import { xml } from "@codemirror/lang-xml";
import { registerExtensions } from "@pihanga2/codemirror/cards/codeMirror";

registerExtensions("python", [python()]);
registerExtensions("yaml", [yaml()]);
registerExtensions("xml", [xml()]);

// in a card
registerCard("myApp/pythonEditor", CodeMirror({
  extensionsKey: "python",
  value: "def hello(): pass",
  height: "400px",
}));

registerCard("myApp/xmlEditor", CodeMirror({
  extensionsKey: "xml",
  value: "<root><item id=\"1\"/></root>",
  height: "400px",
}));
```

`xml()` also accepts an optional config (for example `xml({ autoCloseTags: false })` or a
schema for tag and attribute completion).

### Languages without a modern package (legacy modes)

For languages such as shell, use `@codemirror/legacy-modes`. These are older `StreamParser`
modes that give syntax highlighting only:

```sh
npm install @codemirror/legacy-modes
```

```ts
// app start-up, once
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { registerStreamParser } from "@pihanga2/codemirror/cards/codeMirror";

registerStreamParser("shell", shell);

// in a card
registerCard("myApp/shellEditor", CodeMirror({
  streamLanguage: "shell",
  value: "echo hello",
  height: "200px",
}));
```

Any `StreamParser` works, including your own. Do not use the legacy XML, Python, or YAML
modes when a `@codemirror/lang-*` package is available.

### Combining a language with a theme

Register each piece under its own key and set both props:

```ts
import { python } from "@codemirror/lang-python";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { registerExtensions } from "@pihanga2/codemirror/cards/codeMirror";

registerExtensions("python", [python()]);
registerExtensions("dracula", [draculaInit()]);

registerCard("myApp/editor", CodeMirror({
  extensionsKey: "python",
  theme: "dracula",
  value: "print('hi')",
  height: "400px",
}));
```

### Installing a language or theme package

Every extra package is an ordinary npm dependency of **your** app. Install it yourself;
`@pihanga2/codemirror` does not bundle language packages, so only the ones you register are
added to your bundle.

## Themes

`theme` accepts:

- `"light"` (default) — built-in light theme
- `"dark"` — built-in dark theme
- any key registered with `registerExtensions()` — applied as a CodeMirror theme extension bundle

An unregistered key logs a `console.warn` and falls back to `"light"`.

## Editor setup and sizing

`basicSetup` flags default to CodeMirror's own defaults (all on), so existing cards are unaffected.
Set any of them to `false` to turn that feature off:

```ts
CodeMirror({
  value: "...",
  lineNumbers: false,
  foldGutter: false,
  dropCursor: false,
  allowMultipleSelections: false,
  indentOnInput: false,
  height: "auto",
  minHeight: "120px",
  maxHeight: "600px",
});
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `""` | Code content |
| `readOnly` | `boolean` | `false` | Disable editing |
| `streamLanguage` | `string` | — | Key of a `StreamParser` registered with `registerStreamParser()` |
| `extensionsKey` | `string` | — | Key of an extension bundle registered with `registerExtensions()` |
| `theme` | `"light" \| "dark" \| string` | `"light"` | Built-in theme, or a key registered with `registerExtensions()` |
| `lineNumbers` | `boolean` | `true` | Line-number gutter |
| `foldGutter` | `boolean` | `true` | Code-folding gutter |
| `dropCursor` | `boolean` | `true` | Drop cursor while dragging text |
| `allowMultipleSelections` | `boolean` | `true` | Multiple selection ranges |
| `indentOnInput` | `boolean` | `true` | Re-indent the line while typing |
| `height` | `string` | `"auto"` | CSS height of the editor |
| `minHeight` | `string` | — | CSS minimum height |
| `maxHeight` | `string` | — | CSS maximum height (scrolls beyond this) |
| `className` | `string` | — | Extra CSS class on the wrapper |

## Events

| Event | Payload | Description |
|---|---|---|
| `onChanged` | `{ value: string }` | Fired on every edit |

```ts
import { onCodeMirrorChanged } from "@pihanga2/codemirror/cards/codeMirror";

onCodeMirrorChanged("myApp/editor", (state, { value }) => ({
  ...state,
  code: value,
}));
```
