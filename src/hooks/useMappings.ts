import { useCallback, useMemo, useState } from "react";
import { saveNodeMapping } from "../api/saveNodeMapping";
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
 * (plus optional demo seeding) and exposes minimal mutators so consumers
 * don't reach into the shape of `Record<formNodeId, InputMappingState>`.
 */
export function useMappings(graph: ActionBlueprintGraph | null): UseMappingsApi {
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

  const getMapping = useCallback(
    (formNodeId: string) => mappings[formNodeId] ?? {},
    [mappings],
  );

  const setBinding = useCallback(
    (formNodeId: string, fieldKey: string, binding: PrefillBinding) => {
      setMappings((prev) => {
        const next = { ...(prev[formNodeId] ?? {}), [fieldKey]: binding };
        saveNodeMapping(formNodeId, next);
        return { ...prev, [formNodeId]: next };
      });
    },
    [],
  );

  const clearBinding = useCallback(
    (formNodeId: string, fieldKey: string) => {
      setMappings((prev) => {
        const next = { ...(prev[formNodeId] ?? {}) };
        delete next[fieldKey];
        saveNodeMapping(formNodeId, next);
        return { ...prev, [formNodeId]: next };
      });
    },
    [],
  );

  return { mappings, getMapping, setBinding, clearBinding };
}
