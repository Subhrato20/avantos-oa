import { toApiInputMapping } from "../prefill/inputMapping";
import type { InputMappingState } from "../prefill/types";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";
import { buildBlueprintGraphUrl } from "./fetchBlueprintGraph";

/**
 * PUT the full blueprint graph back to the server with updated input_mappings.
 *
 * Real API: PUT /api/v1/{tenant}/actions/blueprints/{blueprintId}/{versionId}/graph
 *   - Requires If-Match header with the ETag from the preceding GET.
 *   - Returns 412 Precondition Failed if the graph was modified since the GET.
 *
 * Mock server: read-only — returns 404 for non-GET requests, silently ignored.
 * Empty etag (mock / local fallback): request is sent without If-Match header.
 */
export async function saveBlueprintGraph(
  graph: ActionBlueprintGraph,
  mappings: Record<string, InputMappingState>,
  etag: string,
  signal?: AbortSignal,
): Promise<void> {
  let url: string;
  try {
    url = buildBlueprintGraphUrl();
  } catch {
    // Env vars missing (e.g. unit tests) — skip silently.
    return;
  }

  // Merge updated input_mappings into the node list.
  const nodes = graph.nodes.map((node) => {
    const nodeMapping = mappings[node.id];
    if (!nodeMapping) return node;
    return {
      ...node,
      data: { ...node.data, input_mapping: toApiInputMapping(nodeMapping) },
    };
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (etag) {
    headers["If-Match"] = etag;
  }

  try {
    await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        nodes,
        edges: graph.edges,
        version_notes: "Prefill mapping update",
      }),
      signal,
    });
    // Any response (including 404/405 from the read-only mock) is acceptable.
    // 412 Precondition Failed means a concurrent edit — also silently accepted
    // here; a production app would prompt the user to refresh.
  } catch {
    // Network errors and AbortErrors are silently ignored —
    // in-memory state remains the source of truth.
  }
}
