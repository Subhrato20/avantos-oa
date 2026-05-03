import { getDirectUpstreamNodeIds } from "../../domain/graph";
import { getFieldLabel, listFieldKeys } from "../../domain/fieldLabels";
import type { PrefillDataSource, PrefillOption, PrefillSourceContext } from "./types";

/**
 * Form fields from forms that the target directly depends on (prerequisites).
 */
export const directUpstreamFormFieldsSource: PrefillDataSource = {
  id: "direct_upstream_form_fields",
  sectionTitle: "Form fields of forms that this form directly depends on",
  listOptions(ctx: PrefillSourceContext): PrefillOption[] {
    const { nodesById, formsById, targetFormNode } = ctx;
    const directIds = getDirectUpstreamNodeIds(targetFormNode);
    const options: PrefillOption[] = [];

    for (const nodeId of directIds) {
      const node = nodesById.get(nodeId);
      if (!node) continue;
      const form = formsById.get(node.data.component_id);
      if (!form) continue;
      const formName = node.data.name;
      for (const fieldKey of listFieldKeys(form)) {
        options.push({
          id: `direct:${nodeId}:${fieldKey}`,
          label: `${formName} / ${getFieldLabel(form, fieldKey)}`,
          binding: {
            sourceType: "form_field",
            formNodeId: nodeId,
            fieldKey,
          },
        });
      }
    }
    return options;
  },
};
