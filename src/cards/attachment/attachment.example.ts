import {registerIcon} from "@/cards/icons";
import {FileText, FileCode, X, Download} from "lucide-react";
import {definePlayground} from "@/playground/definePlayground";
import {
  Attachment,
  onAttachmentActionClicked,
  onAttachmentTriggered,
  type AttachmentProps,
} from "./index";

registerIcon("attachment-file-text", FileText);
registerIcon("attachment-file-code", FileCode);
registerIcon("attachment-remove", X);
registerIcon("attachment-download", Download);

export default definePlayground<AttachmentProps>({
  cardId: "shad/attachment",
  title: "Attachment",

  preview: (props) => Attachment(props),

  defaultProps: {
    id: "att-1",
    icon: "attachment-file-text",
    title: "sales-dashboard.pdf",
    description: "PDF · 2.4 MB",
    actions: [
      {id: "remove", icon: "attachment-remove", ariaLabel: "Remove sales-dashboard.pdf"},
    ],
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Icon media, title, and description.",
      props: {
        icon: "attachment-file-text",
        title: "sales-dashboard.pdf",
        description: "PDF · 2.4 MB",
      },
    },
    {
      id: "image",
      title: "Image",
      description: "Set orientation to vertical to stack the media above the content.",
      props: {
        imageSrc: "https://github.com/shadcn.png",
        imageAlt: "workspace preview",
        title: "workspace.png",
        description: "PNG · 820 KB",
        orientation: "vertical",
      },
    },
    {
      id: "uploading",
      title: "Uploading",
      description: "Shimmers the title while the state is uploading or processing.",
      props: {
        icon: "attachment-file-text",
        title: "sales-dashboard.pdf",
        description: "Uploading · 64%",
        state: "uploading",
      },
    },
    {
      id: "error",
      title: "Error",
      description: "Destructive tint — keep the failure reason in description.",
      props: {
        icon: "attachment-file-text",
        title: "message-renderer.tsx",
        description: "Failed to upload — file too large",
        state: "error",
      },
    },
    {
      id: "with-actions",
      title: "With actions",
      description: "Icon-only action buttons; each requires an ariaLabel.",
      props: {
        id: "att-1",
        icon: "attachment-file-text",
        title: "sales-dashboard.pdf",
        description: "PDF · 2.4 MB",
        actions: [
          {id: "download", icon: "attachment-download", ariaLabel: "Download sales-dashboard.pdf"},
          {id: "remove", icon: "attachment-remove", ariaLabel: "Remove sales-dashboard.pdf"},
        ],
      },
    },
    {
      id: "with-trigger",
      title: "With trigger",
      description: "Clicking anywhere on the card fires onTriggered.",
      props: {
        id: "att-1",
        icon: "attachment-file-text",
        title: "sales-dashboard.pdf",
        description: "PDF · 2.4 MB",
        triggerAriaLabel: "Open sales-dashboard.pdf",
      },
    },
  ],

  controls: [
    {prop: "title", type: "text", label: "Title", placeholder: "File name…"},
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "e.g. PDF · 2.4 MB",
    },
    {
      prop: "state",
      type: "token",
      label: "State",
      options: ["idle", "uploading", "processing", "error", "done"],
    },
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["default", "sm", "xs"],
    },
    {
      prop: "orientation",
      type: "token",
      label: "Orientation",
      options: ["horizontal", "vertical"],
    },
  ],

  registerEvents: (r, logEvent) => {
    onAttachmentActionClicked(r, (state, ev) => {
      logEvent(state, "onActionClicked", {id: ev.id, action: ev.action});
    });
    onAttachmentTriggered(r, (state, ev) => {
      logEvent(state, "onTriggered", {id: ev.id});
    });
  },

  note: `
\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Attachment, AttachmentGroup, onAttachmentActionClicked} from "@/cards/attachment";
import {registerIcon} from "@/cards/icons";
import {FileText, X} from "lucide-react";

registerIcon("file-text", FileText);
registerIcon("remove", X);

registerCard("myApp/attachments", AttachmentGroup({
  content: ["myApp/att1", "myApp/att2"],
}));

registerCard("myApp/att1", Attachment({
  id: "att1",
  icon: "file-text",
  title: "sales-dashboard.pdf",
  description: "PDF · 2.4 MB",
  actions: [{id: "remove", icon: "remove", ariaLabel: "Remove sales-dashboard.pdf"}],
}));

register((r) => {
  onAttachmentActionClicked(r, (state, {id, action}) => {
    if (action === "remove") {
      state.attachments = state.attachments.filter((a) => a.id !== id);
    }
  });
});
\`\`\`
  `.trim(),
});
