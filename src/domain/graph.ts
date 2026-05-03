import type { GraphNode } from "../types/actionBlueprintGraph";

/**
 * Direct upstream form nodes are the blueprint node's `prerequisites` list.
 * This matches the mock graph where edges align with prerequisite direction
 * (source must complete before target).
 */
export function getDirectUpstreamNodeIds(node: GraphNode | undefined): string[] {
  if (!node) return [];
  return [...(node.data.prerequisites ?? [])];
}

/**
 * All ancestor form node ids: every node reachable by walking prerequisite
 * chains upward from the target (excluding the target itself).
 */
export function getAllUpstreamNodeIds(
  targetNodeId: string,
  nodesById: Map<string, GraphNode>,
): Set<string> {
  const all = new Set<string>();

  const visit = (id: string) => {
    const prereqs = nodesById.get(id)?.data.prerequisites ?? [];
    for (const p of prereqs) {
      if (!all.has(p)) {
        all.add(p);
        visit(p);
      }
    }
  };

  visit(targetNodeId);
  return all;
}

/** Ancestors that are not direct prerequisites of the target. */
export function getTransitiveOnlyUpstreamNodeIds(
  targetNodeId: string,
  nodesById: Map<string, GraphNode>,
): Set<string> {
  const target = nodesById.get(targetNodeId);
  const all = getAllUpstreamNodeIds(targetNodeId, nodesById);
  const direct = new Set(getDirectUpstreamNodeIds(target));
  for (const d of direct) {
    all.delete(d);
  }
  return all;
}
