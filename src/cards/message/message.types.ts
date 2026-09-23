import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";
import type React from "react";

export const MESSAGE_CARD = "shad/message";

export const Message = createCardDeclaration<MessageProps>(MESSAGE_CARD);

export type MessageProps = {
  /**
   * Alignment of the message row.
   * - `"start"` — sender / left-hand messages (default).
   * - `"end"` — receiver / current-user messages (right-hand side).
   * @default "start"
   */
  align?: "start" | "end";

  /**
   * Pihanga card reference rendered inside `MessageAvatar`
   * (typically a `shad/avatar` card). Omit to render no avatar slot.
   */
  avatarCard?: PiCardRef;

  /**
   * Pihanga card reference rendered above the message surface, inside
   * `MessageHeader` (e.g. a sender name via `shad/typography`).
   */
  headerCard?: PiCardRef;

  /**
   * Pihanga card reference rendered as the message surface itself.
   * Typically a `shad/bubble` card, but any card works — including
   * "large" content such as a `markdown-viewer` or `shad/data-table` card.
   */
  contentCard: PiCardRef;

  /**
   * Pihanga card reference rendered below the message surface, inside
   * `MessageFooter` (e.g. delivery status, timestamps, or action buttons).
   */
  footerCard?: PiCardRef;

  /** Additional Tailwind classes applied to the root `Message` element. */
  className?: string;
  /** Additional Tailwind classes applied to `MessageAvatar`. */
  avatarClassName?: string;
  /** Additional Tailwind classes applied to `MessageContent`. */
  contentClassName?: string;
  /** Additional Tailwind classes applied to `MessageHeader`. */
  headerClassName?: string;
  /** Additional Tailwind classes applied to `MessageFooter`. */
  footerClassName?: string;

  /** Inline styles applied to the root `Message` element. */
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// shad/message-group — stack consecutive messages from the same sender.
// ---------------------------------------------------------------------------

export const MESSAGE_GROUP_CARD = "shad/message-group";

export const MessageGroup =
  createCardDeclaration<MessageGroupProps>(MESSAGE_GROUP_CARD);

export type MessageGroupProps = {
  /** Ordered list of `shad/message` (or other) card refs to stack. */
  content: PiCardRef[];
  /** Additional Tailwind classes applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
};
