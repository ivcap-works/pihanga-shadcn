import {
  createCardDeclaration,
  createOnAction,
  registerActions,
  type PiCardRef,
} from "@pihanga2/core";
import type React from "react";

export const ATTACHMENT_CARD = "shad/attachment";

export const Attachment = createCardDeclaration<
  AttachmentProps,
  AttachmentEvents
>(ATTACHMENT_CARD);

export const ATTACHMENT_ACTION = registerActions(ATTACHMENT_CARD, [
  "action_clicked",
  "triggered",
]);

export type AttachmentActionClickedEvent = {id?: string; action: string};
export type AttachmentTriggeredEvent = {id?: string};

export const onAttachmentActionClicked =
  createOnAction<AttachmentActionClickedEvent>(
    ATTACHMENT_ACTION.ACTION_CLICKED,
  );
export const onAttachmentTriggered = createOnAction<AttachmentTriggeredEvent>(
  ATTACHMENT_ACTION.TRIGGERED,
);

export type AttachmentEvents = {
  onActionClicked: AttachmentActionClickedEvent;
  onTriggered: AttachmentTriggeredEvent;
};

/** Upload lifecycle state — drives styling and the title shimmer. */
export type AttachmentState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";

export type AttachmentSize = "default" | "sm" | "xs";

export type AttachmentOrientation = "horizontal" | "vertical";

/** A single action button rendered inside `AttachmentActions`. */
export type AttachmentActionItem = {
  /** Stable id echoed in the `onActionClicked` event. */
  id: string;
  /** Icon name from the Pihanga icon registry. */
  icon: string;
  /** Accessible label — required, since the action is icon-only. */
  ariaLabel: string;
};

export type AttachmentProps = {
  /** Stable id echoed in `onActionClicked` / `onTriggered` events. */
  id?: string;

  /**
   * Icon name from the Pihanga icon registry, rendered inside
   * `AttachmentMedia` (variant `"icon"`). Ignored when `imageSrc` is set.
   */
  icon?: string;

  /**
   * Image URL rendered inside `AttachmentMedia` (variant `"image"`).
   * Takes precedence over `icon`.
   */
  imageSrc?: string;
  /** Accessible alt text for `imageSrc`. */
  imageAlt?: string;

  /** File name / title rendered inside `AttachmentTitle`. */
  title: string;

  /** Secondary metadata (e.g. "PDF · 2.4 MB") rendered inside `AttachmentDescription`. */
  description?: string;

  /**
   * Upload lifecycle state.
   * @default "done"
   */
  state?: AttachmentState;

  /**
   * Attachment size.
   * @default "default"
   */
  size?: AttachmentSize;

  /**
   * Lay the media beside (`"horizontal"`) or above (`"vertical"`) the content.
   * @default "horizontal"
   */
  orientation?: AttachmentOrientation;

  /** Row of icon-only action buttons (e.g. remove, download). */
  actions?: AttachmentActionItem[];

  /**
   * When set, renders a full-card `AttachmentTrigger` overlay; clicking it
   * (or activating it with the keyboard) fires `onTriggered`. Actions
   * remain independently clickable.
   */
  triggerAriaLabel?: string;

  /** Additional Tailwind classes applied to the root `Attachment` element. */
  className?: string;
  /** Inline styles applied to the root `Attachment` element. */
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// shad/attachment-group — horizontally-scrollable row of attachments.
// ---------------------------------------------------------------------------

export const ATTACHMENT_GROUP_CARD = "shad/attachment-group";

export const AttachmentGroup = createCardDeclaration<AttachmentGroupProps>(
  ATTACHMENT_GROUP_CARD,
);

export type AttachmentGroupProps = {
  /** Ordered list of `shad/attachment` card refs to lay out in a row. */
  content: PiCardRef[];
  /** Additional Tailwind classes applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
};
