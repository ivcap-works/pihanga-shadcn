import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {
  useBreakpoint,
  useContainerBreakpoint,
} from "@/components/hooks/use-breakpoint";
import type {ConditionalProps} from "./conditional.types";

/**
 * ConditionalComponent
 *
 * Renders the `content` card when the combined visibility condition is `true`,
 * returns `null` otherwise.
 *
 * Visibility rules (all must be satisfied):
 *  1. `show`          — manual boolean gate (defaults to `true` when omitted)
 *  2. `showOn`        — breakpoint selector (always `true` when omitted)
 *     • `containerQuery: false` (default) → evaluated against the **viewport**
 *       via `window.matchMedia`
 *     • `containerQuery: true`            → evaluated against the width of the
 *       **enclosing container** via `ResizeObserver`; a thin `<div>` wrapper
 *       is rendered so the container width can be measured
 *
 * Both hooks are always called unconditionally (React rules); whichever is not
 * "active" receives `undefined` and returns `true` immediately.
 */
export const ConditionalComponent = (
  props: PiCardProps<ConditionalProps>,
): React.ReactNode => {
  const {
    cardName,
    show = true,
    showOn,
    containerQuery = false,
    content,
    alternativeContent,
    keepMounted = false,
  } = props;

  // Ref for container-query mode — attached to the wrapper div.
  // Always created (hooks must not be conditional).
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Viewport breakpoint: active when containerQuery is false.
  const viewportMatch = useBreakpoint(containerQuery ? undefined : showOn);

  // Container breakpoint: active when containerQuery is true.
  const containerMatch = useContainerBreakpoint(
    containerQuery ? showOn : undefined,
    wrapperRef,
  );

  const breakpointMatch = containerQuery ? containerMatch : viewportMatch;
  const visible = show && breakpointMatch;

  // ── Container-query mode ─────────────────────────────────────────────────
  // Render a full-width wrapper so ResizeObserver has something to measure.
  // The wrapper is always in the DOM (measuring must be continuous), but the
  // content card inside it is mounted/unmounted based on `visible`.
  if (containerQuery) {
    return (
      <div ref={wrapperRef} style={{width: "100%"}}>
        {visible ? (
          <Card cardName={content} parentCard={cardName} />
        ) : (
          alternativeContent && (
            <Card cardName={alternativeContent} parentCard={cardName} />
          )
        )}
      </div>
    );
  }

  // ── keepMounted mode ─────────────────────────────────────────────────────
  // Keep the subtree mounted at all times; toggle display so React never
  // destroys expensive components (e.g. Plate editors) on hide.
  // `display:contents` makes the wrapper transparent to layout when visible;
  // `display:none` hides it entirely when not.
  if (keepMounted) {
    return (
      <>
        <div style={{display: visible ? "contents" : "none"}}>
          <Card cardName={content} parentCard={cardName} />
        </div>
        {alternativeContent && (
          <div style={{display: visible ? "none" : "contents"}}>
            <Card cardName={alternativeContent} parentCard={cardName} />
          </div>
        )}
      </>
    );
  }

  // ── Viewport / manual mode ───────────────────────────────────────────────
  // Transparent pass-through — no extra DOM node.
  if (!visible) {
    return alternativeContent ? (
      <Card cardName={alternativeContent} parentCard={cardName} />
    ) : null;
  }
  return <Card cardName={content} parentCard={cardName} />;
};
