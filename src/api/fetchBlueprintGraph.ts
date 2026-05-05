import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";

function getBaseUrl(): string {
  const base = import.meta.env.VITE_GRAPH_API_BASE;
  if (!base) throw new Error("Missing VITE_GRAPH_API_BASE");
  return base.replace(/\/$/, "");
}

function getTenantId(): string {
  const id = import.meta.env.VITE_TENANT_ID;
  if (!id) throw new Error("Missing VITE_TENANT_ID");
  return id;
}

function getBlueprintId(): string {
  const id = import.meta.env.VITE_BLUEPRINT_ID;
  if (!id) throw new Error("Missing VITE_BLUEPRINT_ID");
  return id;
}

/**
 * Real API path: /api/v1/{tenant}/actions/blueprints/{blueprintId}/{versionId}/graph
 * Mock server path (no versionId): /api/v1/{tenant}/actions/blueprints/{blueprintId}/graph
 *
 * When VITE_BLUEPRINT_VERSION_ID is set the version segment is included (real API).
 * When absent the segment is omitted (mock server).
 */
export function buildBlueprintGraphUrl(
  baseUrl = getBaseUrl(),
  tenantId = getTenantId(),
  blueprintId = getBlueprintId(),
  versionId = import.meta.env.VITE_BLUEPRINT_VERSION_ID ?? "",
): string {
  const versionSegment = versionId ? `/${versionId}` : "";
  return `${baseUrl}/api/v1/${tenantId}/actions/blueprints/${blueprintId}${versionSegment}/graph`;
}

export interface FetchBlueprintGraphResult {
  graph: ActionBlueprintGraph;
  /** ETag returned by the server — required for PUT (If-Match). Empty string when absent (mock server). */
  etag: string;
}

function shouldUseLocalFallback(): boolean {
  return import.meta.env.DEV;
}

async function fetchBundledGraphMock(
  signal?: AbortSignal,
): Promise<FetchBlueprintGraphResult> {
  const base = import.meta.env.BASE_URL ?? "/";
  const path = `${base}graph-mock.json`.replace(/\/{2,}/g, "/");
  const res = await fetch(path, { signal });
  if (!res.ok) {
    throw new Error(
      `Local graph fallback failed (${res.status}). Ensure public/graph-mock.json exists.`,
    );
  }
  const graph = (await res.json()) as ActionBlueprintGraph;
  return { graph, etag: "" };
}

function isNetworkLikeError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    return m.includes("fetch") || m.includes("network") || m.includes("failed to fetch");
  }
  return false;
}

export async function fetchBlueprintGraph(
  signal?: AbortSignal,
): Promise<FetchBlueprintGraphResult> {
  const url = buildBlueprintGraphUrl();
  try {
    const res = await fetch(url, { signal });
    if (res.ok) {
      const graph = (await res.json()) as ActionBlueprintGraph;
      const etag = res.headers.get("ETag") ?? "";
      return { graph, etag };
    }
    if (shouldUseLocalFallback()) {
      return fetchBundledGraphMock(signal);
    }
    const text = await res.text();
    throw new Error(`Failed to load blueprint graph (${res.status}): ${text}`);
  } catch (err) {
    if (shouldUseLocalFallback() && isNetworkLikeError(err)) {
      return fetchBundledGraphMock(signal);
    }
    throw err;
  }
}
