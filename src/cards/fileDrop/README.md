A drag-and-drop (or click-to-upload) file input zone.

Drop a file onto the highlighted area or click it to open a file picker.
Accepted file extensions are controlled via `fileTypes`.  While an upload is
in progress, set `showProgress` to `true` and update `progress` (0–100) to
display a progress bar in place of the drop zone.

The card emits `onFileDropped` with `{name, size, type}` when a file is
accepted, and `onError` when the user drops a file whose extension is not
in `fileTypes`.

Use `get_last_dropped(name)` to retrieve the raw `File` object immediately
after an `onFileDropped` event fires (the reference is cleared after ~2 s).
