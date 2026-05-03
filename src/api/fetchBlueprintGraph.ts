import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";

function getBaseUrl(): string {
  const base = import.meta.env.VITE_GRAPH_API_BASE;
  if (!base) {
    throw new Error("Missing VITE_GRAPH_API_BASE");
  }
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
 * GET /api/v1/{tenant}/actions/blueprints/{blueprintId}/graph
 * Matches mock server: https://github.com/mosaic-avantos/frontendchallengeserver
 */
export function buildBlueprintGraphUrl(
  baseUrl = getBaseUrl(),
  tenantId = getTenantId(),
  blueprintId = getBlueprintId(),
): string {
  return `${baseUrl}/api/v1/${tenantId}/actions/blueprints/${blueprintId}/graph`;
}

function shouldUseLocalFallback(): boolean {
  return import.meta.env.DEV;
}

/** Served from `public/graph-mock.json` when API is unreachable (same payload as frontendchallengeserver). */
async function fetchBundledGraphMock(
  signal?: AbortSignal,
): Promise<ActionBlueprintGraph> {
  const base = import.meta.env.BASE_URL ?? "/";
  const path = `${base}graph-mock.json`.replace(/\/{2,}/g, "/");
  const res = await fetch(path, { signal });
  if (!res.ok) {
    throw new Error(
      `Local graph fallback failed (${res.status}). Ensure public/graph-mock.json exists.`,
    );
  }
  return res.json() as Promise<ActionBlueprintGraph>;
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
): Promise<ActionBlueprintGraph> {
  const url = buildBlueprintGraphUrl();
  try {
    const res = await fetch(url, { signal });
    if (res.ok) {
      return res.json() as Promise<ActionBlueprintGraph>;
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
