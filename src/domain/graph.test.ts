import { describe, expect, it } from "vitest";
import { buildNodesById } from "../api/mappers";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";
import {
  getAllUpstreamNodeIds,
  getDirectUpstreamNodeIds,
  getTransitiveOnlyUpstreamNodeIds,
} from "./graph";

describe("graph DAG helpers", () => {
  const nodesById = buildNodesById(dagFixtureGraph);
  const nodeD = nodesById.get("form-d")!;
  const nodeB = nodesById.get("form-b")!;

  it("getDirectUpstreamNodeIds uses prerequisites", () => {
    expect(getDirectUpstreamNodeIds(nodeD)).toEqual(["form-b"]);
    expect(getDirectUpstreamNodeIds(nodeB)).toEqual(["form-a"]);
  });

  it("getAllUpstreamNodeIds collects transitive ancestors", () => {
    const up = getAllUpstreamNodeIds("form-d", nodesById);
    expect(up.has("form-b")).toBe(true);
    expect(up.has("form-a")).toBe(true);
    expect(up.size).toBe(2);
  });

  it("getTransitiveOnlyUpstreamNodeIds excludes direct parents", () => {
    const t = getTransitiveOnlyUpstreamNodeIds("form-d", nodesById);
    expect(t.has("form-a")).toBe(true);
    expect(t.has("form-b")).toBe(false);
  });
});
