import { GLOBAL_PROPERTIES } from "../globals";
import type { PrefillDataSource, PrefillOption, PrefillSourceContext } from "./types";

export const globalPropertiesSource: PrefillDataSource = {
  id: "global_properties",
  sectionTitle: "Global data",
  listOptions(ctx: PrefillSourceContext): PrefillOption[] {
    void ctx;
    return GLOBAL_PROPERTIES.map((g) => ({
      id: `global:${g.propertyKey}`,
      label: g.label,
      binding: {
        sourceType: "global_property",
        propertyKey: g.propertyKey,
      },
    }));
  },
};
