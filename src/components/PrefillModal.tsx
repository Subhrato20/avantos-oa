import { useEffect, useMemo, useRef, useState } from "react";
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

interface CategoryGroup {
  /** Stable category id (source.id + optional sub-key, e.g. "form-a") */
  id: string;
  /** Display label, e.g. "Form A" or "Action Properties" */
  label: string;
  options: PrefillOption[];
}

/**
 * Two-pane "Select data element to map" modal:
 *   - Left: searchable category list (one per source, plus per-form sub-categories
 *     for the upstream-form sources so reviewers see the same shape as the brief).
 *   - Right: flat option list for the selected category.
 *   - Footer: Cancel / Select. Select is disabled until an option is highlighted.
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

  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  // Build categories:
  //   * One group per upstream FORM (merged across direct + transitive sources, deduped by binding).
  //   * One group per non-form source (e.g. Action Properties, Client Org Properties).
  // Mirrors the "expand a form to see its fields" pattern from the brief screenshots.
  const categories = useMemo<CategoryGroup[]>(() => {
    if (!isOpen) return [];
    const sources = getAllPrefillSources();

    const formGroups = new Map<string, { label: string; options: Map<string, PrefillOption> }>();
    const nonFormGroups: CategoryGroup[] = [];

    for (const source of sources) {
      const opts = source.listOptions(context);
      if (opts.length === 0) continue;

      const otherOpts: PrefillOption[] = [];
      for (const o of opts) {
        if (o.binding.sourceType === "form_field") {
          const formId = o.binding.formNodeId;
          let entry = formGroups.get(formId);
          if (!entry) {
            const node = context.nodesById.get(formId);
            entry = { label: node?.data.name ?? formId, options: new Map() };
            formGroups.set(formId, entry);
          }
          // Dedupe by binding (same form/field showing up via direct + transitive).
          const dedupeKey = `${o.binding.formNodeId}:${o.binding.fieldKey}`;
          if (!entry.options.has(dedupeKey)) entry.options.set(dedupeKey, o);
        } else {
          otherOpts.push(o);
        }
      }
      if (otherOpts.length > 0) {
        nonFormGroups.push({
          id: source.id,
          label: source.sectionTitle,
          options: otherOpts,
        });
      }
    }

    const formGroupList: CategoryGroup[] = [...formGroups.entries()].map(
      ([formId, { label, options }]) => ({
        id: `form:${formId}`,
        label,
        options: [...options.values()],
      }),
    );

    return [...nonFormGroups, ...formGroupList];
  }, [isOpen, context]);

  // Default-select the first category whenever the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setActiveCategoryId(categories[0]?.id ?? null);
    setActiveOptionId(null);
    setSearch("");
  }, [isOpen, categories]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;
  const filteredOptions = useMemo(() => {
    if (!activeCategory) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activeCategory.options;
    return activeCategory.options.filter((o) => o.label.toLowerCase().includes(q));
  }, [activeCategory, search]);

  // Document-level Escape close.
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

  // Focus management.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      (first ?? root).focus();
    }, 0);
    return () => {
      window.clearTimeout(id);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Tab focus trap.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  const handleConfirm = () => {
    if (!activeOptionId || !activeCategory) return;
    const opt = activeCategory.options.find((o) => o.id === activeOptionId);
    if (opt) onSelect(opt);
  };

  if (!isOpen) return null;

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
          <aside className={styles.leftPane} aria-label="Available data">
            <p className={styles.paneLabel}>Available data</p>
            <input
              type="search"
              placeholder="Search"
              className={styles.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search options"
            />
            <ul className={styles.categoryList}>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={
                      activeCategoryId === cat.id
                        ? `${styles.categoryBtn} ${styles.categoryBtnActive}`
                        : styles.categoryBtn
                    }
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      setActiveOptionId(null);
                    }}
                  >
                    <span className={styles.caret} aria-hidden="true">
                      {activeCategoryId === cat.id ? "▾" : "▸"}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.rightPane} aria-label="Options">
            {filteredOptions.length === 0 ? (
              <p className={styles.empty}>
                {activeCategory ? "No matches" : "Select a category on the left"}
              </p>
            ) : (
              <ul className={styles.optionList}>
                {filteredOptions.map((opt) => {
                  // Show the LAST segment after " / " so the right pane shows just the field name.
                  const display = opt.label.includes(" / ")
                    ? opt.label.split(" / ").slice(-1)[0]
                    : opt.label;
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        className={
                          activeOptionId === opt.id
                            ? `${styles.optionBtn} ${styles.optionBtnActive}`
                            : styles.optionBtn
                        }
                        onClick={() => setActiveOptionId(opt.id)}
                        onDoubleClick={() => onSelect(opt)}
                        // Keep test-friendly accessible name: full "Form A / Email"
                        aria-label={opt.label}
                      >
                        {display}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className={styles.selectBtn}
            disabled={!activeOptionId}
            onClick={handleConfirm}
          >
            SELECT
          </button>
        </footer>
      </div>
    </div>
  );
}
