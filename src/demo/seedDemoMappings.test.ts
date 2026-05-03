import { describe, expect, it } from "vitest";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";
import { mergeDemoMappings, SAMPLE_BLUEPRINT_ID } from "./seedDemoMappings";

describe("mergeDemoMappings", () => {
  it("does nothing for unknown blueprint ids", () => {
    const base = { x: {} };
    expect(mergeDemoMappings(dagFixtureGraph as ActionBlueprintGraph, base)).toBe(base);
  });

  it("merges demo rows for the sample Avantos mock blueprint", () => {
    const graph = {
      ...dagFixtureGraph,
      id: SAMPLE_BLUEPRINT_ID,
    } as ActionBlueprintGraph;
    const out = mergeDemoMappings(graph, {});
    expect(
      out["form-0f58384c-4966-4ce6-9ec2-40b96d61f745"]?.email?.sourceType,
    ).toBe("form_field");
    expect(
      out["form-bad163fd-09bd-4710-ad80-245f31b797d5"]?.name?.sourceType,
    ).toBe("global_property");
  });
});
