import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";

export const RESIZABLE_COLUMNS_CARD = "pi/resizable-columns";

export type ResizableColumnsProps = {
  columnCards: PiCardRef[];
  /**
   * Initial column widths. Supports CSS-like values:
   *   - '200px'  — fixed initial width
   *   - '30%'    — explicit percentage
   *   - '1fr'    — fraction of remaining space (after px/% columns)
   *
   * Defaults to equal split when omitted or when length doesn't match columnCards.
   * @example ['200px', '1fr', '1fr']  — fixed sidebar, two equal remaining columns
   * @example ['30%', '70%']
   * @example ['1fr', '2fr', '1fr']
   */
  columnWidths?: string[];
  /** Minimum percentage any column can shrink to during drag. Default: 10 */
  minColumnPercent?: number;
  className?: string;
  dividerClassName?: string;
};

export const ResizableColumns = createCardDeclaration<ResizableColumnsProps>(
  RESIZABLE_COLUMNS_CARD,
);
