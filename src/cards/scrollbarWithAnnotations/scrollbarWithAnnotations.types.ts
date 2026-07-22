import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const SCROLLBAR_WITH_ANNOTATIONS_CARD = "pi/scrollbar-with-annotations";

export const ScrollbarWithAnnotations = createCardDeclaration<
  ScrollbarWithAnnotationsProps,
  ScrollbarWithAnnotationsEvents
>(SCROLLBAR_WITH_ANNOTATIONS_CARD);

export const SCROLLBAR_WITH_ANNOTATIONS_ACTION = registerActions(
  SCROLLBAR_WITH_ANNOTATIONS_CARD,
  ["annotation_clicked", "annotation_hovered"],
);

export const onScrollbarAnnotationClicked =
  createOnAction<AnnotationClickedEvent>(
    SCROLLBAR_WITH_ANNOTATIONS_ACTION.ANNOTATION_CLICKED,
  );

export const onScrollbarAnnotationHovered =
  createOnAction<AnnotationHoveredEvent>(
    SCROLLBAR_WITH_ANNOTATIONS_ACTION.ANNOTATION_HOVERED,
  );

/**
 * The visual category of an annotation, which determines its colour on the
 * scrollbar minimap.
 */
export type AnnotationType =
  | "error"
  | "warning"
  | "todo"
  | "comment"
  | "review"
  | "fixme";

/**
 * Shape of the marker drawn on the scrollbar track.
 *
 * - `"point"` – a small circular dot (default).
 * - `"bar"`   – a short vertical rectangle with a fixed CSS height; useful for
 *               discrete events that have a known position but no meaningful
 *               extent.
 * - `"range"` – a vertical rectangle whose height is proportional to `extent`
 *               in the content's scroll space, with a CSS-enforced minimum
 *               height so tiny ranges remain clickable.  Requires `extent`.
 */
export type MarkerType = "point" | "bar" | "range";

/**
 * A single annotation marker placed on the scrollbar minimap.
 *
 * All positions are **pixel offsets from the top of the scrollable content**
 * (i.e. relative to `scrollHeight`).
 *
 * | markerType | required fields          |
 * |------------|--------------------------|
 * | `"point"`  | `position`               |
 * | `"bar"`    | `position`               |
 * | `"range"`  | `position` + `extent`    |
 */
export type ScrollbarAnnotation = {
  /** Unique identifier for this annotation. */
  id: string;

  /**
   * Pixel offset from the top of the scrollable content.
   * Acts as the start position for range markers.
   */
  position: number;

  /**
   * Length of the annotation in content pixels.
   *
   * Required when `markerType === "range"`.  The marker will span
   * `[position, position + extent]` in content space.
   */
  extent?: number;

  /**
   * Shape of the minimap marker.  Defaults to `"point"`.
   */
  markerType?: MarkerType;

  /** Visual category – controls colour. */
  type: AnnotationType;

  /** Short human-readable label shown in detail views. */
  title: string;

  /** Full description shown when the annotation is selected/inspected. */
  description: string;

  /**
   * Optional extra CSS class(es) applied to this marker's DOM element.
   *
   * Use this to style individual annotations differently from the default
   * type-based colour, e.g. to highlight a "selected" annotation:
   *
   *   className: "swa-selected"
   */
  className?: string;
};

export type ScrollbarWithAnnotationsProps = {
  /**
   * Pihanga card reference for the scrollable main content.
   *
   * The card is rendered inside the scroll container, so it can be any
   * Pihanga card (plain text, a Plate editor, a list, etc.).
   */
  contentCard: PiCardRef;

  /**
   * Annotations to display as coloured markers on the scrollbar track.
   */
  annotations: ScrollbarAnnotation[];

  /** Optional additional CSS class applied to the root element. */
  className?: string;

  /**
   * When `true`, `onAnnotationHovered` events are emitted even while the
   * content container is being scrolled.
   *
   * Defaults to `false` (suppression is the default) to avoid flooding Redux
   * with hover actions as markers pass under the cursor during scroll.
   */
  reportEventsOnScroll?: boolean;
};

/** Emitted when the user clicks an annotation marker. */
export type AnnotationClickedEvent = {
  /** ID of the clicked annotation. */
  annotationId: string;
  /** Full annotation object for convenience. */
  annotation: ScrollbarAnnotation;
};

/**
 * Emitted when the user hovers over (or away from) an annotation marker.
 *
 * `annotationId` / `annotation` are `null` when the pointer leaves a marker.
 *
 * ⚠️  This event fires frequently during normal cursor movement.  Handlers
 * should be kept lightweight (e.g. update a single piece of local state).
 */
export type AnnotationHoveredEvent = {
  annotationId: string | null;
  annotation: ScrollbarAnnotation | null;
};

export type ScrollbarWithAnnotationsEvents = {
  onAnnotationClicked: AnnotationClickedEvent;
  onAnnotationHovered: AnnotationHoveredEvent;
};
