import React, {memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState} from "react";
import type {PiCardProps} from "@pihanga2/core";
import clsx from "clsx";

import {
  DEF_GUTTER_WIDTH,
  DEF_HEADER_HEIGHT,
  DEF_LANE_WIDTH,
  DEF_ROW_HEIGHT,
  type SwimlaneEvents,
  type SwimlaneGhostRow,
  type SwimlaneLanesSnapshot,
  type SwimlaneModel,
  type SwimlaneProps,
  type SwimlaneRow,
  type SwimlaneTarget,
  type SwimlaneTargetKind,
} from "./swimlane.types";
import {describeSwimlaneTarget, formatTs, projectPending, rowTouches} from "./swimlane.model";

import "./swimlane.css";

/**
 * Real-time swimlane (sequence) diagram.
 *
 * Every transition is its own small, fixed-height SVG in normal document flow,
 * so the page (or nearest scroll container) scrolls — the SVGs never do.
 * Each row draws its top half from the `pre` lane snapshot and its bottom half
 * from `post`, which lets lifelines start, activities open/close and run
 * states change in the middle of a row.
 *
 * Hover/click use one delegated listener on the rows container; hit zones are
 * wide transparent shapes carrying `data-*` attributes.
 */

type Geo = {laneW: number; rowH: number; gutter: number; mid: number; mk: string};

const laneX = (g: Geo, i: number) => g.gutter + i * g.laneW + g.laneW / 2;

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

type Parts = {visuals: React.ReactNode[]; hits: React.ReactNode[]};

function drawLanes(
  p: Parts,
  g: Geo,
  laneOrder: string[],
  pre: SwimlaneLanesSnapshot,
  post: SwimlaneLanesSnapshot,
  hl: string | null,
  laneLabels: Record<string, string>,
) {
  laneOrder.forEach((l, i) => {
    const x = laneX(g, i);
    const halves: [SwimlaneLanesSnapshot, number, number][] = [
      [pre, 0, g.mid],
      [post, g.mid, g.rowH],
    ];
    halves.forEach(([snap, y1, y2], half) => {
      const s = snap[l];
      if (!s) return;
      p.visuals.push(
        <line key={`ll-${l}-${half}`} className={`swl-ll swl-ll-${s.state}`} x1={x} x2={x} y1={y1} y2={y2} />,
      );
      s.acts.forEach((a, k) => {
        const ax = x - 5 + k * 5;
        // fill + side borders only, so stacked half-row segments read as one
        // bar; caps only where the activity starts / ends inside this row
        const starts = half === 1 && !pre[l]?.acts.includes(a);
        const ends = half === 0 && !post[l]?.acts.includes(a);
        const d =
          `M${ax},${y1} V${y2} M${ax + 10},${y1} V${y2}` +
          (starts ? ` M${ax},${y1} H${ax + 10}` : "") +
          (ends ? ` M${ax},${y2} H${ax + 10}` : "");
        p.visuals.push(
          <g key={`a-${a}-${half}`} className={clsx("swl-act", hl === a && "swl-hl")}>
            <rect x={ax} y={y1} width={10} height={y2 - y1} />
            <path d={d} />
          </g>,
        );
        p.hits.push(
          <rect
            key={`ha-${a}-${half}`}
            className="swl-hit"
            x={ax - 8}
            y={y1}
            width={26}
            height={y2 - y1}
            data-kind="activity"
            data-id={a}
            data-lane={l}
          />,
        );
      });
    });
    if (!pre[l] && post[l]) {
      p.visuals.push(
        <rect key={`h-${l}`} className="swl-lane-head" x={x - 16} y={g.mid - 5} width={32} height={10} rx={2} />,
        <text key={`ht-${l}`} className="swl-lbl-muted" x={x + 20} y={g.mid + 3}>
          + {laneLabels[l] ?? l} joined
        </text>,
      );
    }
  });
}

function drawArrow(
  p: Parts,
  g: Geo,
  idx: (l: string) => number,
  a: {
    from: string;
    to: string;
    cls: string;
    marker: string;
    label: string;
    hitId: string;
    kind: SwimlaneTargetKind;
    rowId?: number;
    hl: boolean;
  },
) {
  const i1 = idx(a.from);
  const i2 = idx(a.to);
  if (i1 < 0 || i2 < 0) return;
  const x1 = laneX(g, i1);
  const x2 = laneX(g, i2);
  const cls = clsx("swl-ar", a.cls, a.hl && "swl-hl");
  const markerEnd = `url(#${g.mk}-${a.marker})`;
  const hitData = {"data-kind": a.kind, "data-id": a.hitId, "data-row": a.rowId};
  if (a.from === a.to) {
    const d = `M${x1 + 6},${g.mid - 9} h26 v16 h-20`;
    p.visuals.push(
      <path key="ar" className={cls} d={d} markerEnd={markerEnd} />,
      <text key="lb" className="swl-lbl" x={x1 + 38} y={g.mid + 3}>
        {a.label}
      </text>,
    );
    p.hits.push(<path key="hit" className="swl-hit" d={d} strokeWidth={14} pointerEvents="stroke" {...hitData} />);
    return;
  }
  const dir = Math.sign(x2 - x1);
  const sx = x1 + dir * 6;
  const ex = x2 - dir * 6;
  p.visuals.push(
    <line key="ar" className={cls} x1={sx} x2={ex} y1={g.mid} y2={g.mid} markerEnd={markerEnd} />,
    <text key="lb" className="swl-lbl" x={Math.min(sx, ex) + 8} y={g.mid - 5}>
      {a.label}
    </text>,
  );
  // broad hit zone: a 16px thick invisible band over the thin line
  p.hits.push(
    <line
      key="hit"
      className="swl-hit"
      x1={sx}
      x2={ex}
      y1={g.mid}
      y2={g.mid}
      strokeWidth={16}
      pointerEvents="stroke"
      {...hitData}
    />,
  );
}

const CALL_STYLE = {
  sync: ["swl-ar-sync", "sync"],
  async: ["swl-ar-async", "async"],
  event: ["swl-ar-event", "event"],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Rows
// ─────────────────────────────────────────────────────────────────────────────

type RowCommon = {
  g: Geo;
  laneOrder: string[];
  laneLabels: Record<string, string>;
  width: number;
  hl: string | null;
};

const RealRow = memo(function RealRow({row, g, laneOrder, laneLabels, width, hl}: RowCommon & {row: SwimlaneRow}) {
  const p: Parts = {visuals: [], hits: []};
  const idx = (l: string) => laneOrder.indexOf(l);
  drawLanes(p, g, laneOrder, row.pre, row.post, hl, laneLabels);
  const ev = row.event;
  switch (ev.type) {
    case "call": {
      const [cls, marker] = CALL_STYLE[ev.kind];
      drawArrow(p, g, idx, {
        from: ev.from, to: ev.to, cls, marker, label: ev.label,
        hitId: ev.id, kind: "transition", rowId: row.id, hl: hl === ev.id,
      });
      break;
    }
    case "reply":
      if (row.route) {
        drawArrow(p, g, idx, {
          from: row.route.to, to: row.route.from,
          cls: ev.ok ? "swl-ar-reply" : "swl-ar-error", marker: ev.ok ? "reply" : "error",
          label: ev.label, hitId: ev.id, kind: "transition", rowId: row.id, hl: hl === ev.id,
        });
      }
      break;
    case "done":
      if (row.route) {
        p.visuals.push(
          <text key="dn" className="swl-lbl-muted" x={laneX(g, idx(row.route.to)) + 14} y={g.mid + 3}>
            ✓ processed {row.route.label}
          </text>,
        );
      }
      break;
    case "state": {
      const x = laneX(g, idx(ev.lane));
      p.visuals.push(
        <circle key="st" cx={x} cy={g.mid} r={5} className={`swl-dot-${ev.state}`} />,
        <text key="stl" className="swl-lbl-muted" x={x + 10} y={g.mid + 3}>
          → {ev.state}
        </text>,
      );
      p.hits.push(
        <circle
          key="sth"
          className="swl-hit"
          cx={x}
          cy={g.mid}
          r={12}
          data-kind="state"
          data-id={`state-${row.id}`}
          data-lane={ev.lane}
          data-row={row.id}
        />,
      );
      break;
    }
  }
  return (
    <svg className={clsx("swl-row", row.fulfilled && "swl-arrived")} width={width} height={g.rowH} data-row={row.id}>
      <text className="swl-ts" x={0} y={g.mid + 3}>
        {formatTs(ev.ts)}
      </text>
      {row.fulfilled && (
        <text className="swl-ok" x={g.gutter - 16} y={g.mid + 4}>
          <title>replaced an outstanding message</title>✓
        </text>
      )}
      {p.visuals}
      {p.hits}
    </svg>
  );
});

const GhostRow = memo(function GhostRow({
  row, g, laneOrder, laneLabels, width, hl, now,
}: RowCommon & {row: SwimlaneGhostRow; now: number}) {
  const p: Parts = {visuals: [], hits: []};
  const pd = row.pending;
  const waited = now - pd.since;
  const overdue = pd.timeoutMs != null && waited > pd.timeoutMs;
  drawLanes(p, g, laneOrder, row.pre, row.post, hl, laneLabels);
  drawArrow(p, g, (l) => laneOrder.indexOf(l), {
    from: pd.from, to: pd.to, cls: clsx("swl-ar-ghost", overdue && "swl-overdue"), marker: "ghost",
    label: `⌛ ${pd.label}`, hitId: pd.id, kind: "pending", hl: hl === pd.id,
  });
  return (
    <svg className="swl-row swl-ghost" width={width} height={g.rowH}>
      <text className={clsx("swl-ts", overdue && "swl-overdue")} x={0} y={g.mid + 3}>
        waiting {(waited / 1000).toFixed(1)}s
      </text>
      {p.visuals}
      {p.hits}
    </svg>
  );
});

const NowRow = memo(function NowRow({
  snap, count, g, laneOrder, laneLabels, width,
}: Omit<RowCommon, "hl"> & {snap: SwimlaneLanesSnapshot; count: number}) {
  const p: Parts = {visuals: [], hits: []};
  drawLanes(p, g, laneOrder, snap, snap, null, laneLabels);
  return (
    <svg className="swl-row swl-now" width={width} height={g.rowH}>
      <text className="swl-now-lbl" x={0} y={g.mid + 3}>now</text>
      {p.visuals}
      <line className="swl-now-line" x1={g.gutter - 6} x2={width - 10} y1={g.mid} y2={g.mid} />
      <text className="swl-now-lbl" x={width - 136} y={g.mid - 4}>▼ {count} outstanding</text>
    </svg>
  );
});

function PendingZone(props: Omit<RowCommon, "hl"> & {model: SwimlaneModel; hid: string | null}) {
  const {model, hid, ...common} = props;
  const [now, setNow] = useState(() => Date.now());
  const any = model.pending.length > 0;
  useEffect(() => {
    // only the ghost rows tick (for the "waiting" timer)
    if (!any) return;
    const iv = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(iv);
  }, [any]);
  const {current, pending} = model;
  const ghosts = useMemo(() => projectPending(current, pending), [current, pending]);
  return (
    <>
      <NowRow snap={model.current} count={model.pending.length} {...common} />
      {ghosts.map((gr) => (
        <GhostRow key={gr.id} row={gr} now={now} hl={hid && rowTouches(gr, gr.pending.id, hid) ? hid : null} {...common} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function Header({model, g, headH, width}: {model: SwimlaneModel; g: Geo; headH: number; width: number}) {
  return (
    <svg width={width} height={headH}>
      {model.laneOrder.map((l, i) => {
        const x = laneX(g, i);
        const s = model.current[l];
        const y = headH - 24;
        return (
          <g key={l}>
            <text className="swl-lane-name" x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`}>
              {model.laneLabels[l] ?? l}
            </text>
            <circle cx={x} cy={headH - 12} r={5} className={`swl-dot-${s?.state}`}>
              <title>{s?.state}</title>
            </circle>
            {s && s.acts.length > 0 && (
              <text className="swl-lbl-muted" x={x + 9} y={headH - 8}>
                {s.acts.length}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Defs({mk}: {mk: string}) {
  const m = (id: string, cls: string, open: boolean) => (
    <marker
      id={`${mk}-${id}`}
      viewBox="0 0 10 10"
      refX={9}
      refY={5}
      markerWidth={9}
      markerHeight={9}
      markerUnits="userSpaceOnUse"
      orient="auto-start-reverse"
    >
      {open ? <path d="M1,1 L9,5 L1,9" className={cls} /> : <path d="M0,0 L10,5 L0,10 z" className={cls} />}
    </marker>
  );
  return (
    <svg width={0} height={0} style={{position: "absolute"}} aria-hidden="true">
      <defs>
        {m("sync", "swl-mk-sync", false)}
        {m("async", "swl-mk-async", true)}
        {m("event", "swl-mk-event", true)}
        {m("reply", "swl-mk-reply", true)}
        {m("error", "swl-mk-error", false)}
        {m("ghost", "swl-mk-ghost", true)}
      </defs>
    </svg>
  );
}

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let e = el?.parentElement; e; e = e.parentElement) {
    const oy = getComputedStyle(e).overflowY;
    if (oy === "auto" || oy === "scroll") return e;
  }
  return null; // → window
}

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

export const SwimlaneComponent = (props: PiCardProps<SwimlaneProps, SwimlaneEvents>): React.ReactNode => {
  const {
    cardName,
    model,
    showPending = true,
    autoFollow = true,
    showTooltip = true,
    highlightId,
    laneWidth = DEF_LANE_WIDTH,
    rowHeight = DEF_ROW_HEIGHT,
    headerHeight = DEF_HEADER_HEIGHT,
    gutterWidth = DEF_GUTTER_WIDTH,
    stickyTop = 0,
    className,
    onHoverChanged,
    onItemClicked,
  } = props;

  const mk = "swl" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const g = useMemo<Geo>(
    () => ({laneW: laneWidth, rowH: rowHeight, gutter: gutterWidth, mid: rowHeight / 2, mk}),
    [laneWidth, rowHeight, gutterWidth, mk],
  );
  const width = gutterWidth + model.laneOrder.length * laneWidth + 140; // + room for labels
  const common = {g, laneOrder: model.laneOrder, laneLabels: model.laneLabels, width};

  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

  // ── hover / click (event delegation) ─────────────────────────────────────
  const [hovered, setHovered] = useState<SwimlaneTarget | null>(null);
  const hoveredRef = useRef<SwimlaneTarget | null>(null);

  const targetOf = (el: Element | null): SwimlaneTarget | null => {
    const hit = (el as HTMLElement | null)?.closest?.(".swl-hit") as SVGElement | null;
    if (!hit) return null;
    const d = hit.dataset;
    return {
      kind: d.kind as SwimlaneTargetKind,
      id: d.id!,
      lane: d.lane,
      rowId: d.row != null ? Number(d.row) : undefined,
    };
  };
  const same = (a: SwimlaneTarget | null, b: SwimlaneTarget | null) =>
    a === b || (!!a && !!b && a.kind === b.kind && a.id === b.id);

  const details = (t: SwimlaneTarget) => {
    const m = modelRef.current;
    return t.kind === "pending"
      ? {pending: m.pending.find((p) => p.id === t.id), span: m.spans[t.id]}
      : {span: m.spans[t.id]};
  };

  const placeTip = (x: number, y: number) => {
    const tip = tipRef.current;
    if (tip) {
      tip.style.left = `${x + 14}px`;
      tip.style.top = `${y + 14}px`;
    }
  };

  const changeHover = (next: SwimlaneTarget | null, e: React.PointerEvent) => {
    const prev = hoveredRef.current;
    if (same(prev, next)) return; // e.g. same activity continuing in the next row
    hoveredRef.current = next;
    setHovered(next);
    const tip = tipRef.current;
    if (tip) {
      if (next && showTooltip) {
        tip.textContent = describeSwimlaneTarget(modelRef.current, next);
        tip.style.display = "block";
        placeTip(e.clientX, e.clientY);
      } else {
        tip.style.display = "none";
      }
    }
    onHoverChanged({
      target: next,
      previous: prev,
      ...(next ? details(next) : {}),
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const onOver = (e: React.PointerEvent) => {
    const t = targetOf(e.target as Element);
    if (t) changeHover(t, e);
  };
  const onOut = (e: React.PointerEvent) => {
    const t = targetOf(e.relatedTarget as Element | null);
    if (!t || !same(t, hoveredRef.current)) changeHover(t, e);
  };
  const onMove = (e: React.PointerEvent) => {
    if (hoveredRef.current && showTooltip) placeTip(e.clientX, e.clientY);
  };
  const onClick = (e: React.MouseEvent) => {
    const t = targetOf(e.target as Element);
    if (t) onItemClicked({target: t, ...details(t)});
  };

  // ── highlighting: only rows touching the chain get a new `hl` prop ───────
  const hid =
    hovered && hovered.kind !== "state" ? hovered.id : highlightId ?? null;

  // ── auto-follow (page or nearest scroll container) ───────────────────────
  const follow = useRef(true);
  useEffect(() => {
    if (!autoFollow) return;
    const sp = scrollParent(rootRef.current);
    const target: HTMLElement | Window = sp ?? window;
    const onScroll = () => {
      follow.current = sp
        ? sp.scrollTop + sp.clientHeight >= sp.scrollHeight - 40
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
    };
    target.addEventListener("scroll", onScroll, {passive: true});
    return () => target.removeEventListener("scroll", onScroll);
  }, [autoFollow]);
  useLayoutEffect(() => {
    if (!autoFollow || !follow.current) return;
    const sp = scrollParent(rootRef.current);
    if (sp) sp.scrollTop = sp.scrollHeight;
    else window.scrollTo(0, document.documentElement.scrollHeight);
  }, [autoFollow, model.rows.length, model.pending.length]);

  return (
    <div ref={rootRef} className={clsx("pihanga-swimlane", className)} data-pihanga={cardName}>
      <Defs mk={mk} />
      <div className="swl-header" style={{top: stickyTop}}>
        <Header model={model} g={g} headH={headerHeight} width={width} />
      </div>
      <div className="swl-rows" onPointerOver={onOver} onPointerOut={onOut} onPointerMove={onMove} onClick={onClick}>
        {model.rows.map((r) => (
          <RealRow
            key={r.id}
            row={r}
            hl={hid && rowTouches(r, "id" in r.event ? r.event.id : undefined, hid) ? hid : null}
            {...common}
          />
        ))}
        {showPending && <PendingZone model={model} hid={hid} {...common} />}
      </div>
      <div ref={tipRef} className="swl-tooltip" role="tooltip" />
    </div>
  );
};
