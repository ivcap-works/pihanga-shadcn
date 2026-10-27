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

import {produce} from "immer";

import {
  clearSwimlaneRows,
  createSwimlaneModel,
  describeSwimlaneTarget,
  ingestSwimlaneEvents,
  projectPending,
  relatedCallIds,
  stepKeyOf,
  stepRows,
} from "./swimlane.model";
import {buildDemoModel} from "./swimlane.demo";
import type {SwimlaneModel} from "./swimlane.types";

describe("swimlane model", () => {
  it("adds lanes implicitly and opens an activity + expected reply for sync calls", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [{type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1}]);
    expect(m.laneOrder).toEqual(["a", "b"]);
    expect(m.rows.map((r) => r.event.type)).toEqual(["lane", "lane", "call"]);
    expect(m.current.b.acts).toEqual(["c1"]);
    expect(m.pending).toEqual([
      expect.objectContaining({id: "c1", type: "reply", from: "b", to: "a", since: 1}),
    ]);
    const last = m.rows[2];
    expect(last.pre.b.acts).toEqual([]);
    expect(last.post.b.acts).toEqual(["c1"]);
  });

  it("a reply closes the activity, fulfils the pending reply and records the route", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1},
      {type: "reply", id: "c1", ok: false, label: "500", ts: 5},
    ]);
    const r = m.rows[m.rows.length - 1];
    expect(r.fulfilled).toBe("c1");
    expect(r.route).toEqual({from: "a", to: "b", label: "hi"});
    expect(m.pending).toHaveLength(0);
    expect(m.current.b.acts).toEqual([]);
    expect(m.spans.c1).toMatchObject({status: "error", end: 5, result: "500"});
  });

  it("expect events create no row and are fulfilled by `fulfils`", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"},
      {type: "lane", lane: "b"},
      {type: "expect", id: "x", from: "b", to: "a", label: "callback"},
    ]);
    expect(m.rows).toHaveLength(2);
    expect(m.pending[0]).toMatchObject({id: "x", type: "expect"});
    ingestSwimlaneEvents(m, [
      {type: "call", kind: "event", id: "e1", from: "b", to: "a", label: "callback", fulfils: "x"},
    ]);
    expect(m.pending).toHaveLength(0);
    expect(m.rows[2].fulfilled).toBe("x");
  });

  it("ignores replies to unknown calls and duplicate lane events", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"},
      {type: "lane", lane: "a", label: "Alpha"},
      {type: "reply", id: "nope", ok: true, label: "?"},
    ]);
    expect(m.rows).toHaveLength(1);
    expect(m.laneLabels.a).toBe("Alpha");
  });

  it("carries caller `meta` from `lane`, `state`, `call` and `expect` events onto the model", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a", meta: {ref: "lane-a"}},
      {type: "state", lane: "a", state: "running", meta: {ref: "state-1"}},
      {type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", meta: {ref: "call-1"}},
      {type: "expect", id: "x1", from: "b", to: "a", label: "cb", meta: {ref: "expect-1"}},
    ]);
    expect(m.laneMeta.a).toEqual({ref: "lane-a"});
    const stateRow = m.rows.find((r) => r.event.type === "state")!;
    expect(stateRow.event).toMatchObject({meta: {ref: "state-1"}});
    expect(m.spans.c1.meta).toEqual({ref: "call-1"});
    expect(m.pending.find((p) => p.id === "c1")?.meta).toEqual({ref: "call-1"}); // implied reply
    expect(m.pending.find((p) => p.id === "x1")?.meta).toEqual({ref: "expect-1"});
  });

  it("stores per-lane activityClassName/activityStyle from a `lane` event, most recent wins", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a", activityClassName: "swl-act-tool", activityStyle: {fill: "red"}},
      {type: "lane", lane: "a", activityStyle: {fill: "blue"}}, // label/meta-style update, no new row
    ]);
    expect(m.laneActivityClassName.a).toBe("swl-act-tool");
    expect(m.laneActivityStyle.a).toEqual({fill: "blue"});
    expect(m.rows).toHaveLength(1); // only the first `lane` event creates a row
  });

  it("seeds per-lane activityClassName/activityStyle via createSwimlaneModel({lanes})", () => {
    const m = createSwimlaneModel({
      lanes: [{lane: "a", activityClassName: "swl-act-tool", activityStyle: {fill: "red", stroke: "darkred"}}],
    });
    expect(m.laneActivityClassName.a).toBe("swl-act-tool");
    expect(m.laneActivityStyle.a).toEqual({fill: "red", stroke: "darkred"});
  });

  it("a `lane` event with announce: false registers the lane but produces no row", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [{type: "lane", lane: "a", label: "Alpha", announce: false}]);
    expect(m.laneOrder).toEqual(["a"]);
    expect(m.laneLabels.a).toBe("Alpha");
    expect(m.current.a).toEqual({state: "created", acts: []});
    expect(m.rows).toHaveLength(0);
  });

  it("announce: false still has an effect alongside activity colour/meta on the same event", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a", activityClassName: "swl-act-tool", meta: {ref: "A"}, announce: false},
    ]);
    expect(m.laneActivityClassName.a).toBe("swl-act-tool");
    expect(m.laneMeta.a).toEqual({ref: "A"});
    expect(m.rows).toHaveLength(0);
  });

  it("announce: false has no effect once the lane is already known (still no row, as usual)", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"}, // announces normally, 1 row
      {type: "lane", lane: "a", label: "Alpha", announce: false}, // already known either way
    ]);
    expect(m.rows).toHaveLength(1);
    expect(m.laneLabels.a).toBe("Alpha");
  });

  it("a lane referenced implicitly by a call is still announced with a row (announce defaults to true)", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [{type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x"}]);
    expect(m.rows.map((r) => r.event.type)).toEqual(["lane", "lane", "call"]);
  });

  it("uses a caller-supplied `rowId` as the row's id instead of the internal counter", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"},
      {type: "lane", lane: "b"},
      {type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x", rowId: "evt-42"},
    ]);
    const row = m.rows[m.rows.length - 1];
    expect(row.id).toBe("evt-42");
  });

  it("falls back to an internal id when a caller-supplied `rowId` collides with an existing row", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a", rowId: "dup"},
      {type: "lane", lane: "b", rowId: "dup"}, // collides with the row above
    ]);
    expect(m.rows[0].id).toBe("dup");
    expect(m.rows[1].id).not.toBe("dup");
    expect(typeof m.rows[1].id).toBe("number");
  });

  it("row ids survive a full model rebuild (e.g. after a rollback) when every event carries its own id", () => {
    // seeded lanes (#10) so no implicit `lane` row needs its own rowId
    const build = () => {
      const m = createSwimlaneModel({lanes: [{lane: "a"}, {lane: "b"}]});
      ingestSwimlaneEvents(m, [
        {type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x", rowId: "r1"},
        {type: "state", lane: "a", state: "running", rowId: "r2"},
      ]);
      return m;
    };
    const first = build();
    const second = build(); // simulates rebuilding from scratch on every refresh
    expect(second.rows.map((r) => r.id)).toEqual(first.rows.map((r) => r.id));
    expect(second.rows.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("seeds lanes via createSwimlaneModel({lanes}) with no row and no 'joined' box", () => {
    const m = createSwimlaneModel({
      lanes: [
        {lane: "a", label: "Alpha", state: "running", meta: {ref: "A"}},
        {lane: "b"},
      ],
    });
    expect(m.laneOrder).toEqual(["a", "b"]);
    expect(m.laneLabels.a).toBe("Alpha");
    expect(m.laneMeta.a).toEqual({ref: "A"});
    expect(m.current.a).toEqual({state: "running", acts: []});
    expect(m.current.b).toEqual({state: "created", acts: []});
    expect(m.rows).toHaveLength(0); // no "joined" row for either seeded lane
  });

  it("a `lane` event for an already-seeded lane only updates label/meta, still no row", () => {
    const m = createSwimlaneModel({lanes: [{lane: "a"}]});
    ingestSwimlaneEvents(m, [{type: "lane", lane: "a", label: "Alpha", meta: {ref: "A2"}}]);
    expect(m.laneLabels.a).toBe("Alpha");
    expect(m.laneMeta.a).toEqual({ref: "A2"});
    expect(m.rows).toHaveLength(0);
  });

  it("a call referencing a seeded lane does not add an implicit lane row for it", () => {
    const m = createSwimlaneModel({lanes: [{lane: "a"}, {lane: "b"}]});
    ingestSwimlaneEvents(m, [{type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x"}]);
    expect(m.rows.map((r) => r.event.type)).toEqual(["call"]);
  });

  it("trims to maxRows and garbage-collects spans", () => {
    const m = createSwimlaneModel({maxRows: 10});
    const evs = [];
    for (let i = 0; i < 200; i++) {
      evs.push({type: "call" as const, kind: "event" as const, id: `e${i}`, from: "a", to: "b", label: "x"});
    }
    ingestSwimlaneEvents(m, evs);
    expect(m.rows.length).toBeLessThanOrEqual(10 + 50);
    expect(Object.keys(m.spans).length).toBeLessThanOrEqual(m.rows.length);
    expect(m.rows[m.rows.length - 1].event).toMatchObject({id: "e199"});
  });

  it("works on an Immer draft and produces a serialisable, unshared tree", () => {
    const base = {swimlane: createSwimlaneModel()};
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d.swimlane, [
        {type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1},
      ]);
    });
    const m: SwimlaneModel = next.swimlane;
    expect(Object.isFrozen(m)).toBe(true);
    expect(m.rows[2].post).not.toBe(m.current);
    expect(JSON.parse(JSON.stringify(m))).toEqual(m);
    // later update must not change earlier rows
    const next2 = produce(next, (d) => {
      ingestSwimlaneEvents(d.swimlane, [{type: "reply", id: "c1", ok: true, label: "ok", ts: 2}]);
    });
    expect(next2.swimlane.rows[2]).toBe(m.rows[2]);
    expect(next2.swimlane.current.b.acts).toEqual([]);
  });

  it("projects pending replies newest first and closes activities in the projection", () => {
    const m = buildDemoModel({t0: 0});
    const ghosts = projectPending(m.current, m.pending);
    expect(ghosts.map((g) => g.pending.id)).toEqual(["c10", "x1", "c3", "c1"]);
    const c10 = ghosts[0];
    expect(c10.pre.notifier.acts).toContain("c10");
    expect(c10.post.notifier.acts).not.toContain("c10");
    // projection must not mutate the model
    expect(m.current.notifier.acts).toContain("c10");
  });

  it("completed demo leaves nothing outstanding", () => {
    const m = buildDemoModel({t0: 0, complete: true});
    expect(m.pending).toHaveLength(0);
    expect(Object.values(m.current).every((l) => l.acts.length === 0)).toBe(true);
  });

  it("clearSwimlaneRows keeps lanes and outstanding messages", () => {
    const m = buildDemoModel({t0: 0});
    clearSwimlaneRows(m);
    expect(m.rows).toHaveLength(0);
    expect(m.laneOrder.length).toBeGreaterThan(0);
    expect(m.pending.length).toBeGreaterThan(0);
  });

  it("infers call parents from the caller's innermost open activity", () => {
    const m = buildDemoModel({t0: 0, complete: true});
    expect(m.spans.c2.parent).toBe("c1"); // gateway → auth while handling POST /checkout
    expect(m.spans.c1.parent).toBeUndefined(); // client has no open activity
    expect(relatedCallIds(m, "c3")).toEqual(["c4", "c5", "c6", "c7", "c8", "c9"]);
    expect(m.spans.c10.parent).toBe("c8"); // notifier self-call while processing order.created
    expect(m.spans.c11.parent).toBe("c8"); // email.sent callback sent from that activity
  });

  it("an explicit parentId overrides inference", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "call", kind: "sync", id: "p1", from: "a", to: "b", label: "one"},
      {type: "call", kind: "sync", id: "p2", from: "a", to: "b", label: "two"},
      // b is handling p1 and p2; the default guess would be p2 (innermost)
      {type: "call", kind: "sync", id: "k", from: "b", to: "c", label: "child", parentId: "p1"},
    ]);
    expect(m.spans.k.parent).toBe("p1");
    expect(relatedCallIds(m, "p1")).toEqual(["k"]);
    expect(relatedCallIds(m, "p2")).toEqual([]);
  });

  it("describes targets", () => {
    const m = buildDemoModel({t0: 0});
    expect(describeSwimlaneTarget(m, {kind: "transition", id: "c6"}, 0)).toContain("402 declined");
    expect(describeSwimlaneTarget(m, {kind: "pending", id: "x1"}, 100_000)).toContain("OVERDUE");
  });

  it("describes a lane target as its label and current state", () => {
    const m = buildDemoModel({t0: 0});
    expect(describeSwimlaneTarget(m, {kind: "lane", id: "gateway"})).toBe("api-gateway · running");
  });

  it("uses a custom formatTs for the 'state' and 'activity' descriptions", () => {
    const m = buildDemoModel({t0: 0});
    const fmt = (ts: number) => `virtual-${ts}`;
    const desc = describeSwimlaneTarget(m, {kind: "activity", id: "c3"}, 0, fmt);
    expect(desc).toMatch(/started virtual-\d+/);
  });

  it("stepKeyOf groups rows by `step`, and treats each unstepped row as its own step", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "state", lane: "a", state: "degraded", ts: 1, step: "s1"},
      {type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x", ts: 1, step: "s1"},
      {type: "call", kind: "event", id: "e2", from: "a", to: "b", label: "y", ts: 2},
    ]);
    // ingest order: lane "a" (implicit), the state row, lane "b" (implicit,
    // first referenced by the stepped call), the stepped call, the unstepped call
    const [laneA, stRow, laneB, callRow, unstepped] = m.rows;
    expect(stepKeyOf(stRow)).toBe(stepKeyOf(callRow));
    expect(stepKeyOf(laneA)).not.toBe(stepKeyOf(laneB));
    expect(stepKeyOf(unstepped)).toBe(`row:${unstepped.id}`);
    expect(stepRows(m, stepKeyOf(stRow))).toEqual([stRow, callRow]);
    expect(stepRows(m, stepKeyOf(unstepped))).toEqual([unstepped]);
  });

  it("describes a step target as a summary of its rows", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "state", lane: "a", state: "degraded", ts: 1000, step: "s1"},
      {type: "call", kind: "event", id: "e1", from: "a", to: "b", label: "x", ts: 1000, step: "s1"},
    ]);
    const stepId = stepKeyOf(m.rows[m.rows.length - 1]);
    const desc = describeSwimlaneTarget(m, {kind: "step", id: stepId}, 0);
    expect(desc).toContain("2 events");
    expect(desc).toContain("state, call");
  });
});
