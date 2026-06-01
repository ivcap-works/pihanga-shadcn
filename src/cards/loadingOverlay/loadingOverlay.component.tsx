import * as React from "react";
import clsx from "clsx";

import {Card, type PiCardProps} from "@pihanga2/core";

import {Spinner} from "@/registry/ui/spinner";

import type {LoadingOverlayProps} from "./loadingOverlay.types";
import "./loadingOverlay.css";

export const LoadingOverlayComponent = (
  props: PiCardProps<LoadingOverlayProps>,
): React.ReactNode => {
  const {
    cardName,
    content,
    isLoading,
    label,
    fillParent,
    viewportCentered,
    className,
    contentClassName,
    overlayClassName,
  } = props;

  if (!content) return null;

  return (
    <div
      data-pihanga={cardName}
      className={clsx(
        "overlay-wrapper",
        isLoading && "is-loading",
        fillParent && "fill-parent",
        viewportCentered && "viewport-centered",
        className,
      )}
    >
      <div className={clsx("overlay-content", contentClassName)}>
        <Card cardName={content} parentCard={cardName} />
        <div className={clsx("loading-overlay", overlayClassName)}>
          <div className="loading-overlay__content">
            <Spinner size="icon" />
            <span>{label ?? "Loading..."}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
