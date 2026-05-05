import { useCallback, useMemo, useRef, useState } from "react";
import { saveBlueprintGraph } from "../api/saveBlueprintGraph";
import { fromApiInputMapping } from "../prefill/inputMapping";
import type { InputMappingState, PrefillBinding } from "../prefill/types";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";
import { mergeDemoMappings } from "../demo/seedDemoMappings";

function initFromGraph(graph: ActionBlueprintGraph): Record<string, InputMappingState> {
  const init: Record<string, InputMappingState> = {};
  for (const n of graph.nodes) {
    if (n.type === "form") {
      init[n.id] = fromApiInputMapping(n.data.input_mapping as Record<string, unknown>);
    }
  }
  return mergeDemoMappings(graph, init);
}

export interface UseMappingsApi {
  mappings: Record<string, InputMappingState>;
  getMapping: (formNodeId: string) => InputMappingState;
  setBinding: (formNodeId: string, fieldKey: string, binding: PrefillBinding) => void;
  clearBinding: (formNodeId: string, fieldKey: string) => void;
}

/**
 * Owns all per-form prefill mapping state. Initialized from the API payload
 * (plus optional demo seeding) and exposes minimal mutators.
 *
 * Every mutation fires a best-effort PUT to persist the full graph back to the
 * server using the ETag captured at load time for optimistic concurrency.
 * The mock server is read-only so this silently no-ops there.
 */
export function useMappings(
  graph: ActionBlueprintGraph | null,
  etag: string = "",
): UseMappingsApi {
  const initial = useMemo(
    () => (graph ? initFromGraph(graph) : {}),
    [graph],
  );
  const [mappings, setMappings] =
    useState<Record<string, InputMappingState>>(initial);

  // Re-seed when the graph changes (e.g. blueprint switch in the future).
  useMemo(() => {
    setMappings(initial);
  }, [initial]);

  // Keep a stable ref to the latest graph + etag so callbacks don't go stale.
  const graphRef = useRef(graph);
  const etagRef = useRef(etag);
  graphRef.current = graph;
  etagRef.current = etag;

  const getMapping = useCallback(
    (formNodeId: string) => mappings[formNodeId] ?? {},
    [mappings],
  );

  const setBinding = useCallback(
    (formNodeId: string, fieldKey: string, binding: PrefillBinding) => {
      setMappings((prev) => {
        const next = {
          ...prev,
          [formNodeId]: { ...(prev[formNodeId] ?? {}), [fieldKey]: binding },
        };
        if (graphRef.current) {
          saveBlueprintGraph(graphRef.current, next, etagRef.current);
        }
        return next;
      });
    },
    [],
  );

  const clearBinding = useCallback(
    (formNodeId: string, fieldKey: string) => {
      setMappings((prev) => {
        const updated = { ...(prev[formNodeId] ?? {}) };
        delete updated[fieldKey];
        const next = { ...prev, [formNodeId]: updated };
        if (graphRef.current) {
          saveBlueprintGraph(graphRef.current, next, etagRef.current);
        }
        return next;
      });
    },
    [],
  );

  return { mappings, getMapping, setBinding, clearBinding };
}
