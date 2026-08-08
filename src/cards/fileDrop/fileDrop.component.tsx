import React from "react";
import type {PiCardProps} from "@pihanga2/core";
import {FileUploader} from "react-drag-drop-files";
import {
  DEF_FILE_DROP_FILE_TYPES,
  getFileDropTheme,
  type FileDropEvents,
  type FileDropProps,
} from "./fileDrop.types";
import {getIcon} from "../icons";
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
    icon,
    iconProps,
    browseLabel,
    onFileDropped,
    onError,
    cardName,
    theme,
    classNames,
    className,
    _cls,
  } = props;

  // Merge theme (base) with per-card classNames (overrides)
  const cn = {...(theme ? getFileDropTheme(theme) : {}), ...classNames};

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
    const dzCn = ["dropzone-msg", cn.dropZone].filter(Boolean).join(" ");
    return (
      <div className={dzCn} style={dropStyle as React.CSSProperties}>
        {icon && <div className={cn.icon}>{getIcon(icon, iconProps)}</div>}
        {title && (
          <h3
            className={["dropzone-msg-title", cn.title]
              .filter(Boolean)
              .join(" ")}
          >
            {title}
          </h3>
        )}
        {description && (
          <span
            className={["dropzone-msg-desc", cn.description]
              .filter(Boolean)
              .join(" ")}
          >
            {description}
          </span>
        )}
        {browseLabel && <div className={cn.browseButton}>{browseLabel}</div>}
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

  // classNames.root takes precedence over the legacy className prop
  const rootCn = _cls("root", cn.root ?? className);
  return (
    <div className={rootCn} data-pihanga={cardName}>
      {showProgress ? renderProgress() : renderFileUploader()}
    </div>
  );
};
