import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import type {
  DataTableRowDetailField,
  DataTableRowDetailProps,
} from "./dataTable.types";

/**
 * DataTableRowDetail — generic detail-panel card for use with DataTable.
 *
 * Register it ONCE as a template, then reference it in every row via
 * `detailCard`.  The DataTable passes the row via `cardKey` + `row` context
 * props so a state mapper on the `row` field delivers the correct data:
 *
 * ```ts
 * registerCard(
 *   "app/myTable/rowDetail",
 *   DataTableRowDetail({
 *     // State mapper — ctx.ctxtProps.row is injected by the DataTable
 *     row: (_, ctx) => ctx.ctxtProps?.row,
 *     fields: [
 *       { key: "title",    type: "title" },
 *       { key: "director", label: "Director" },
 *       { key: "plot",     type: "muted" },
 *     ],
 *   }),
 * );
 * ```
 */
export const DataTableRowDetailComponent = (
  props: PiCardProps<DataTableRowDetailProps>,
): React.ReactNode => {
  const {row, fields, cardName} = props;

  if (!row?.data) {
    return null;
  }

  const data = row.data as Record<string, unknown>;

  /** If no `fields` config, auto-render all keys as plain text */
  if (!fields || fields.length === 0) {
    return (
      <div className="flex flex-col gap-1 text-sm" data-pihanga={cardName}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium text-muted-foreground">{key}: </span>
            <span>{String(value ?? "")}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" data-pihanga={cardName}>
      {fields.map((field: DataTableRowDetailField) => {
        const value = data[field.key];
        const display = value == null ? "" : String(value);

        switch (field.type) {
          case "title":
            return (
              <h4 key={field.key} className="text-base font-semibold">
                {display}
              </h4>
            );

          case "muted":
            return (
              <p key={field.key} className="text-sm text-muted-foreground">
                {field.label ? (
                  <>
                    <span className="font-medium">{field.label}: </span>
                    {display}
                  </>
                ) : (
                  display
                )}
              </p>
            );

          default:
            // "text" or any unknown type
            return (
              <p key={field.key} className={cn("text-sm", field.className)}>
                {field.label ? (
                  <>
                    <span className="font-medium">{field.label}: </span>
                    {display}
                  </>
                ) : (
                  display
                )}
              </p>
            );
        }
      })}
    </div>
  );
};
