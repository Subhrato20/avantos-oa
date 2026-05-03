import { getAllPrefillSources } from "../prefill/sources";
import type { PrefillOption, PrefillSourceContext } from "../prefill/sources/types";
import styles from "./PrefillModal.module.css";

interface PrefillModalProps {
  context: PrefillSourceContext;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSelect: (option: PrefillOption) => void;
}

export function PrefillModal({
  context,
  isOpen,
  title,
  onClose,
  onSelect,
}: PrefillModalProps) {
  if (!isOpen) return null;

  const sources = getAllPrefillSources();

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefill-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="prefill-modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className={styles.body}>
          {sources.map((source) => {
            const options = source.listOptions(context);
            if (options.length === 0) return null;
            return (
              <section key={source.id} className={styles.section}>
                <h3 className={styles.sectionTitle}>{source.sectionTitle}</h3>
                <ul className={styles.optionList}>
                  {options.map((opt) => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        className={styles.optionBtn}
                        onClick={() => onSelect(opt)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
