import React, {useRef, useEffect, useCallback} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import type {
  ScrollbarWithAnnotationsProps,
  ScrollbarWithAnnotationsEvents,
  ScrollbarAnnotation,
} from "./scrollbarWithAnnotations.types";

import "./scrollbarWithAnnotations.css";

/**
 * ScrollbarWithAnnotations component.
 *
 * Renders a scrollable area (content comes from a Pihanga card reference) with
 * a minimap-style overlay on the scrollbar track showing coloured markers for
 * each annotation.  Clicking a marker scrolls to its position **and** emits
 * `onAnnotationClicked` so parent code can react (e.g. open a dialog/panel).
 *
 * Three marker shapes are supported (see `MarkerType` in the types file):
 *  - `"point"` – small circular dot (default)
 *  - `"bar"`   – short rectangle with fixed CSS height
 *  - `"range"` – rectangle proportional to `extent`, CSS `min-height` ensures
 *                 it stays clickable even for very small extents
 *
 * All visual properties (size, colour, opacity, transitions) are controlled
 * entirely by CSS classes so they can be overridden without touching JS.
 *
 * See `scrollbarWithAnnotations.example.ts` for wiring with a Pihanga Dialog.
 */
export const ScrollbarWithAnnotationsComponent = (
  props: PiCardProps<
    ScrollbarWithAnnotationsProps,
    ScrollbarWithAnnotationsEvents
  >,
): React.ReactNode => {
  const {
    contentCard,
    annotations = [],
    className,
    reportEventsOnScroll = false,
    cardName,
    onAnnotationClicked,
    onAnnotationHovered,
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * True while the user is actively scrolling the content container.
   * Hover events are suppressed during this period to avoid a flood of
   * `onAnnotationHovered` dispatches as the overlay passes under the cursor.
   */
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * (Re-)renders all annotation markers inside the overlay div.
   * Called whenever annotations change or the window is resized.
   */
  const renderMarkers = useCallback(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    overlay.innerHTML = "";
    const overlayH = overlay.clientHeight;
    const contentScrollH = content.scrollHeight || 1;

    annotations.forEach((anno: ScrollbarAnnotation) => {
      const markerType = anno.markerType ?? "point";
      const topPx = (anno.position / contentScrollH) * overlayH;

      const el = document.createElement("div");
      // Shape class + type class carry all visual styling – no inline colour.
      // anno.className allows per-annotation overrides (e.g. "swa-selected").
      el.className = [
        "swa-marker",
        `swa-marker-${markerType}`,
        `swa-type-${anno.type}`,
        anno.className,
      ]
        .filter(Boolean)
        .join(" ");
      el.style.top = `${topPx}px`;

      // For range markers, set a proportional height via inline style so the
      // overlay scales with scroll content.  CSS `min-height` (defined on
      // .swa-marker-range) guarantees a minimum regardless of the ratio.
      if (markerType === "range" && anno.extent !== undefined) {
        const heightPx = (anno.extent / contentScrollH) * overlayH;
        el.style.height = `${heightPx}px`;
      }

      el.onmouseenter = () => {
        if (isScrollingRef.current) return;
        el.classList.add("swa-marker--hover");
        onAnnotationHovered?.({annotationId: anno.id, annotation: anno});
      };
      el.onmouseleave = () => {
        if (isScrollingRef.current) return;
        el.classList.remove("swa-marker--hover");
        onAnnotationHovered?.({annotationId: null, annotation: null});
      };
      el.onclick = (e) => {
        e.stopPropagation();
        if (content) {
          content.scrollTop = anno.position - 50;
        }
        onAnnotationClicked({annotationId: anno.id, annotation: anno});
      };

      overlay.appendChild(el);
    });
  }, [annotations, onAnnotationClicked, onAnnotationHovered]);

  // Re-render markers whenever annotations change, or the overlay is resized.
  // ResizeObserver fires on initial layout (when clientHeight goes from 0 to
  // the real value) as well as on subsequent window/container resizes, so
  // markers are always positioned against the actual DOM height.
  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;

    // Observe the overlay element so markers are re-drawn whenever its size
    // changes — including the very first layout pass.
    const ro = new ResizeObserver(() => renderMarkers());
    if (overlay) ro.observe(overlay);

    const handleScroll = () => {
      // When reporting on scroll is enabled, skip suppression entirely.
      if (reportEventsOnScroll) return;

      // Set the scrolling flag so marker hover events are suppressed.
      // We intentionally do NOT dispatch a hover-clear here — marker
      // onMouseLeave events handle that when the pointer actually leaves,
      // and dispatching during scroll can interfere with parent state.
      isScrollingRef.current = true;

      // Reset the idle timer on every scroll event.
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        scrollTimerRef.current = null;
      }, 150);
    };

    content?.addEventListener("scroll", handleScroll, {passive: true});

    return () => {
      ro.disconnect();
      content?.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [renderMarkers, reportEventsOnScroll]);

  return (
    <div
      data-pihanga={cardName}
      className={`swa-root${className ? ` ${className}` : ""}`}
    >
      <div className="swa-content-wrapper">
        {/* Scrollable content area */}
        <div ref={contentRef} className="swa-scroll-container">
          <Card cardName={contentCard} parentCard={cardName} />
        </div>

        {/* Annotation minimap overlay – sits on top of the scrollbar track */}
        <div ref={overlayRef} className="swa-overlay" />
      </div>
    </div>
  );
};
