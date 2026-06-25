import React from "react";
import {PiCardProps} from "@pihanga2/core";
import {FileUploader} from "react-drag-drop-files";
import {
  DEF_FILE_DROP_FILE_TYPES,
  FileDropEvents,
  FileDropProps,
} from "./fileDrop.types";
import "./fileDrop.css";

type LastDropped = {name: string; file: File};

const KEY = Symbol.for("pihanga.card.FileDrop.LastDropped");

const globalForCache = globalThis as unknown as Record<
  symbol,
  LastDropped | null | undefined
>;

export function get_last_dropped(name: string): File | null {
  const slot = (globalForCache[KEY] ??= null);
  if (slot?.name === name) {
    return slot.file;
  }
  return null;
}

function setLastDropped(value: LastDropped): void {
  globalForCache[KEY] = value;
}

function clearLastDropped(): void {
  globalForCache[KEY] = null;
}

export const FileDropComponent = (
  props: PiCardProps<FileDropProps, FileDropEvents>,
): React.ReactNode => {
  const {
    fileTypes = DEF_FILE_DROP_FILE_TYPES,
    title = "Click or drop a file right here",
    description,
    showProgress = false,
    progress = 0,
    progressStyle = {},
    dropStyle = {},
    onFileDropped,
    onError,
    cardName,
    className,
    _cls,
  } = props;

  function handleChange(file: File | File[]): void {
    const f = Array.isArray(file) ? file[0] : file;
    if (!f) return;
    const {name, size, type} = f;
    setLastDropped({name, file: f});
    onFileDropped({name, size, type});
    // clean up reference to File in a few sec to avoid dangling reference
    setTimeout(clearLastDropped, 2000);
  }

  function handleTypeError(err: unknown): void {
    onError({error: String(err)});
  }

  function renderProgress(): React.ReactNode {
    const label = `${progress}%`;
    const msg = `${label} Complete`;
    const containerStyle = {width: "50%", ...progressStyle};
    return (
      <div className="pi-progress">
        <div className="pi-progress-label">{label}</div>
        <div
          className="pi-progress-container"
          style={containerStyle as React.CSSProperties}
        >
          <div
            className="pi-progress-bar"
            style={{width: label}}
            role="progressbar"
            aria-label={msg}
          />
        </div>
      </div>
    );
  }

  function renderDropZone(): React.ReactElement {
    return (
      <div className="dropzone-msg" style={dropStyle as React.CSSProperties}>
        {title && <h3 className="dropzone-msg-title">{title}</h3>}
        {description && (
          <span className="dropzone-msg-desc">{description}</span>
        )}
      </div>
    );
  }

  function renderFileUploader(): React.ReactNode {
    return (
      <FileUploader
        handleChange={handleChange}
        onTypeError={handleTypeError}
        name="file"
        types={fileTypes}
        hoverTitle=" "
      >
        {renderDropZone()}
      </FileUploader>
    );
  }

  const cn = _cls("root", className);
  return (
    <div className={cn} data-pihanga={cardName}>
      {showProgress ? renderProgress() : renderFileUploader()}
    </div>
  );
};
