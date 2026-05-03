import { describe, expect, it } from "vitest";
import { fromApiInputMapping, formatBindingSummary, toApiInputMapping } from "./inputMapping";
import type { PrefillBinding } from "./types";

describe("inputMapping adapters", () => {
  it("parses known binding shapes", () => {
    const raw = {
      email: {
        sourceType: "form_field",
        formNodeId: "form-a",
        fieldKey: "email",
      },
      org: {
        sourceType: "global_property",
        propertyKey: "client.org_name",
      },
    };
    const parsed = fromApiInputMapping(raw);
    expect(parsed.email).toEqual({
      sourceType: "form_field",
      formNodeId: "form-a",
      fieldKey: "email",
    });
    expect(parsed.org).toEqual({
      sourceType: "global_property",
      propertyKey: "client.org_name",
    });
  });

  it("round-trips through toApiInputMapping", () => {
    const state: Record<string, PrefillBinding> = {
      email: {
        sourceType: "form_field",
        formNodeId: "n1",
        fieldKey: "email",
      },
    };
    const api = toApiInputMapping(state);
    const back = fromApiInputMapping(api);
    expect(back).toEqual(state);
  });

  it("formatBindingSummary shows form name for form_field", () => {
    const b: PrefillBinding = {
      sourceType: "form_field",
      formNodeId: "x",
      fieldKey: "email",
    };
    const s = formatBindingSummary(b, () => "Form A");
    expect(s).toBe("Form A / email");
  });
});
