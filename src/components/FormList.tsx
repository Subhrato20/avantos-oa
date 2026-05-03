import type { GraphNode } from "../types/actionBlueprintGraph";
import styles from "./FormList.module.css";

interface FormListProps {
  nodes: GraphNode[];
  selectedId: string | null;
  onSelect: (nodeId: string) => void;
}

export function FormList({ nodes, selectedId, onSelect }: FormListProps) {
  const forms = nodes.filter((n) => n.type === "form");

  return (
    <aside className={styles.aside} aria-label="Forms">
      <h2 className={styles.navLabel}>Forms</h2>
      <ul className={styles.list}>
        {forms.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={
                selectedId === n.id ? `${styles.item} ${styles.itemActive}` : styles.item
              }
              onClick={() => onSelect(n.id)}
            >
              {n.data.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
