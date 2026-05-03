import type { FormDefinition } from "../types/actionBlueprintGraph";

function scopeToPropertyKey(scope: string | undefined): string | null {
  if (!scope || !scope.startsWith("#/properties/")) return null;
  return scope.replace("#/properties/", "");
}

/**
 * Best-effort label for a field key using ui_schema Control elements.
 */
export function getFieldLabel(form: FormDefinition, fieldKey: string): string {
  const elements = form.ui_schema?.elements ?? [];
  for (const el of elements) {
    if (el.type === "Control" && el.scope) {
      const key = scopeToPropertyKey(el.scope);
      if (key === fieldKey && el.label) {
        return el.label;
      }
    }
  }
  const prop = form.field_schema.properties?.[fieldKey];
  if (prop && typeof prop.title === "string") return prop.title;
  return fieldKey;
}

export function listFieldKeys(form: FormDefinition): string[] {
  const props = form.field_schema.properties;
  if (!props) return [];
  return Object.keys(props);
}

/** Fields shown in prefill UI (exclude non-data controls like buttons). */
export function listPrefillableFieldKeys(form: FormDefinition): string[] {
  return listFieldKeys(form).filter((k) => {
    const p = form.field_schema.properties?.[k];
    return p?.avantos_type !== "button";
  });
}
