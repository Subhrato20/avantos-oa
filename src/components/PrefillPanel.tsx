import { formatBindingSummary } from "../prefill/inputMapping";
import type { InputMappingState } from "../prefill/types";
import type { FormDefinition, GraphNode } from "../types/actionBlueprintGraph";
import { getFieldLabel, listPrefillableFieldKeys } from "../domain/fieldLabels";
import styles from "./PrefillPanel.module.css";

interface PrefillPanelProps {
  targetNode: GraphNode;
  form: FormDefinition;
  mapping: InputMappingState;
  resolveFormName: (formNodeId: string) => string;
  onClearField: (fieldKey: string) => void;
  onOpenPicker: (fieldKey: string) => void;
}

/** Tiny database glyph; intentionally minimal so it's not "AI slop SVG". */
function FieldIcon() {
  return (
    <svg
      className={styles.fieldIcon}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <ellipse cx="8" cy="3.2" rx="5" ry="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 3.2v9.6c0 1 2.24 1.8 5 1.8s5-.8 5-1.8V3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 8c0 1 2.24 1.8 5 1.8s5-.8 5-1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
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
      <div className={styles.headerBlock}>
        <h2 className={styles.heading}>Prefill</h2>
        <p className={styles.hint}>
          Prefill fields for <strong>{targetNode.data.name}</strong>
        </p>
      </div>

      <ul className={styles.fieldList}>
        {fields.map((fieldKey) => {
          const binding = mapping[fieldKey];
          const label = getFieldLabel(form, fieldKey);
          const summary = binding
            ? formatBindingSummary(binding, resolveFormName)
            : null;

          const rowClass = binding
            ? `${styles.fieldRow} ${styles.fieldRowFilled}`
            : `${styles.fieldRow} ${styles.fieldRowEmpty}`;

          return (
            <li key={fieldKey} className={rowClass}>
              <button
                type="button"
                className={styles.fieldButton}
                onClick={() => onOpenPicker(fieldKey)}
                aria-label={
                  binding
                    ? `Edit prefill mapping for ${label}`
                    : `Set prefill mapping for ${label}`
                }
              >
                <FieldIcon />
                <span className={styles.fieldText}>
                  {binding ? (
                    <>
                      <span className={styles.fieldKeyText}>{fieldKey}</span>
                      <span className={styles.colon}>:</span>
                      <span className={styles.fieldSummary}>{summary}</span>
                    </>
                  ) : (
                    <span className={styles.fieldKeyEmpty}>{fieldKey}</span>
                  )}
                </span>
              </button>
              {binding ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  aria-label={`Clear prefill for ${label}`}
                  onClick={() => onClearField(fieldKey)}
                >
                  ×
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
