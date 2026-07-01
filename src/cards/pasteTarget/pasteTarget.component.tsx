import {
  DEF_ERROR_COLOR,
  DEF_EVENT_DURATION_SECONDS,
  DEF_HEIGHT,
  DEF_OVERLAY_OPACITY,
  DEF_PASTE_FIRST_REMINDER,
  DEF_SUCCESS_COLOR,
  type PasteItem,
  type PasteTargetEvents,
  type PasteTargetProps,
} from "@/cards/pasteTarget/pasteTarget.types";
import type {PiCardProps} from "@pihanga2/core";
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
    fileTypes,

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          setIsFocused(true);
        }}
        onBlur={() => setIsFocused(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          resize: "none",
          background: "transparent",
          cursor: isFocused ? "copy" : "pointer",
          ...overlayStyle,
        }}
        // 🔑 CRUCIAL: Focus the element before pasting so it receives the paste event.
        // autoFocus
        readOnly
        ref={textareaRef}
      />
    );
  }

  /** Map friendly file-type labels to accept= strings for the hidden input. */
  function buildAccept(): string | undefined {
    if (!fileTypes?.length) return undefined;
    return fileTypes
      .map((t) => {
        const ext = t.toLowerCase();
        if (ext === "jpg" || ext === "jpeg") return ".jpg,.jpeg";
        return `.${ext}`;
      })
      .join(",");
  }

  function flashOverlay(color: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOverlayBackground(color);
    setOverlayOpacity(eventOpacity);
    const id = setTimeout(() => {
      setOverlayOpacity(0);
      timerRef.current = null;
    }, eventDurationSeconds * 1000);
    timerRef.current = id as unknown as number;
  }

  function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    // Reset input so the same file can be re-selected later.
    ev.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) ?? "";
      onPastedContent({items: [{mimeType: file.type, content}]});
      flashOverlay(successColor);
    };
    reader.onerror = () => {
      flashOverlay(errorColor);
    };
    reader.readAsDataURL(file);
  }

  function onUpload(ev: React.MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation();
    ev.preventDefault();
    fileInputRef.current?.click();
  }

  function renderTitle() {
    const uploadBtn = !isFocused && withUpload && (
      <Button
        onClick={onUpload}
        style={{position: "relative", zIndex: 30, pointerEvents: "auto"}}
      >
        Upload
      </Button>
    );

    if (title) {
      return (
        <div className="paste-target-msg-title">
          <h2>{title}</h2>
          {uploadBtn}
        </div>
      );
    } else {
      return (
        <div className="paste-target-msg-title">
          Paste
          {uploadBtn && (
            <>
              &nbsp;or&nbsp;
              {uploadBtn}
            </>
          )}
          &nbsp;here
        </div>
      );
    }
  }

  const cn = _cls("root", className || "pihanga-paste-target");

  return (
    <div
      className={clsx(cn, isFocused && "pihanga-paste-target-focused")}
      data-pihanga={cardName}
      style={{position: "relative", height, width: "100%"}}
    >
      <div
        className="paste-target-label"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          // zIndex must be above textarea (10) so the Upload button is clickable.
          // pointer-events: none lets click/focus pass through to the textarea,
          // EXCEPT on children that override with pointer-events: auto (the button).
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {renderTitle()}
        {description && (
          <span className="paste-target-msg-desc">{description}</span>
        )}
        <div className="paste-target-focus-reminder">{pasteFirstReminder}</div>
      </div>
      {renderPasteHandler()}
      {/* Hidden file input — triggered programmatically by the Upload button */}
      {withUpload && (
        <input
          type="file"
          ref={fileInputRef}
          accept={buildAccept()}
          onChange={handleFileChange}
          style={{display: "none"}}
        />
      )}
    </div>
  );
};
