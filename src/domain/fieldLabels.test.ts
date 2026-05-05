import { describe, expect, it } from "vitest";
import type { FormDefinition } from "../types/actionBlueprintGraph";
import { getFieldLabel, listFieldKeys, listPrefillableFieldKeys } from "./fieldLabels";

const form: FormDefinition = {
  id: "f",
  name: "f",
  field_schema: {
    type: "object",
    properties: {
      email: { avantos_type: "short-text", title: "Email (schema)", type: "string" },
      phone: { avantos_type: "short-text", title: "Phone (schema)", type: "string" },
      legacy: { avantos_type: "short-text", type: "string" },
      submit: { avantos_type: "button", title: "Submit", type: "string" },
    },
  },
  ui_schema: {
    type: "VerticalLayout",
    elements: [
      { type: "Control", scope: "#/properties/email", label: "Email (ui)" },
      // phone has no ui_schema entry — should fall back to schema title
    ],
  },
};

describe("fieldLabels", () => {
  describe("getFieldLabel", () => {
    it("prefers ui_schema Control label when present", () => {
      expect(getFieldLabel(form, "email")).toBe("Email (ui)");
    });

    it("falls back to field_schema.properties[key].title when no ui_schema label", () => {
      expect(getFieldLabel(form, "phone")).toBe("Phone (schema)");
    });

    it("falls back to the raw field key when neither is set", () => {
      expect(getFieldLabel(form, "legacy")).toBe("legacy");
    });

    it("returns the key for unknown fields rather than throwing", () => {
      expect(getFieldLabel(form, "does_not_exist")).toBe("does_not_exist");
    });
  });

  describe("listFieldKeys", () => {
    it("returns all schema property keys, including buttons", () => {
      const keys = listFieldKeys(form);
      expect(keys).toContain("email");
      expect(keys).toContain("submit");
    });

    it("returns [] when the form has no properties", () => {
      const empty: FormDefinition = {
        id: "x",
        name: "x",
        field_schema: { type: "object" },
      };
      expect(listFieldKeys(empty)).toEqual([]);
    });
  });

  describe("listPrefillableFieldKeys", () => {
    it("excludes fields with avantos_type 'button'", () => {
      const keys = listPrefillableFieldKeys(form);
      expect(keys).not.toContain("submit");
      expect(keys).toContain("email");
      expect(keys).toContain("phone");
    });
  });
});
