export type PrefillBinding =
  | { sourceType: "form_field"; formNodeId: string; fieldKey: string }
  | { sourceType: "global_property"; propertyKey: string };

export type InputMappingState = Record<string, PrefillBinding>;
