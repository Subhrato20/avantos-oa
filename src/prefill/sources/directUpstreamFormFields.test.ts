import { describe, expect, it } from "vitest";
import { buildFormsById, buildNodesById } from "../../api/mappers";
import { dagFixtureGraph } from "../../test/fixtures/graphFixtures";
import { directUpstreamFormFieldsSource } from "./directUpstreamFormFields";

describe("directUpstreamFormFieldsSource", () => {
  const nodesById = buildNodesById(dagFixtureGraph);
  const formsById = buildFormsById(dagFixtureGraph);

  it("lists fields only from direct prerequisite forms", () => {
    // Form D's only direct prerequisite is Form B
    const targetFormNode = nodesById.get("form-d")!;
    const opts = directUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    // Form B has only `name`; Form A is transitive and must NOT appear.
    expect(opts).toHaveLength(1);
    expect(opts[0]?.label).toBe("Form B / Name");
    expect(opts[0]?.binding).toEqual({
      sourceType: "form_field",
      formNodeId: "form-b",
      fieldKey: "name",
    });
  });

  it("returns no options when the target has no prerequisites", () => {
    const targetFormNode = nodesById.get("form-a")!;
    const opts = directUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    expect(opts).toEqual([]);
  });

  it("uses ui_schema labels for option text", () => {
    // Form B → Form D so Form B is a direct upstream of Form D; but ui_schema for fb is empty.
    // Use Form A's children to verify ui_schema label resolution: Form B → upstream Form A.
    const targetFormNode = nodesById.get("form-b")!;
    const opts = directUpstreamFormFieldsSource.listOptions({
      graph: dagFixtureGraph,
      nodesById,
      formsById,
      targetFormNode,
    });
    // Form A has ui_schema labels: "Email" and "Full name"
    const labels = opts.map((o) => o.label).sort();
    expect(labels).toEqual(["Form A / Email", "Form A / Full name"]);
  });
});
