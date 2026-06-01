import React from "react";
import {PiCardProps} from "@pihanga2/core";
import {Graphin} from "@antv/graphin";

import {
  NodeEvent,
  type GraphOptions,
  type Graph,
} from "@antv/g6";

import {GraphinProps} from "./graphin.types";
import clsx from "clsx";
import {cloneDeep, merge} from "lodash";
import {TooltipComponent} from "./tooltip.component";

export const GraphinComponent = (
  props: PiCardProps<GraphinProps>,
): React.ReactNode => {
  const {cardName, data, options, tooltip, style, className, _cls} = props;

  const handleReady = (graph: Graph) => {
    console.log("Graph ready:", graph);

    // Add event handlers
    graph.on(NodeEvent.CLICK, (evt) => {
      console.log("Node clicked:", evt);
    });

    graph.on("edge:click", (evt) => {
      console.log("Edge clicked:", evt);
    });
  };

  // console.log("AREA", area)
  const _style = {
    // display: "grid",
    // gridGap: template.gap || "10px",
    // height,
    // margin,
    // width: "100%",

    display: "flex",
    width: "100%",
    ...style?.root,
  };

  const defOptions: GraphOptions = {
    data,
    autoResize: true,
    node: {
      style: {
        labelText: (d) => {
          return (d.data?.displayName || d.id) as string;
        },
        lod: {
          0: {labelFontSize: 10}, // Zoomed out: smaller font
          1: {labelFontSize: 12}, // Normal: standard font
          2: {labelFontSize: 6}, // Zoomed in: reduce font size so it doesn't overwhelm
        },
        // labelFontSize: 12, // This is your "Base" size
        // labelWordWrap: true,
        // labelWordWrapWidth: 100, // Limits the horizontal growth
      },
      // palette: {
      //   type: "group",
      //   field: "cluster",
      // },
    },
    // layout: {
    //   type: "force", // The layout engine type
    //   preventOverlap: true, // Parameters specific to the 'force' engine
    //   nodeSize: 30,
    //   linkDistance: 100,
    // },
    layout: {
      type: "force-atlas2",
      preventOverlap: true,
      kr: 20,
      // center: [250, 250],
    },
    behaviors: [
      "drag-canvas",
      "drag-element",
      // "zoom-canvas",
      {
        type: "auto-adapt-label",
        enableAnimation: true,
        throttle: 100,
        padding: 0,
      },
      {
        type: "zoom-canvas",
        id: "zoom-canvas-1",
        // trigger: {
        //   zoomIn: ["Control", "+"], // Zoom in shortcut
        //   zoomOut: ["Control", "-"], // Zoom out shortcut
        //   reset: ["Control", "0"], // Reset zoom ratio shortcut
        // },
        // trigger: ["Control"],
        fixSelectedItems: {fixLabel: true},
      },
    ],
    animation: true,
  };

  const mergedOptions = merge(cloneDeep(defOptions), options);
  return (
    <div
      style={_style}
      className={clsx(_cls("root"), className)}
      data-pihanga={cardName}
    >
      <Graphin
        options={mergedOptions}
        onReady={handleReady}
        style={{width: "inherit"}}
      >
        {tooltip && (
          <TooltipComponent contentCards={tooltip} parentCard={cardName} />
        )}
      </Graphin>
    </div>
  );
};
