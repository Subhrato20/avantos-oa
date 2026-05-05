import { toApiInputMapping } from "../prefill/inputMapping";
import type { InputMappingState } from "../prefill/types";
import { buildBlueprintGraphUrl } from "./fetchBlueprintGraph";

/**
 * PATCH the input_mapping for a single form node back to the server.
 *
 * The mock server (frontendchallengeserver) is read-only and returns 404/405,
 * so we treat any non-2xx response as a silent no-op rather than an error —
 * the in-memory state in useMappings is always the source of truth.
 */
export async function saveNodeMapping(
  formNodeId: string,
  mapping: InputMappingState,
  signal?: AbortSignal,
): Promise<void> {
  let url: string;
  try {
    // buildBlueprintGraphUrl throws if env vars are missing (e.g. in tests).
    url = buildBlueprintGraphUrl();
  } catch {
    return;
  }

  // Derive the per-node endpoint from the graph URL:
  // …/blueprints/{id}/graph  →  …/blueprints/{id}/graph/nodes/{nodeId}
  const nodeUrl = `${url}/nodes/${encodeURIComponent(formNodeId)}`;

  try {
    await fetch(nodeUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_mapping: toApiInputMapping(mapping) }),
      signal,
    });
    // Any response (including 404/405 from the read-only mock) is acceptable.
  } catch {
    // Network errors (server down, AbortError) are silently ignored —
    // in-memory state is still up to date.
  }
}
