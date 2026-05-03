import type { PrefillBinding, InputMappingState } from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseBinding(raw: unknown): PrefillBinding | null {
  if (!isRecord(raw)) return null;
  const st = raw.sourceType;
  if (st === "form_field") {
    const formNodeId = raw.formNodeId;
    const fieldKey = raw.fieldKey;
    if (typeof formNodeId === "string" && typeof fieldKey === "string") {
      return { sourceType: "form_field", formNodeId, fieldKey };
    }
  }
  if (st === "global_property") {
    const propertyKey = raw.propertyKey;
    if (typeof propertyKey === "string") {
      return { sourceType: "global_property", propertyKey };
    }
  }
  return null;
}

/** Deserialize node.data.input_mapping from API into typed bindings (unknown keys skipped). */
export function fromApiInputMapping(
  raw: Record<string, unknown> | undefined | null,
): InputMappingState {
  if (!raw) return {};
  const out: InputMappingState = {};
  for (const [targetKey, value] of Object.entries(raw)) {
    const b = parseBinding(value);
    if (b) out[targetKey] = b;
  }
  return out;
}

/** Serialize for persistence / API (same shape as client model for this challenge). */
export function toApiInputMapping(state: InputMappingState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state)) {
    out[k] = { ...v };
  }
  return out;
}

export function formatBindingSummary(
  binding: PrefillBinding,
  resolveFormName: (formNodeId: string) => string,
): string {
  if (binding.sourceType === "global_property") {
    return binding.propertyKey;
  }
  const formName = resolveFormName(binding.formNodeId);
  return `${formName} / ${binding.fieldKey}`;
}
