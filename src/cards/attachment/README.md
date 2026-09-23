Displays a file or image attachment — media, name, metadata, upload state,
and optional actions.

Built on the [shadcn Attachment](https://ui.shadcn.com/docs/components/base/attachment)
primitives (`Attachment`, `AttachmentMedia`, `AttachmentContent`,
`AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`,
`AttachmentAction`, `AttachmentTrigger`).

Use it in chat composers, message threads, and upload lists — typically
inside a `shad/message` footer, or grouped with `shad/attachment-group`.

## Media

- **`icon`** — a registered icon name rendered in a rounded icon badge.
- **`imageSrc`** / **`imageAlt`** — renders an `<img>` preview instead;
  takes precedence over `icon`.

## Upload state

`state`: `"idle"` | `"uploading"` | `"processing"` | `"error"` | `"done"`
(default). `"uploading"` / `"processing"` shimmer the title; `"error"`
tints the border/media red — keep the failure reason in `description` so
the state isn't conveyed by color alone.

## Actions

`actions` is a list of icon-only buttons (e.g. remove, download). Each
requires an `ariaLabel` describing the action and its target. Clicking one
fires `onActionClicked` with `{id, action}`.

## Trigger

Set `triggerAriaLabel` to make the whole card clickable/keyboard-activatable
(fires `onTriggered`) while keeping the action buttons independently
clickable.

## Group

Use `shad/attachment-group` to lay out multiple attachments in a
horizontally scrollable, snapping row.
