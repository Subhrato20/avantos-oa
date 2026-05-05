import { useEffect, useState } from "react";
import { fetchBlueprintGraph } from "../api/fetchBlueprintGraph";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";

export type BlueprintGraphState =
  | { status: "loading"; graph: null; error: null }
  | { status: "ready"; graph: ActionBlueprintGraph; error: null }
  | { status: "error"; graph: null; error: string };

/**
 * Loads the action blueprint graph once, with cancellation on unmount.
 * Keeping this isolated from `App` makes it trivially testable and reusable
 * (e.g. a future blueprint-picker screen).
 */
export function useBlueprintGraph(): BlueprintGraphState {
  const [state, setState] = useState<BlueprintGraphState>({
    status: "loading",
    graph: null,
    error: null,
  });

  useEffect(() => {
    const ac = new AbortController();
    fetchBlueprintGraph(ac.signal)
      .then((graph) => {
        setState({ status: "ready", graph, error: null });
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        const error = err instanceof Error ? err.message : String(err);
        setState({ status: "error", graph: null, error });
      });
    return () => ac.abort();
  }, []);

  return state;
}
