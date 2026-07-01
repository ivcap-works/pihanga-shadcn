/**
 * Playground definition for the `paste-target` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  PasteTarget,
  onContentPasted,
  onPasteError,
  type PasteTargetProps,
} from "./index";

export default definePlayground<PasteTargetProps>({
  cardId: "paste-target",
  title: "Paste Target",

  preview: (props) => PasteTarget(props),

  defaultProps: {
    title: "Paste image here",
    description: "Supports JPG, PNG, and GIF",
    fileTypes: ["JPG", "PNG", "GIF"],
    withUpload: false,
    height: "120px",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Minimal paste zone — title and description guide the user.",
      props: {
        title: "Paste image here",
        description: "Supports JPG, PNG, and GIF",
        fileTypes: ["JPG", "PNG", "GIF"],
      },
    },
    {
      id: "with-upload",
      title: "With upload",
      description: "Adds a file-picker button alongside the paste zone.",
      props: {
        title: "Upload or paste",
        description: "JPG, PNG, PDF up to 10 MB",
        fileTypes: ["JPG", "PNG", "PDF"],
        withUpload: true,
      },
    },
    {
      id: "tall",
      title: "Tall",
      description: "Larger drop zone — useful as a primary content area.",
      props: {
        title: "Drop or paste content",
        description: "Any image format",
        fileTypes: ["JPG", "PNG", "GIF", "WEBP"],
        height: "240px",
      },
    },
    {
      id: "custom-colors",
      title: "Custom feedback colors",
      description:
        "Customize the success and error flash colors for brand alignment.",
      props: {
        title: "Paste here",
        fileTypes: ["PNG"],
        successColor: "#86efac",
        errorColor: "#fca5a5",
        eventDurationSeconds: 2,
      },
    },
  ],

  controls: [
    {
      prop: "title",
      type: "text",
      label: "Title",
      placeholder: "Paste image here",
    },
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "Supported formats…",
    },
    {prop: "withUpload", type: "boolean", label: "Show upload button"},
    {prop: "height", type: "text", label: "Height", placeholder: "e.g. 120px"},
  ],

  registerEvents: (r, logEvent) => {
    onContentPasted(r, (state, ev) => {
      logEvent(state, "onContentPasted", {
        itemCount: (ev as {items?: unknown[]}).items?.length ?? 0,
      });
    });
    onPasteError(r, (state, ev) => {
      logEvent(state, "onPasteError", {error: ev.error});
    });
  },

  note: `
Inside \`app.pihanga.ts\`, handle pasted content:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {PasteTarget, onContentPasted, onPasteError} from "@/cards/pasteTarget";

register((r) => {
  onContentPasted(r, (state, {items}) => {
    // Each item has { mimeType: string, content: string (base64) }
    state.pastedImages = items.filter((i) =>
      i.mimeType.startsWith("image/"),
    );
  });

  onPasteError(r, (state, {error}) => {
    state.lastError = error;
  });
});

registerCard("myApp/imagePaster", PasteTarget({
  title:       "Paste screenshot",
  description: "PNG or JPG from clipboard",
  fileTypes:   ["PNG", "JPG"],
  withUpload:  true,
}));
\`\`\`
  `.trim(),
});
