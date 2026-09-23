import * as React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import {getIcon} from "@/cards/icons";
import type {AttachmentEvents, AttachmentProps} from "./attachment.types";

export const AttachmentComponent = (
  props: PiCardProps<AttachmentProps, AttachmentEvents>,
): React.ReactNode => {
  const {
    id,
    icon,
    imageSrc,
    imageAlt = "",
    title,
    description,
    state = "done",
    size = "default",
    orientation = "horizontal",
    actions,
    triggerAriaLabel,
    className,
    style,
    cardName,
    onActionClicked,
    onTriggered,
  } = props;

  return (
    <Attachment
      state={state}
      size={size}
      orientation={orientation}
      className={className}
      style={style}
      data-pihanga={cardName}
    >
      {triggerAriaLabel && (
        <AttachmentTrigger
          aria-label={triggerAriaLabel}
          onClick={() => onTriggered({id})}
        />
      )}

      {imageSrc ? (
        <AttachmentMedia variant="image">
          <img src={imageSrc} alt={imageAlt} />
        </AttachmentMedia>
      ) : icon ? (
        <AttachmentMedia variant="icon">{getIcon(icon)}</AttachmentMedia>
      ) : null}

      <AttachmentContent>
        <AttachmentTitle>{title}</AttachmentTitle>
        {description && (
          <AttachmentDescription>{description}</AttachmentDescription>
        )}
      </AttachmentContent>

      {actions && actions.length > 0 && (
        <AttachmentActions>
          {actions.map((a) => (
            <AttachmentAction
              key={a.id}
              aria-label={a.ariaLabel}
              onClick={() => onActionClicked({id, action: a.id})}
            >
              {getIcon(a.icon)}
            </AttachmentAction>
          ))}
        </AttachmentActions>
      )}
    </Attachment>
  );
};
