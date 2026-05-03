import { useEffect, useMemo, useState } from "react";
import { fetchBlueprintGraph } from "./api/fetchBlueprintGraph";
import { buildFormsById, buildNodesById } from "./api/mappers";
import { FormList } from "./components/FormList";
import { PrefillModal } from "./components/PrefillModal";
import { PrefillPanel } from "./components/PrefillPanel";
import { fromApiInputMapping } from "./prefill/inputMapping";
import type { InputMappingState } from "./prefill/types";
import type { PrefillOption } from "./prefill/sources/types";
import type { ActionBlueprintGraph } from "./types/actionBlueprintGraph";
import { mergeDemoMappings } from "./demo/seedDemoMappings";
import "./App.css";

function initMappingsFromGraph(graph: ActionBlueprintGraph): Record<string, InputMappingState> {
  const init: Record<string, InputMappingState> = {};
  for (const n of graph.nodes) {
    if (n.type === "form") {
      init[n.id] = fromApiInputMapping(n.data.input_mapping as Record<string, unknown>);
    }
  }
  return mergeDemoMappings(graph, init);
}

export default function App() {
  const [graph, setGraph] = useState<ActionBlueprintGraph | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<Record<string, InputMappingState>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerFieldKey, setPickerFieldKey] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchBlueprintGraph(ac.signal)
      .then((g) => {
        setGraph(g);
        setMappings(initMappingsFromGraph(g));
        const first = g.nodes.find((n) => n.type === "form");
        setSelectedId(first?.id ?? null);
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setLoadError(err instanceof Error ? err.message : String(err));
      });
    return () => ac.abort();
  }, []);

  const nodesById = useMemo(
    () => (graph ? buildNodesById(graph) : new Map()),
    [graph],
  );
  const formsById = useMemo(
    () => (graph ? buildFormsById(graph) : new Map()),
    [graph],
  );

  const selectedNode = selectedId ? nodesById.get(selectedId) : undefined;
  const targetForm = selectedNode
    ? formsById.get(selectedNode.data.component_id)
    : undefined;

  const modalContext = useMemo(() => {
    if (!graph || !selectedNode) return null;
    return {
      graph,
      nodesById,
      formsById,
      targetFormNode: selectedNode,
    };
  }, [graph, selectedNode, nodesById, formsById]);

  const resolveFormName = (formNodeId: string) =>
    nodesById.get(formNodeId)?.data.name ?? formNodeId;

  const handleClearField = (fieldKey: string) => {
    if (!selectedId) return;
    setMappings((prev) => {
      const cur = { ...prev[selectedId] };
      delete cur[fieldKey];
      return { ...prev, [selectedId]: cur };
    });
  };

  const handlePickOption = (option: PrefillOption) => {
    if (!selectedId || !pickerFieldKey) return;
    const fieldKey = pickerFieldKey;
    setMappings((prev) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [fieldKey]: option.binding,
      },
    }));
    setPickerFieldKey(null);
  };

  if (loadError) {
    return (
      <div className="app app--center">
        <p className="error">Could not load blueprint graph.</p>
        <pre className="error-detail">{loadError}</pre>
        <p className="hint">
          Start the mock server (see README) and check <code>.env</code>.
        </p>
      </div>
    );
  }

  if (!graph || selectedId === null || !selectedNode || !targetForm || !modalContext) {
    return (
      <div className="app app--center">
        <p>Loading blueprint graph…</p>
      </div>
    );
  }

  const currentMapping = mappings[selectedId] ?? {};

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{graph.name}</h1>
        <p className="app-sub">Prefill mapping (challenge demo)</p>
      </header>
      <div className="app-body">
        <FormList
          nodes={graph.nodes}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <main className="app-main">
          <PrefillPanel
            targetNode={selectedNode}
            form={targetForm}
            mapping={currentMapping}
            resolveFormName={resolveFormName}
            onClearField={handleClearField}
            onOpenPicker={(fieldKey) => setPickerFieldKey(fieldKey)}
          />
        </main>
      </div>
      <PrefillModal
        context={modalContext}
        isOpen={pickerFieldKey !== null}
        title={
          pickerFieldKey
            ? `Choose prefill source for “${pickerFieldKey}”`
            : "Choose prefill source"
        }
        onClose={() => setPickerFieldKey(null)}
        onSelect={handlePickOption}
      />
    </div>
  );
}
