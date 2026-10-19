import {describe, expect, it, vi} from "vitest";

// @pihanga2/core's dist uses extension-less ESM imports that Vitest cannot
// resolve, so stub the few runtime helpers called at import time.
vi.mock("@pihanga2/core", () => ({
  createCardDeclaration: (type: string) => (props: object) => ({...props, cardType: type}),
  registerActions: (ns: string, actions: readonly string[]) =>
    Object.fromEntries(actions.map((a) => [a.toUpperCase(), `${ns}/${a}`])),
  actionTypesToEvents: () => ({}),
  createOnAction: () => () => undefined,
  createOnDispatch: () => () => undefined,
  registerCardComponent: () => undefined,
}));

import {fireEvent, render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {SwimlaneComponent} from "./swimlane.component";
import {produce} from "immer";

import {buildDemoModel} from "./swimlane.demo";
import {createSwimlaneModel, ingestSwimlaneEvents} from "./swimlane.model";
import type {SwimlaneEvents, SwimlaneProps} from "./swimlane.types";

function renderSwimlane(props: Partial<SwimlaneProps> = {}) {
  const onHoverChanged = vi.fn();
  const onItemClicked = vi.fn();
  const full = {
    cardName: "test/swimlane",
    model: buildDemoModel({t0: 0}),
    autoFollow: false,
    onHoverChanged,
    onItemClicked,
    _cls: (n: string) => n,
    ...props,
  } as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>;
  const r = render(<SwimlaneComponent {...full} />);
  return {...r, onHoverChanged, onItemClicked};
}

describe("shad/swimlane component", () => {
  it("attaches data-pihanga and renders one svg per row plus now + ghost rows", () => {
    const {container} = renderSwimlane();
    expect(container.querySelector("[data-pihanga='test/swimlane']")).not.toBeNull();
    const model = buildDemoModel({t0: 0});
    expect(container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")).toHaveLength(model.rows.length);
    expect(container.querySelectorAll("svg.swl-ghost")).toHaveLength(model.pending.length);
    expect(container.querySelectorAll("svg.swl-now")).toHaveLength(1);
  });

  it("applies the `style` prop to the root element, alongside `className`", () => {
    const {container} = renderSwimlane({style: {maxWidth: 640}});
    const root = container.querySelector("[data-pihanga='test/swimlane']") as HTMLElement;
    expect(root.style.maxWidth).toBe("640px");
  });

  it("renders vertical lane names in the header", () => {
    const {container} = renderSwimlane();
    const names = [...container.querySelectorAll(".swl-lane-name")];
    expect(names.map((n) => n.textContent)).toContain("api-gateway");
    expect(names[0].getAttribute("transform")).toMatch(/^rotate\(-90/);
  });

  it("hides the outstanding zone when showPending=false", () => {
    const {container} = renderSwimlane({showPending: false});
    expect(container.querySelectorAll("svg.swl-ghost, svg.swl-now")).toHaveLength(0);
  });

  it("emits hover enter once per target and leave on exit; highlights the chain", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const hits = container.querySelectorAll("[data-kind='activity'][data-id='c3']");
    expect(hits.length).toBeGreaterThan(1);
    fireEvent.pointerOver(hits[0]);
    // moving to the same activity in the next row is not a change
    fireEvent.pointerOut(hits[0], {relatedTarget: hits[1]});
    fireEvent.pointerOver(hits[1]);
    expect(onHoverChanged).toHaveBeenCalledTimes(1);
    expect(onHoverChanged.mock.calls[0][0]).toMatchObject({
      target: {kind: "activity", id: "c3", lane: "orders"},
      previous: null,
      span: {from: "gateway", to: "orders", label: "createOrder"},
    });
    expect(container.querySelectorAll(".swl-ar.swl-hl").length).toBeGreaterThan(0);
    fireEvent.pointerOut(hits[1], {relatedTarget: container});
    expect(onHoverChanged).toHaveBeenCalledTimes(2);
    expect(onHoverChanged.mock.calls[1][0]).toMatchObject({target: null, previous: {id: "c3"}});
  });

  it("emits item clicked with pending details for ghost rows", () => {
    const {container, onItemClicked} = renderSwimlane();
    const ghost = container.querySelector("[data-kind='pending'][data-id='x1']")!;
    fireEvent.click(ghost);
    expect(onItemClicked).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({kind: "pending", id: "x1"}),
        pending: expect.objectContaining({from: "notifier", to: "orders", type: "expect"}),
      }),
    );
  });

  it("hovering a process also highlights the transitions it creates and receives", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const hit = container.querySelector("[data-kind='activity'][data-id='c3']")!;
    fireEvent.pointerOver(hit);
    const rel = (id: string) =>
      [...container.querySelectorAll(`[data-kind='transition'][data-id='${id}'], [data-kind='pending'][data-id='${id}']`)]
        .map((h) => h.closest("svg")!.querySelector(".swl-ar")!.getAttribute("class")!);
    // own chain: call createOrder (c3) + its outstanding reply → primary highlight
    expect(rel("c3").every((c) => c.includes("swl-hl") && !c.includes("swl-hl-rel"))).toBe(true);
    // children: validate (self), reserve, charge ×2 (incl. error reply), order.created, audit.log
    for (const id of ["c4", "c5", "c6", "c7", "c8", "c9"]) {
      const cls = rel(id);
      expect(cls.length, id).toBeGreaterThan(0);
      expect(cls.every((c) => c.includes("swl-hl-rel")), id).toBe(true);
    }
    // sync children highlight both directions (call + reply)
    expect(rel("c6")).toHaveLength(2);
    // unrelated: verify token belongs to the gateway's handling of c1
    expect(rel("c2").some((c) => /swl-hl/.test(c))).toBe(false);
    expect(onHoverChanged.mock.calls[0][0].related).toEqual(["c4", "c5", "c6", "c7", "c8", "c9"]);
  });

  it("hovering a reply also highlights the receiving process — and only that activity", () => {
    const {container, onHoverChanged} = renderSwimlane();
    // c5 = orders → inventory "reserve items"; its reply is received by orders' createOrder activity (c3)
    const replyHit = [...container.querySelectorAll("[data-kind='transition'][data-id='c5']")].find(
      (h) => h.closest("svg")!.querySelector(".swl-ar-reply"),
    )!;
    fireEvent.pointerOver(replyHit);
    const proc = [...container.querySelectorAll(".swl-act.swl-hl-proc")];
    expect(proc.length).toBeGreaterThan(1);
    const c3Hits = container.querySelectorAll("[data-kind='activity'][data-id='c3']").length;
    // every segment of c3 (the "now" row draws two more, without hit zones), nothing else
    expect(proc).toHaveLength(c3Hits + 2);
    // all highlighted segments sit on the orders lifeline, at c3's stack position
    const xs = new Set(proc.map((g) => g.querySelector("rect")!.getAttribute("x")));
    expect(xs.size).toBe(1);
    // none of the receiving process's other transitions are highlighted
    for (const id of ["c4", "c6", "c7", "c8", "c9"]) {
      const arrows = [...container.querySelectorAll(`[data-kind='transition'][data-id='${id}']`)]
        .map((h) => h.closest("svg")!.querySelector(".swl-ar")!.getAttribute("class")!);
      expect(arrows.some((c) => /swl-hl/.test(c)), id).toBe(false);
    }
    // the hovered call itself stays primary (call + reply)
    expect(container.querySelectorAll(".swl-ar.swl-hl")).toHaveLength(2);
    expect(onHoverChanged.mock.calls[0][0]).toMatchObject({process: "c3"});
  });

  it("hovering an activity does not mark a caller process", () => {
    const {container} = renderSwimlane();
    fireEvent.pointerOver(container.querySelector("[data-kind='activity'][data-id='c3']")!);
    expect(container.querySelectorAll(".swl-hl-proc")).toHaveLength(0);
  });

  it("draws an error mark (not a green tick) for a reply that arrived as an error", () => {
    const {container} = renderSwimlane();
    // c6 ("402 declined") is the only non-ok reply in the demo script; both
    // rows (the call and its reply) share data-id="c6", the reply row is
    // the second one and is the one with the "fulfilled" mark
    const c6Rows = [...container.querySelectorAll("[data-kind='transition'][data-id='c6']")].map(
      (h) => h.closest("svg")!,
    );
    const errorRow = c6Rows[c6Rows.length - 1];
    const ok = errorRow.querySelector(".swl-ok")!;
    expect(ok).not.toBeNull();
    expect(ok.classList.contains("swl-ok-error")).toBe(true);
    expect(ok.textContent).toContain("✗");
    expect(ok.textContent).not.toContain("✓");
    // a successful reply still gets the green tick
    const c7Rows = [...container.querySelectorAll("[data-kind='transition'][data-id='c7']")].map(
      (h) => h.closest("svg")!,
    );
    const okMark = c7Rows[c7Rows.length - 1].querySelector(".swl-ok")!;
    expect(okMark.classList.contains("swl-ok-error")).toBe(false);
    expect(okMark.textContent).toContain("✓");
    expect(okMark.textContent).not.toContain("✗");
  });

  it("applies external highlightId", () => {
    const {container} = renderSwimlane({highlightId: "c6"});
    expect(container.querySelectorAll(".swl-ar.swl-hl")).toHaveLength(2); // call + error reply
  });

  it("formats row timestamps with a custom formatTs prop", () => {
    const {container} = renderSwimlane({formatTs: (ts) => `virtual-${ts}`});
    const first = container.querySelector("svg.swl-row:not(.swl-ghost):not(.swl-now) .swl-ts")!;
    expect(first.textContent).toMatch(/^virtual-\d+$/);
  });

  it("formats the outstanding 'waiting …' timers with a custom formatWait prop", () => {
    const x1 = buildDemoModel({t0: 0}).pending.find((p) => p.id === "x1")!;
    const {container} = renderSwimlane({
      model: buildDemoModel({t0: 0}),
      now: x1.since + 2500,
      formatWait: (ms) => `${ms}ms`,
    });
    const label = container.querySelector("[data-id='x1']")!.closest("svg")!.querySelector(".swl-ts")!;
    expect(label.textContent).toBe("waiting 2500ms");
  });

  it("groups rows that share a `step`: no repeated timestamp, a tie mark instead", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000, step: "s1"},
        {type: "call", kind: "event", id: "g1", from: "gateway", to: "orders", label: "ping", ts: 99_000, step: "s1"},
      ]);
    });
    const {container} = renderSwimlane({model: next});
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    // first row of the step still shows its timestamp
    expect(prev.querySelector(".swl-ts")).not.toBeNull();
    // second row of the same step shows a tie mark, not a timestamp
    expect(last.classList.contains("swl-grouped")).toBe(true);
    expect(last.querySelector(".swl-ts")).toBeNull();
    expect(last.querySelector(".swl-ts-tie")).not.toBeNull();
  });

  it("does not group rows with different (or missing) `step`", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000, step: "s1"},
        {type: "call", kind: "event", id: "g1", from: "gateway", to: "orders", label: "ping", ts: 99_500, step: "s2"},
      ]);
    });
    const {container} = renderSwimlane({model: next});
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const last = rows[rows.length - 1];
    expect(last.classList.contains("swl-grouped")).toBe(false);
    expect(last.querySelector(".swl-ts")).not.toBeNull();
  });

  it("hides the state-dot label when showLabel is false, shows it by default", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000},
        {type: "state", lane: "gateway", state: "running", ts: 99_100, showLabel: false},
      ]);
    });
    const {container} = renderSwimlane({model: next});
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const withLabel = rows[rows.length - 2];
    const withoutLabel = rows[rows.length - 1];
    expect(withLabel.querySelector(".swl-lbl-muted")).not.toBeNull();
    expect(withLabel.querySelector(".swl-dot-degraded")).not.toBeNull();
    expect(withoutLabel.querySelector(".swl-lbl-muted")).toBeNull();
    expect(withoutLabel.querySelector(".swl-dot-running")).not.toBeNull();
  });

  it("draws the new one-shot outcome states (in_progress / succeeded / failed)", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "in_progress", ts: 99_000},
        {type: "state", lane: "gateway", state: "succeeded", ts: 99_100},
        {type: "state", lane: "gateway", state: "failed", ts: 99_200},
      ]);
    });
    const {container} = renderSwimlane({model: next});
    expect(container.querySelector(".swl-dot-in_progress")).not.toBeNull();
    expect(container.querySelector(".swl-dot-succeeded")).not.toBeNull();
    expect(container.querySelector(".swl-dot-failed")).not.toBeNull();
  });

  it("hovering a timestamp highlights every row of its step and reports them", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000, step: "s1"},
        {type: "call", kind: "event", id: "g1", from: "gateway", to: "orders", label: "ping", ts: 99_000, step: "s1"},
      ]);
    });
    const {container, onHoverChanged} = renderSwimlane({model: next});
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const first = rows[rows.length - 2];
    const second = rows[rows.length - 1];
    const stepHit = first.querySelector("[data-kind='step']")!;
    fireEvent.pointerOver(stepHit);
    expect(first.classList.contains("swl-hl-step")).toBe(true);
    expect(second.classList.contains("swl-hl-step")).toBe(true);
    expect(onHoverChanged).toHaveBeenCalledTimes(1);
    const call = onHoverChanged.mock.calls[0][0];
    expect(call.target).toMatchObject({kind: "step"});
    expect(call.steps).toHaveLength(2);
  });

  it("clicking a timestamp emits onItemClicked with the step's rows", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000, step: "s1"},
        {type: "call", kind: "event", id: "g1", from: "gateway", to: "orders", label: "ping", ts: 99_000, step: "s1"},
      ]);
    });
    const {container, onItemClicked} = renderSwimlane({model: next});
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const stepHit = rows[rows.length - 2].querySelector("[data-kind='step']")!;
    fireEvent.click(stepHit);
    expect(onItemClicked).toHaveBeenCalledTimes(1);
    const payload = onItemClicked.mock.calls[0][0];
    expect(payload.target.kind).toBe("step");
    expect(payload.steps).toHaveLength(2);
  });

  it("rows without a `step` are their own step when their timestamp is hovered", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const rows = [...container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")];
    const stepHit = rows[0].querySelector("[data-kind='step']")!;
    fireEvent.pointerOver(stepHit);
    expect(rows[0].classList.contains("swl-hl-step")).toBe(true);
    expect(rows[1].classList.contains("swl-hl-step")).toBe(false);
    expect(onHoverChanged.mock.calls[0][0].steps).toHaveLength(1);
  });

  it("hovering a lane header reports a `lane` target", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const laneHit = container.querySelector("[data-kind='lane'][data-id='gateway']")!;
    fireEvent.pointerOver(laneHit);
    expect(onHoverChanged).toHaveBeenCalledTimes(1);
    expect(onHoverChanged.mock.calls[0][0].target).toMatchObject({kind: "lane", id: "gateway"});
  });

  it("clicking a lane header emits onItemClicked with a `lane` target", () => {
    const {container, onItemClicked} = renderSwimlane();
    const laneHit = container.querySelector("[data-kind='lane'][data-id='gateway']")!;
    fireEvent.click(laneHit);
    expect(onItemClicked).toHaveBeenCalledTimes(1);
    expect(onItemClicked.mock.calls[0][0].target).toMatchObject({kind: "lane", id: "gateway"});
  });

  it("every lane gets its own header hit zone", () => {
    const {container} = renderSwimlane();
    const model = buildDemoModel({t0: 0});
    expect(container.querySelectorAll("[data-kind='lane']")).toHaveLength(model.laneOrder.length);
  });
});

describe("shad/swimlane echoes caller `meta` in hover/click events", () => {
  function modelWithMeta() {
    const base = buildDemoModel({t0: 0});
    return produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "lane", lane: "billing", label: "billing-svc", ts: 99_000, meta: {kind: "lane", ref: "L1"}},
        {type: "state", lane: "billing", state: "running", ts: 99_100, meta: {kind: "state", ref: "S1"}},
        {
          type: "call",
          kind: "sync",
          id: "m1",
          from: "gateway",
          to: "billing",
          label: "charge",
          ts: 99_200,
          meta: {kind: "call", ref: "C1"},
        },
      ]);
    });
  }

  it("echoes a call's `meta` for its transition and activity targets", () => {
    const {container, onHoverChanged} = renderSwimlane({model: modelWithMeta()});
    const hit = container.querySelector("[data-kind='transition'][data-id='m1']")!;
    fireEvent.pointerOver(hit);
    expect(onHoverChanged.mock.calls[0][0].meta).toEqual({kind: "call", ref: "C1"});
  });

  it("echoes a call's `meta` for its implied outstanding reply (pending)", () => {
    const {container, onHoverChanged} = renderSwimlane({model: modelWithMeta()});
    const hit = container.querySelector("[data-kind='pending'][data-id='m1']")!;
    fireEvent.pointerOver(hit);
    expect(onHoverChanged.mock.calls[0][0].meta).toEqual({kind: "call", ref: "C1"});
  });

  it("echoes a state event's `meta`", () => {
    const {container, onItemClicked} = renderSwimlane({model: modelWithMeta()});
    const hit = container.querySelector("[data-kind='state'][data-lane='billing']")!;
    fireEvent.click(hit);
    expect(onItemClicked.mock.calls[0][0].meta).toEqual({kind: "state", ref: "S1"});
  });

  it("echoes a lane event's `meta`", () => {
    const {container, onItemClicked} = renderSwimlane({model: modelWithMeta()});
    const hit = container.querySelector("[data-kind='lane'][data-id='billing']")!;
    fireEvent.click(hit);
    expect(onItemClicked.mock.calls[0][0].meta).toEqual({kind: "lane", ref: "L1"});
  });

  it("omits `meta` when the event carried none", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const hit = container.querySelector("[data-kind='transition'][data-id='c3']")!;
    fireEvent.pointerOver(hit);
    expect(onHoverChanged.mock.calls[0][0].meta).toBeUndefined();
  });
});

describe("shad/swimlane with a caller-chosen `rowId`", () => {
  it("resolves a `state` target's meta/description even when the row has a string `rowId`", () => {
    const base = buildDemoModel({t0: 0});
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "state", lane: "gateway", state: "degraded", ts: 99_000, rowId: "evt-99", meta: {ref: "S-99"}},
      ]);
    });
    const {container, onHoverChanged} = renderSwimlane({model: next});
    const hit = container.querySelector("[data-kind='state'][data-row='evt-99']")!;
    fireEvent.pointerOver(hit);
    expect(onHoverChanged.mock.calls[0][0].meta).toEqual({ref: "S-99"});
  });

  it("seeded lanes render in the header with no corresponding row", () => {
    const m = createSwimlaneModel({lanes: [{lane: "pre-seeded", label: "Pre-seeded"}]});
    const {container} = renderSwimlane({model: m});
    expect([...container.querySelectorAll(".swl-lane-name")].map((n) => n.textContent)).toContain("Pre-seeded");
    expect(container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")).toHaveLength(0);
  });
});

describe("shad/swimlane is driven entirely by props", () => {
  const base = produce({m: buildDemoModel({t0: 0})}, () => undefined).m;
  const widths = (c: HTMLElement) =>
    [...c.querySelectorAll("svg[width]")].map((s) => Number(s.getAttribute("width"))).filter((w) => w > 0);

  it("a new lane in the model extends header and every row horizontally", () => {
    const {container, rerender} = renderSwimlane({model: base});
    const before = widths(container);
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "lane", lane: "billing", label: "billing-svc", ts: 99_000},
        {type: "call", kind: "event", id: "b1", from: "orders", to: "billing", label: "invoice", ts: 99_100},
      ]);
    });
    rerender(
      <SwimlaneComponent
        {...({cardName: "test/swimlane", model: next, autoFollow: false, now: 0,
          onHoverChanged: () => undefined, onItemClicked: () => undefined} as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>)}
      />,
    );
    const after = widths(container);
    // every svg (header + all rows) grew by exactly one lane width
    expect(new Set(before)).toEqual(new Set([before[0]]));
    expect(new Set(after)).toEqual(new Set([before[0] + 104]));
    expect([...container.querySelectorAll(".swl-lane-name")].map((n) => n.textContent)).toContain("billing-svc");
    // two new rows were appended; existing rows are kept
    const rows = container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)");
    expect(rows).toHaveLength(base.rows.length + 2);
  });

  it("uses the `now` prop for waiting timers and overdue state", () => {
    const x1 = base.pending.find((p) => p.id === "x1")!;
    const {container, rerender, onHoverChanged, onItemClicked} = renderSwimlane({model: base, now: x1.since + 1000});
    const label = () => container.querySelector("[data-id='x1']")!.closest("svg")!.querySelector(".swl-ts")!;
    expect(label().textContent).toBe("waiting 1.0s");
    expect(label().classList.contains("swl-overdue")).toBe(false);
    rerender(
      <SwimlaneComponent
        {...({cardName: "test/swimlane", model: base, autoFollow: false, now: x1.since + 9000,
          onHoverChanged, onItemClicked} as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>)}
      />,
    );
    expect(label().textContent).toBe("waiting 9.0s");
    expect(label().classList.contains("swl-overdue")).toBe(true);
  });
});
