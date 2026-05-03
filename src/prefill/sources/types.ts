import type { FormDefinition, GraphNode } from "../../types/actionBlueprintGraph";
import type { ActionBlueprintGraph } from "../../types/actionBlueprintGraph";
import type { PrefillBinding } from "../types";

export interface PrefillOption {
  id: string;
  label: string;
  binding: PrefillBinding;
}

export interface PrefillSourceContext {
  graph: ActionBlueprintGraph;
  nodesById: Map<string, GraphNode>;
  formsById: Map<string, FormDefinition>;
  targetFormNode: GraphNode;
}

export interface PrefillDataSource {
  id: string;
  sectionTitle: string;
  listOptions(ctx: PrefillSourceContext): PrefillOption[];
}
