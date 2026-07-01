Renders a markdown string (or remotely-fetched markdown file) as styled HTML.

Powered by `react-markdown` with:

- **GFM** (GitHub Flavoured Markdown) via `remark-gfm` — tables, strikethrough,
  task lists, auto-links, etc.
- **Math** via `remark-math` + `rehype-katex` — inline `$...$` and block `$$...$$`
  LaTeX expressions.

Provide content via `source` (inline string) or `path` (URL to fetch at runtime).
