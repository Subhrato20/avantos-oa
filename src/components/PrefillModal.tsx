import { useEffect, useRef } from "react";
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

/**
 * Accessible modal:
 *  - Escape closes (listens on `document`, not on the backdrop's onKeyDown).
 *  - Focus is moved into the dialog on open.
 *  - Focus is restored to the previously-focused element on close.
 *  - Focus is trapped inside the dialog while open (Tab / Shift+Tab cycles).
 */
export function PrefillModal({
  context,
  isOpen,
  title,
  onClose,
  onSelect,
}: PrefillModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Document-level Escape — works regardless of where focus actually is.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus management: move focus into the dialog on open, restore on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Defer to allow the dialog to mount.
    const id = window.setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      const firstFocusable = root.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (firstFocusable ?? root).focus();
    }, 0);

    return () => {
      window.clearTimeout(id);
      const prev = previouslyFocused.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isOpen]);

  // Focus trap: keep Tab navigation inside the dialog.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  const sources = getAllPrefillSources();

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefill-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
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
