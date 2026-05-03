/**
 * Types aligned with mock server graph.json / action blueprint graph API.
 */

export type SlaUnit = "minutes" | "hours" | "days" | string;

export interface SlaDuration {
  number: number;
  unit: SlaUnit;
}

/** Partial JSON Schema shape for form field_schema.properties values */
export interface FieldSchemaProperty {
  title?: string;
  type?: string;
  format?: string;
  avantos_type?: string;
  [key: string]: unknown;
}

export interface FormFieldSchema {
  type?: string;
  properties?: Record<string, FieldSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

export interface UiSchemaElement {
  type: string;
  scope?: string;
  label?: string;
  options?: Record<string, unknown>;
  elements?: UiSchemaElement[];
  [key: string]: unknown;
}

export interface FormUiSchema {
  type?: string;
  elements?: UiSchemaElement[];
  [key: string]: unknown;
}

export interface DynamicFieldConfigEntry {
  selector_field?: string;
  payload_fields?: Record<string, unknown>;
  endpoint_id?: string;
  [key: string]: unknown;
}

export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  is_reusable?: boolean;
  field_schema: FormFieldSchema;
  ui_schema?: FormUiSchema;
  dynamic_field_config?: Record<string, DynamicFieldConfigEntry>;
}

export interface FormNodeData {
  id: string;
  component_key: string;
  component_type: string;
  component_id: string;
  name: string;
  /** Upstream form node ids (direct dependencies). Canonical for DAG edges in this challenge. */
  prerequisites: string[];
  permitted_roles: string[];
  /** API may use object or JSON-compatible structure */
  input_mapping: Record<string, unknown>;
  sla_duration: SlaDuration;
  approval_required: boolean;
  approval_roles: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface GraphNode {
  id: string;
  type: string;
  position: Position;
  data: FormNodeData;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ActionBlueprintGraph {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: FormDefinition[];
  branches: unknown[];
  triggers: unknown[];
}
