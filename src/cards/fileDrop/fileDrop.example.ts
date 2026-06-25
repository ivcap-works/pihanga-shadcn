/**
 * Playground definition for the `shad/file-drop` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  FileDrop,
  onFileDropError,
  onFileDropped,
  type FileDropProps,
} from "./index";

export default definePlayground<FileDropProps>({
  // ── Required ──────────────────────────────────────────────────────────
  cardId: "shad/file-drop",
  title: "File Drop",

  introduction: `
A drag-and-drop (or click-to-upload) file input zone.

Drop a file onto the highlighted area or click it to open a file picker.
Accepted file extensions are controlled via \`fileTypes\`.  While an upload is
in progress, set \`showProgress\` to \`true\` and update \`progress\` (0–100) to
display a progress bar in place of the drop zone.

The card emits \`onFileDropped\` with \`{name, size, type}\` when a file is
accepted, and \`onError\` when the user drops a file whose extension is not
in \`fileTypes\`.

Use \`get_last_dropped(name)\` to retrieve the raw \`File\` object immediately
after an \`onFileDropped\` event fires (the reference is cleared after ~2 s).
  `.trim(),

  // ── Live preview ───────────────────────────────────────────────────────
  preview: (props) => FileDrop(props),

  defaultProps: {
    fileTypes: ["JPG", "PNG", "PDF"],
    title: "Click or drop a file here",
    description: "Supports JPG, PNG, and PDF",
    showProgress: false,
    progress: 0,
  },

  // ── Usage scenarios (tabs) ─────────────────────────────────────────────
  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Default drop zone with title and description.",
      props: {
        fileTypes: ["JPG", "PNG", "PDF"],
        title: "Click or drop a file here",
        description: "Supports JPG, PNG, and PDF",
      },
    },
    {
      id: "images-only",
      title: "Images only",
      description: "Restrict accepted types to common image formats.",
      props: {
        fileTypes: ["JPG", "PNG", "GIF", "WEBP"],
        title: "Upload an image",
        description: "JPG, PNG, GIF, or WEBP",
      },
    },
    {
      id: "uploading",
      title: "Uploading",
      description:
        "Show a progress bar while the file is being uploaded to a server.",
      props: {
        fileTypes: ["JPG", "PNG", "PDF"],
        title: "Uploading…",
        showProgress: true,
        progress: 45,
      },
    },
    {
      id: "no-description",
      title: "Title only",
      description: "Minimal drop zone with just a heading.",
      props: {
        fileTypes: ["PDF"],
        title: "Drop a PDF here",
      },
    },
  ],

  // ── Interactive prop editor ────────────────────────────────────────────
  controls: [
    {
      prop: "title",
      type: "text",
      label: "Title",
      placeholder: "Click or drop a file here",
    },
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Supported formats…",
    },
    {prop: "showProgress", type: "boolean", label: "Show progress bar"},
    {
      prop: "progress",
      type: "text",
      label: "Progress (0–100)",
      placeholder: "0",
    },
  ],

  // ── Event logging ──────────────────────────────────────────────────────
  registerEvents: (r, logEvent) => {
    onFileDropped(r, (state, ev) => {
      logEvent(state, "onFileDropped", {
        name: ev.name,
        size: ev.size,
        type: ev.type,
      });
    });
    onFileDropError(r, (state, ev) => {
      logEvent(state, "onFileDropError", {error: ev.error});
    });
  },

  // ── Copy-paste snippet ─────────────────────────────────────────────────
  note: `
\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {
  FileDrop,
  onFileDropped,
  onFileDropError,
  get_last_dropped,
} from "@/cards/fileDrop";

register((r) => {
  onFileDropped(r, (state, {name, size, type}) => {
    // Retrieve the raw File object (available for ~2 s after the event)
    const file = get_last_dropped(name);
    state.pendingUpload = {name, size, type, file};
  });

  onFileDropError(r, (state, {error}) => {
    state.uploadError = error;
  });
});

registerCard("myApp/uploader", FileDrop({
  fileTypes:   ["PDF", "PNG", "JPG"],
  title:       "Drop your file here",
  description: "PDF, PNG, or JPG up to 10 MB",
}));
\`\`\`
  `.trim(),
});
