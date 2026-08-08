import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";

export const RESIZABLE_GRID_CARD = "pi/resizable-grid";

export type ResizableGridProps = {
  /**
   * 2D array of cards — cells[row][col]. Must be rectangular (all rows same length).
   */
  cells: PiCardRef[][];
  /**
   * Initial column widths using CSS-like values:
   *   - '200px'  — fixed initial width (resolved against container width at mount)
   *   - '30%'    — explicit percentage of container
   *   - '1fr'    — fraction of remaining space after px/% columns
   *   - 'auto'   — natural content width; no drag handle rendered for adjacent boundaries
   *
   * Defaults to equal `1fr` split when omitted.
   */
  columnWidths?: string[];
  /**
   * Initial row heights using the same syntax as columnWidths.
   * 'auto' rows follow content height (max across all cells in that row).
   * No drag handle is rendered between two rows unless both are explicit (non-auto).
   *
   * Defaults to equal `1fr` split when omitted.
   */
  rowHeights?: string[];
  /** Minimum percentage any explicit column can shrink to during drag. Default: 10 */
  minColumnPercent?: number;
  /** Minimum percentage any explicit row can shrink to during drag. Default: 10 */
  minRowPercent?: number;
  className?: string;
  dividerClassName?: string;
};

export const ResizableGrid =
  createCardDeclaration<ResizableGridProps>(RESIZABLE_GRID_CARD);
