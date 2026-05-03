import type { PrefillDataSource, PrefillOption, PrefillSourceContext } from "./types";

/** Stand-in for Action Properties / Client Organization Properties (challenge allows mock globals). */
const MOCK_GLOBALS: { propertyKey: string; label: string }[] = [
  { propertyKey: "action.created_at", label: "Action created at" },
  { propertyKey: "client.org_name", label: "Client organization name" },
  { propertyKey: "client.org_id", label: "Client organization id" },
];

export const globalPropertiesSource: PrefillDataSource = {
  id: "global_properties",
  sectionTitle: "Global data",
  listOptions(ctx: PrefillSourceContext): PrefillOption[] {
    void ctx;
    return MOCK_GLOBALS.map((g) => ({
      id: `global:${g.propertyKey}`,
      label: g.label,
      binding: {
        sourceType: "global_property",
        propertyKey: g.propertyKey,
      },
    }));
  },
};
