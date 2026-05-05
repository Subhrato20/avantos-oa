import type { ActionBlueprintGraph, GraphNode } from "../../types/actionBlueprintGraph";

const baseNode = (id: string, name: string, componentId: string, prerequisites: string[]): GraphNode => ({
  id,
  type: "form",
  position: { x: 0, y: 0 },
  data: {
    id: `bp_${id}`,
    component_key: id,
    component_type: "form",
    component_id: componentId,
    name,
    prerequisites,
    permitted_roles: [],
    input_mapping: {},
    sla_duration: { number: 0, unit: "minutes" },
    approval_required: false,
    approval_roles: [],
  },
});

/** A → B → D and separate A → C chain for DAG tests. */
export const dagFixtureGraph: ActionBlueprintGraph = {
  id: "bp_fixture",
  tenant_id: "1",
  name: "Fixture",
  nodes: [
    baseNode("form-a", "Form A", "f_a", []),
    baseNode("form-b", "Form B", "f_b", ["form-a"]),
    baseNode("form-d", "Form D", "f_d", ["form-b"]),
    baseNode("form-c", "Form C", "f_c", ["form-a"]),
  ],
  edges: [
    { source: "form-a", target: "form-b" },
    { source: "form-b", target: "form-d" },
    { source: "form-a", target: "form-c" },
  ],
  forms: [
    {
      id: "f_a",
      name: "fa",
      field_schema: {
        type: "object",
        properties: {
          email: { avantos_type: "short-text", title: "Email", type: "string" },
          name: { avantos_type: "short-text", title: "Name", type: "string" },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          { type: "Control", scope: "#/properties/email", label: "Email" },
          { type: "Control", scope: "#/properties/name", label: "Full name" },
        ],
      },
    },
    {
      id: "f_b",
      name: "fb",
      field_schema: {
        type: "object",
        properties: {
          name: { avantos_type: "short-text", title: "Name", type: "string" },
        },
      },
      ui_schema: { type: "VerticalLayout", elements: [] },
    },
    {
      id: "f_d",
      name: "fd",
      field_schema: {
        type: "object",
        properties: {
          email: { avantos_type: "short-text", title: "Email", type: "string" },
          submit: { avantos_type: "button", title: "Submit", type: "string" },
        },
      },
      ui_schema: { type: "VerticalLayout", elements: [] },
    },
    {
      id: "f_c",
      name: "fc",
      field_schema: {
        type: "object",
        properties: {
          notes: { avantos_type: "multi-line-text", title: "Notes", type: "string" },
        },
      },
      ui_schema: { type: "VerticalLayout", elements: [] },
    },
  ],
  branches: [],
  triggers: [],
};
