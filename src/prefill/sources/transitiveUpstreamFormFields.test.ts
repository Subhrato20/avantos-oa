import { describe, expect, it } from "vitest";
import { buildFormsById, buildNodesById } from "../../api/mappers";
import { dagFixtureGraph } from "../../test/fixtures/graphFixtures";
import { transitiveUpstreamFormFieldsSource } from "./transitiveUpstreamFormFields";

describe("transitiveUpstreamFormFieldsSource", () => {
  const nodesById = buildNodesById(dagFixtureGraph);
  const formsById = buildFormsById(dagFixtureGraph);

  it("lists fields from ancestors that are NOT direct prerequisites", () => {
    // Form D: direct = Form B; transitive-only = Form A
    const targetFormNode = nodesById.get("form-d")!;
    const opts = transitiveUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    // Form A has 2 fields (email, name); Form B (direct) must NOT appear.
    const formIds = new Set(
      opts.map((o) => (o.binding.sourceType === "form_field" ? o.binding.formNodeId : "")),
    );
    expect(formIds.has("form-a")).toBe(true);
    expect(formIds.has("form-b")).toBe(false);
    expect(opts).toHaveLength(2);
  });

  it("returns nothing when only direct prerequisites exist", () => {
    // Form B: direct = Form A; no transitive.
    const targetFormNode = nodesById.get("form-b")!;
    const opts = transitiveUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    expect(opts).toEqual([]);
  });

  it("uses 'transitive:' id namespace to avoid collisions with direct source", () => {
    const targetFormNode = nodesById.get("form-d")!;
    const opts = transitiveUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    for (const o of opts) {
      expect(o.id.startsWith("transitive:")).toBe(true);
    }
  });
});
