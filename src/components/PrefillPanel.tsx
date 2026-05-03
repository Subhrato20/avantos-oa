import { formatBindingSummary } from "../prefill/inputMapping";
import type { InputMappingState } from "../prefill/types";
import type { FormDefinition, GraphNode } from "../types/actionBlueprintGraph";
import { getFieldLabel, listPrefillableFieldKeys } from "../domain/fieldLabels";
import styles from "./PrefillPanel.module.css";

interface PrefillPanelProps {
  targetNode: GraphNode;
  form: FormDefinition;
  /** Full current mapping for this node (initialized from API + edits). */
  mapping: InputMappingState;
  resolveFormName: (formNodeId: string) => string;
  onClearField: (fieldKey: string) => void;
  onOpenPicker: (fieldKey: string) => void;
}

export function PrefillPanel({
  targetNode,
  form,
  mapping,
  resolveFormName,
  onClearField,
  onOpenPicker,
}: PrefillPanelProps) {
  const fields = listPrefillableFieldKeys(form);

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.headerBlock}>
          <h2 className={styles.heading}>Prefill — {targetNode.data.name}</h2>
          <p className={styles.hint}>
            Select a field to map it to an upstream form field or global data. Use ✕ to
            remove a mapping.
          </p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colField}>Field</th>
            <th className={styles.colPrefill}>Prefill source</th>
            <th className={styles.colAction} aria-label="Clear" />
          </tr>
        </thead>
        <tbody>
          {fields.map((fieldKey) => {
            const binding = mapping[fieldKey];
            const label = getFieldLabel(form, fieldKey);
            const summary = binding
              ? formatBindingSummary(binding, resolveFormName)
              : null;

            return (
              <tr key={fieldKey}>
                <td>
                  <button
                    type="button"
                    className={styles.fieldBtn}
                    onClick={() => onOpenPicker(fieldKey)}
                  >
                    <span className={styles.fieldLabel}>{label}</span>
                    <code className={styles.fieldKey}>{fieldKey}</code>
                  </button>
                </td>
                <td>
                  {summary ? (
                    <span className={styles.summary}>{summary}</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.configureBtn}
                      onClick={() => onOpenPicker(fieldKey)}
                    >
                      Choose source…
                    </button>
                  )}
                </td>
                <td>
                  {binding ? (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      aria-label={`Clear prefill for ${label}`}
                      onClick={() => onClearField(fieldKey)}
                    >
                      ✕
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
