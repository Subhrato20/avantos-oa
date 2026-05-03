import type { InputMappingState } from "../prefill/types";
import type { ActionBlueprintGraph } from "../types/actionBlueprintGraph";

/** Matches `public/graph-mock.json` / frontendchallengeserver sample. */
export const SAMPLE_BLUEPRINT_ID = "bp_01jk766tckfwx84xjcxazggzyc";

const N = {
  formA: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
  formD: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
  formF: "form-bad163fd-09bd-4710-ad80-245f31b797d5",
} as const;

/**
 * Example mappings so the UI demonstrates direct / transitive / global sources
 * without manual clicks (challenge screenshots: Form D email ← Form A).
 */
export function mergeDemoMappings(
  graph: ActionBlueprintGraph,
  base: Record<string, InputMappingState>,
): Record<string, InputMappingState> {
  if (graph.id !== SAMPLE_BLUEPRINT_ID) return base;

  const out: Record<string, InputMappingState> = { ...base };

  const mergeNode = (nodeId: string, patch: InputMappingState) => {
    out[nodeId] = { ...(out[nodeId] ?? {}), ...patch };
  };

  // Form D — align with brief: email prefilled from Form A's email (transitive upstream)
  mergeNode(N.formD, {
    email: {
      sourceType: "form_field",
      formNodeId: N.formA,
      fieldKey: "email",
    },
  });

  // Form F — email from direct upstream Form D; name from global (shows multiple source types)
  mergeNode(N.formF, {
    email: {
      sourceType: "form_field",
      formNodeId: N.formD,
      fieldKey: "email",
    },
    name: {
      sourceType: "global_property",
      propertyKey: "client.org_name",
    },
  });

  return out;
}
