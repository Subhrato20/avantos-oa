import { useEffect, useState } from "react";
import { fetchBlueprintGraph } from "../api/fetchBlueprintGraph";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";

export type BlueprintGraphState =
  | { status: "loading"; graph: null; etag: null; error: null }
  | { status: "ready"; graph: ActionBlueprintGraph; etag: string; error: null }
  | { status: "error"; graph: null; etag: null; error: string };

/**
 * Loads the action blueprint graph once, with cancellation on unmount.
 * Also captures the ETag header so callers can send If-Match on PUT.
 */
export function useBlueprintGraph(): BlueprintGraphState {
  const [state, setState] = useState<BlueprintGraphState>({
    status: "loading",
    graph: null,
    etag: null,
    error: null,
  });

  useEffect(() => {
    const ac = new AbortController();
    fetchBlueprintGraph(ac.signal)
      .then(({ graph, etag }) => {
        setState({ status: "ready", graph, etag, error: null });
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        const error = err instanceof Error ? err.message : String(err);
        setState({ status: "error", graph: null, etag: null, error });
      });
    return () => ac.abort();
  }, []);

  return state;
}
