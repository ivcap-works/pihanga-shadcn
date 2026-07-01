A drop-zone / clipboard target for pasting or uploading files.

Click the area to focus it, then paste (⌘V / Ctrl+V) to receive image or file
data from the clipboard.  When `withUpload` is `true`, a file-picker button is
also shown.

The card emits `onPastedContent` with an array of `{mimeType, content}` items
when a successful paste occurs, and `onError` when the clipboard data contains
unsupported types.

Use it in document editors, image upload flows, or any workflow where clipboard
input is a primary ingestion mechanism.
