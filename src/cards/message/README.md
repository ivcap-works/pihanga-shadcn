Lays out a single message row in a conversation: avatar, header, message
surface, and footer.

Built on the [shadcn Message](https://ui.shadcn.com/docs/components/base/message)
primitives (`Message`, `MessageAvatar`, `MessageContent`, `MessageHeader`,
`MessageFooter`).

`shad/message` owns the row layout only — render the visible message
surface with a `shad/bubble` card (or any other card) via `contentCard`.

## Slots

| Prop | Slot | Description |
|---|---|---|
| `avatarCard` | `MessageAvatar` | Optional avatar, anchored to the bottom of the row. |
| `headerCard` | `MessageHeader` | Sender name / status, above the surface. |
| `contentCard` | *(required)* | The message surface — typically a `shad/bubble` card. |
| `footerCard` | `MessageFooter` | Delivery status, timestamp, or action buttons. |

## Large content

`contentCard` accepts **any** Pihanga card — not just `shad/bubble`. Use a
`markdown-viewer` card directly (optionally wrapped in a ghost `shad/bubble`)
to render rich assistant output, a `shad/data-table` for tabular results, or
an `shad/attachment-group` for file/image attachments.

## Alignment

Set `align: "end"` for the current user's messages; `"start"` (default) for
the other party. Alignment also flips the row direction so the avatar sits
on the opposite side.

## Grouping

Use `shad/message-group` to stack consecutive messages from the same
sender. Render an empty `MessageAvatar` slot (omit `avatarCard`) on the
earlier messages and only set it on the last one to keep them visually
aligned.
