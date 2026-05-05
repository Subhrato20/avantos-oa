import { describe, expect, it } from "vitest";
import { buildFormsById, buildNodesById } from "../../api/mappers";
import { dagFixtureGraph } from "../../test/fixtures/graphFixtures";
import { globalPropertiesSource } from "./globalProperties";

describe("globalPropertiesSource", () => {
  const nodesById = buildNodesById(dagFixtureGraph);
  const formsById = buildFormsById(dagFixtureGraph);
  const ctx = {
    graph: dagFixtureGraph,
    nodesById,
    formsById,
    targetFormNode: nodesById.get("form-a")!,
  };

  it("returns the same options regardless of target form", () => {
    const a = globalPropertiesSource.listOptions({
      ...ctx,
      targetFormNode: nodesById.get("form-a")!,
    });
    const d = globalPropertiesSource.listOptions({
      ...ctx,
      targetFormNode: nodesById.get("form-d")!,
    });
    expect(a).toEqual(d);
    expect(a.length).toBeGreaterThan(0);
  });

  it("emits global_property bindings with the documented propertyKey shape", () => {
    const opts = globalPropertiesSource.listOptions(ctx);
    for (const o of opts) {
      expect(o.binding.sourceType).toBe("global_property");
      if (o.binding.sourceType === "global_property") {
        expect(typeof o.binding.propertyKey).toBe("string");
      }
    }
  });

  it("includes the documented mock globals", () => {
    const opts = globalPropertiesSource.listOptions(ctx);
    const keys = opts.map((o) =>
      o.binding.sourceType === "global_property" ? o.binding.propertyKey : "",
    );
    expect(keys).toContain("client.org_name");
    expect(keys).toContain("client.org_id");
    expect(keys).toContain("action.created_at");
  });
});
