import {
  DEF_ERROR_COLOR,
  DEF_EVENT_DURATION_SECONDS,
  DEF_HEIGHT,
  DEF_OVERLAY_OPACITY,
  DEF_PASTE_FIRST_REMINDER,
  DEF_SUCCESS_COLOR,
  PasteItem,
  PasteTargetEvents,
  PasteTargetProps,
} from "@/cards/pasteTarget/pasteTarget.types";
import {PiCardProps} from "@pihanga2/core";
import React, {useRef, useState} from "react";

import "./pasteTarget.css";
import clsx from "clsx";
import {Button} from "@/registry/ui/button";

// /* 3. Stretch the child to cover the parent entirely */
// top: 0,
// left: 0,
// right: 0,
// bottom: 0,

// /* 4. Ensure the child is visually stacked above the parent's content */
// z-index: 10,

// /* Optional: Make the overlay visible (e.g., semi-transparent black) */
// overlayOpacity: "rgba(0, 0, 0, 0.5)";
// }

export const PasteTargetComponent = (
  props: PiCardProps<PasteTargetProps, PasteTargetEvents>,
): React.ReactNode => {
  const {
    title, //  = "Paste content right here",
    description,
    pasteFirstReminder = DEF_PASTE_FIRST_REMINDER,
    withUpload,

    height = DEF_HEIGHT,

    onPastedContent,

    successColor = DEF_SUCCESS_COLOR,
    errorColor = DEF_ERROR_COLOR,
    eventDurationSeconds = DEF_EVENT_DURATION_SECONDS,
    eventOpacity = DEF_OVERLAY_OPACITY,
    cardName,
    className,
    _cls,
  } = props;
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0);
  const [overlayBackground, setOverlayBackground] = useState<string>("gray");
  const timerRef = React.useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const overlayStyle: React.CSSProperties = {
    backgroundColor: overlayBackground,
    opacity: overlayOpacity,
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    event.preventDefault();
    const clipboardData =
      event.clipboardData ||
      (window as Window & {clipboardData?: DataTransfer}).clipboardData;

    if (clipboardData) {
      const pItems = clipboardData.items;
      const items: PasteItem[] = [];
      for (let i = 0; i < pItems.length; i++) {
        const pi = pItems[i];
        const mimeType = pi.type;
        const content = clipboardData.getData(pi.type);
        if (!(content == "" || content == "\n")) {
          items.push({mimeType, content});
        }
      }
      onPastedContent({items});
      setOverlayBackground(successColor);
    } else {
      setOverlayBackground(errorColor);
    }
    setOverlayOpacity(eventOpacity);
    if (textareaRef.current) textareaRef.current.blur();

    // Set a timeout to switch the color back after 'n' seconds
    const newTimerId = setTimeout(() => {
      setOverlayOpacity(0);
      timerRef.current = null; // Clear the ref after the timeout executes
    }, eventDurationSeconds * 1000); // Convert seconds to milliseconds

    // Save the new timer ID to the ref (unknown necessary type casting)
    timerRef.current = newTimerId as unknown as number;
  };

  // Cleanup function to clear the timer when the component unmounts
  React.useEffect(() => {
    return () => {
      const ref = timerRef.current;
      if (ref) {
        clearTimeout(ref);
      }
    };
  }, []); // runs only on mount/unmount

  function renderPasteHandler() {
    return (
      <textarea
        onPaste={handlePaste}
        onFocus={() => {
          console.log("...focused");
          setIsFocused(true);
        }}
        onBlur={() => setIsFocused(false)}
        style={overlayStyle}
        // 🔑 CRUCIAL: Auto-focus the element so it's ready to receive the paste event.
        // autoFocus
        readOnly
        ref={textareaRef}
      />
    );
  }

  function onUpload(ev: React.MouseEvent<HTMLButtonElement>) {
    console.log("Clicked!!!");
    ev.stopPropagation();
    ev.preventDefault();
  }

  function renderTitle() {
    if (title) {
      return <h2 className="paste-target-msg-title">{title}</h2>;
    } else {
      return (
        <div className="paste-target-msg-title">
          Paste
          {!isFocused && withUpload && (
            <>
              &nbsp;or&nbsp;
              <Button
                onClick={onUpload}
                style={{position: "relative", zIndex: 30}}
              >
                Upload
              </Button>
            </>
          )}
          &nbsp;Specification here
        </div>
      );
    }
  }

  const cn = _cls("root", className || "pihanga-paste-target");

  return (
    <div
      className={clsx(cn, isFocused && "pihanga-paste-target-focused")}
      data-pihanga={cardName}
      style={{position: "relative", height}}
    >
      <div className="paste-target-label">
        {renderTitle()}
        {description && (
          <span className="paste-target-msg-desc">{description}</span>
        )}
        <div className="paste-target-focus-reminder">{pasteFirstReminder}</div>
      </div>
      {renderPasteHandler()}
    </div>
  );
};
