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

  it("ignores malformed bindings rather than crashing", () => {
    const raw = {
      ok: { sourceType: "global_property", propertyKey: "x" },
      missingKey: { sourceType: "form_field", formNodeId: "n" }, // missing fieldKey
      unknownType: { sourceType: "wat" },
      notAnObject: "string",
    };
    const parsed = fromApiInputMapping(raw);
    expect(Object.keys(parsed)).toEqual(["ok"]);
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

  it("formatBindingSummary uses the global label registry for known keys", () => {
    const b: PrefillBinding = {
      sourceType: "global_property",
      propertyKey: "client.org_name",
    };
    expect(formatBindingSummary(b, () => "")).toBe("Client organization name");
  });

  it("formatBindingSummary falls back to the raw key for unknown globals", () => {
    const b: PrefillBinding = {
      sourceType: "global_property",
      propertyKey: "unknown.key",
    };
    expect(formatBindingSummary(b, () => "")).toBe("unknown.key");
  });
});
