import {MarkdownViewer} from "./markdownViewer.types";
import {definePlayground} from "@/playground/definePlayground";
import type {MarkdownViewerProps} from "./markdownViewer.types";

/**
 * Example: render an inline markdown string.
 */
export const markdownViewerInlineExample = MarkdownViewer({
  source: `# Hello from Markdown

This card renders **Markdown** including:

- GitHub Flavoured Markdown (GFM) via \`remark-gfm\`
- Math expressions via \`remark-math\` + \`rehype-katex\`

Inline math: $E = mc^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$
`,
});

/**
 * Example: fetch and render a remote markdown file.
 */
export const markdownViewerRemoteExample = MarkdownViewer({
  path: "/README.md",
  maxBodyLength: 500,
});

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<MarkdownViewerProps>({
  cardId: "markdown-viewer",
  title: "Markdown Viewer",

  introduction: `
Renders a markdown string (or remotely-fetched markdown file) as styled HTML.

Powered by \`react-markdown\` with:

- **GFM** (GitHub Flavoured Markdown) via \`remark-gfm\` — tables, strikethrough,
  task lists, auto-links, etc.
- **Math** via \`remark-math\` + \`rehype-katex\` — inline \`$...$\` and block \`$$...$$\`
  LaTeX expressions.

Provide content via \`source\` (inline string) or \`path\` (URL to fetch at runtime).
  `.trim(),

  preview: (props) => MarkdownViewer(props),

  defaultProps: {
    source: `# Hello from Markdown

This card renders **bold**, *italic*, and \`inline code\`.

## Lists

- GitHub Flavoured Markdown (tables, task lists, strikethrough)
- Math via KaTeX: $E = mc^2$

## Table

| Name  | Role  |
|-------|-------|
| Alice | Admin |
| Bob   | Editor |
`,
  },

  facets: [
    {
      id: "inline",
      title: "Inline source",
      description: "Markdown string provided directly via the `source` prop.",
      props: {
        source: `# Inline Markdown

**Bold**, *italic*, \`code\`, and [links](https://example.com).

> Blockquote text here.

\`\`\`ts
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`
`,
      },
    },
    {
      id: "gfm",
      title: "GFM features",
      description:
        "GitHub Flavoured Markdown: tables, task lists, strikethrough.",
      props: {
        source: `## GFM Features

| Column A | Column B | Column C |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |

- [x] Completed task
- [ ] Pending task
- [x] Another done item

~~Strikethrough text~~
`,
      },
    },
    {
      id: "math",
      title: "Math (KaTeX)",
      description:
        "Inline and block LaTeX expressions via remark-math + rehype-katex.",
      props: {
        source: `## Math Expressions

Inline: $E = mc^2$

Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
`,
      },
    },
    {
      id: "remote",
      title: "Remote file",
      description:
        "Fetch and render a markdown file from a URL via the `path` prop.",
      props: {
        path: "/README.md",
        maxBodyLength: 800,
      },
    },
  ],

  controls: [
    {
      prop: "source",
      type: "text",
      label: "Source",
      placeholder: "# My markdown content…",
    },
    {
      prop: "path",
      type: "text",
      label: "Remote path",
      placeholder: "/README.md",
    },
    {
      prop: "maxBodyLength",
      type: "text",
      label: "Max body length",
      placeholder: "-1 (no limit)",
    },
    {prop: "className", type: "text", label: "Extra classes"},
  ],

  note: `
\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {MarkdownViewer} from "@/cards/markdownViewer";
import {memo} from "@pihanga2/core";
import type {AppState} from "@/app.state";

// From inline state string:
registerCard("myApp/docViewer", MarkdownViewer({
  source: memo((s: AppState) => s.selectedDocument?.content),
}));

// From a remote file (fetched at runtime):
registerCard("myApp/readme", MarkdownViewer({
  path: "/docs/getting-started.md",
}));
\`\`\`
  `.trim(),
});
