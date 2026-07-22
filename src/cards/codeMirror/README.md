# CodeMirror Card

A Pihanga card wrapping [`@uiw/react-codemirror`](https://github.com/uiwjs/react-codemirror) with a **StreamLanguage plugin extension mechanism** for per-registration language customisation.

## Features

- 📝 Editable or read-only code editor via `readOnly`
- 🔌 **Plugin extension mechanism** — pass any `StreamParser` via `streamLanguage`; the card calls `StreamLanguage.define()` internally so callers don't need to import it
- 🧩 Full CodeMirror 6 `extensions` prop for themes, linters, keymaps, etc.
- 🌙 Light/dark `theme` support
- 🔢 Optional `lineNumbers` gutter (default: on)
- 📐 Configurable `height`

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
import { CodeMirrorCard } from "@pihanga2/codemirror/cards/codeMirror";
import { registerCard } from "@pihanga2/core";

registerCard("myApp/editor", CodeMirrorCard({
  value: 'console.log("hello")',
  height: "400px",
}));
```

## With StreamLanguage highlighting

Install a language mode from `@codemirror/legacy-modes`:

```sh
npm install @codemirror/legacy-modes
```

Then plug it in at registration time — **no changes to the card required**:

```ts
import { python }   from "@codemirror/legacy-modes/mode/python";
import { yaml }     from "@codemirror/legacy-modes/mode/yaml";
import { shell }    from "@codemirror/legacy-modes/mode/shell";

registerCard("myApp/pythonEditor", CodeMirrorCard({
  streamLanguage: python,
  value: "def hello(): pass",
  height: "400px",
}));
```

`streamLanguage` accepts any `StreamParser<unknown>` — you can write your own or use
the ready-made collection in `@codemirror/legacy-modes`.

## With additional extensions

```ts
import { oneDark } from "@codemirror/theme-one-dark";
import { python }  from "@codemirror/legacy-modes/mode/python";

registerCard("myApp/editor", CodeMirrorCard({
  streamLanguage: python,
  extensions: [oneDark],
  height: "600px",
}));
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `""` | Code content |
| `readOnly` | `boolean` | `false` | Disable editing |
| `streamLanguage` | `StreamParser<unknown>` | — | Legacy-mode language parser |
| `extensions` | `Extension[]` | — | Extra CodeMirror 6 extensions |
| `theme` | `"light" \| "dark" \| Extension` | — | Editor theme |
| `lineNumbers` | `boolean` | `true` | Show line-number gutter |
| `height` | `string` | `"auto"` | CSS height of the editor |
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
