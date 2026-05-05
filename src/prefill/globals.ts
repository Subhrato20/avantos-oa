/**
 * Mock "global properties" registry — stand-in for Action Properties /
 * Client Organization Properties referenced in the challenge brief.
 *
 * Both the prefill source AND the binding-summary formatter read from this,
 * so labels stay in sync everywhere a global is shown.
 */

export interface GlobalProperty {
  propertyKey: string;
  label: string;
}

export const GLOBAL_PROPERTIES: readonly GlobalProperty[] = [
  { propertyKey: "action.created_at", label: "Action created at" },
  { propertyKey: "client.org_name", label: "Client organization name" },
  { propertyKey: "client.org_id", label: "Client organization id" },
];

/** Human-readable label for a global property key, falling back to the key itself. */
export function globalLabelFor(propertyKey: string): string {
  return GLOBAL_PROPERTIES.find((g) => g.propertyKey === propertyKey)?.label ?? propertyKey;
}
