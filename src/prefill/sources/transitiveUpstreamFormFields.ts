import { getTransitiveOnlyUpstreamNodeIds } from "../../domain/graph";
import { getFieldLabel, listFieldKeys } from "../../domain/fieldLabels";
import type { PrefillDataSource, PrefillOption, PrefillSourceContext } from "./types";

/**
 * Form fields from forms that are upstream but not direct prerequisites.
 */
export const transitiveUpstreamFormFieldsSource: PrefillDataSource = {
  id: "transitive_upstream_form_fields",
  sectionTitle: "Form fields of forms that this form transitively depends on",
  listOptions(ctx: PrefillSourceContext): PrefillOption[] {
    const { nodesById, formsById, targetFormNode } = ctx;
    const transitiveIds = getTransitiveOnlyUpstreamNodeIds(
      targetFormNode.id,
      nodesById,
    );
    const options: PrefillOption[] = [];

    for (const nodeId of transitiveIds) {
      const node = nodesById.get(nodeId);
      if (!node) continue;
      const form = formsById.get(node.data.component_id);
      if (!form) continue;
      const formName = node.data.name;
      for (const fieldKey of listFieldKeys(form)) {
        options.push({
          id: `transitive:${nodeId}:${fieldKey}`,
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
