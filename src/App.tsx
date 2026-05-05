import { useEffect, useMemo, useState } from "react";
import { buildFormsById, buildNodesById } from "./api/mappers";
import { FormList } from "./components/FormList";
import { PrefillModal } from "./components/PrefillModal";
import { PrefillPanel } from "./components/PrefillPanel";
import { useBlueprintGraph } from "./hooks/useBlueprintGraph";
import { useMappings } from "./hooks/useMappings";
import type { PrefillOption } from "./prefill/sources/types";
import "./App.css";

export default function App() {
  const graphState = useBlueprintGraph();
  const graph = graphState.graph;
  const { getMapping, setBinding, clearBinding } = useMappings(graph);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerFieldKey, setPickerFieldKey] = useState<string | null>(null);

  const nodesById = useMemo(
    () => (graph ? buildNodesById(graph) : new Map()),
    [graph],
  );
  const formsById = useMemo(
    () => (graph ? buildFormsById(graph) : new Map()),
    [graph],
  );

  // Default-select the first form once the graph arrives.
  useEffect(() => {
    if (!graph || selectedId !== null) return;
    const first = graph.nodes.find((n) => n.type === "form");
    if (first) setSelectedId(first.id);
  }, [graph, selectedId]);

  const selectedNode = selectedId ? nodesById.get(selectedId) : undefined;
  const targetForm = selectedNode
    ? formsById.get(selectedNode.data.component_id)
    : undefined;

  const modalContext = useMemo(() => {
    if (!graph || !selectedNode) return null;
    return { graph, nodesById, formsById, targetFormNode: selectedNode };
  }, [graph, selectedNode, nodesById, formsById]);

  const resolveFormName = (formNodeId: string) =>
    nodesById.get(formNodeId)?.data.name ?? formNodeId;

  const handlePickOption = (option: PrefillOption) => {
    if (!selectedId || !pickerFieldKey) return;
    setBinding(selectedId, pickerFieldKey, option.binding);
    setPickerFieldKey(null);
  };

  if (graphState.status === "error") {
    return (
      <div className="app app--center">
        <p className="error">Could not load blueprint graph.</p>
        <pre className="error-detail">{graphState.error}</pre>
        <p className="hint">
          Start the mock server (see README) and check <code>.env</code>.
        </p>
      </div>
    );
  }

  if (!graph || !selectedNode || !targetForm || !modalContext) {
    return (
      <div className="app app--center">
        <p>Loading blueprint graph…</p>
      </div>
    );
  }

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
            mapping={getMapping(selectedNode.id)}
            resolveFormName={resolveFormName}
            onClearField={(fieldKey) => clearBinding(selectedNode.id, fieldKey)}
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
