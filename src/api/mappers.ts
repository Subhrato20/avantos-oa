import type {
  ActionBlueprintGraph,
  FormDefinition,
  GraphNode,
} from "../types/actionBlueprintGraph";

export function buildNodesById(graph: ActionBlueprintGraph): Map<string, GraphNode> {
  const map = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    map.set(node.id, node);
  }
  return map;
}

export function buildFormsById(graph: ActionBlueprintGraph): Map<string, FormDefinition> {
  const map = new Map<string, FormDefinition>();
  for (const form of graph.forms) {
    map.set(form.id, form);
  }
  return map;
}
