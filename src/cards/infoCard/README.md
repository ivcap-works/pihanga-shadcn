A structural display card built on the shadcn `Card` primitives
(`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
`CardContent`, `CardFooter`).

All five slots are **optional** — only slots that receive a prop are rendered.

## Slots

| Prop | Renders | Description |
|---|---|---|
| `title` | `CardTitle` | Bold header text. |
| `description` | `CardDescription` | Muted sub-header text below the title. |
| `actionCard` | `CardAction` | Top-right of the header — badge, button, icon card. |
| `contentCard` | `CardContent` | Main body — any Pihanga card. |
| `footerCard` | `CardFooter` | Bottom row — actions, metadata, pagination. |

The header (`CardHeader`) is rendered automatically whenever at least one of
`title`, `description`, or `actionCard` is supplied.

## Per-element styling

Every slot has its own `*ClassName` prop so you can target individual elements
without overriding sibling slots:

| Prop | Element |
|---|---|
| `className` | Root `<div data-slot="card">` |
| `headerClassName` | `<div data-slot="card-header">` |
| `titleClassName` | `<div data-slot="card-title">` |
| `descriptionClassName` | `<div data-slot="card-description">` |
| `actionClassName` | `<div data-slot="card-action">` |
| `contentClassName` | `<div data-slot="card-content">` |
| `footerClassName` | `<div data-slot="card-footer">` |
| `style` | Inline styles on the root element |
