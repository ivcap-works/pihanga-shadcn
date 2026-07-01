Wraps any content card with a translucent loading spinner overlay.

When `isLoading` is `true`, the spinner appears over the content card (the
content remains mounted and visible beneath the overlay).  When `false`, the
overlay is hidden and the content is fully interactive.

Use it to block interaction during async operations such as data fetches,
form submissions, or file uploads — without unmounting the underlying UI.

Set `fillParent: true` to fill the parent container, or `viewportCentered: true`
to center the spinner in the viewport regardless of the parent layout.
