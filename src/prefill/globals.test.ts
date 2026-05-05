import { describe, expect, it } from "vitest";
import { GLOBAL_PROPERTIES, globalLabelFor } from "./globals";

describe("globals registry", () => {
  it("returns the human label for a known propertyKey", () => {
    expect(globalLabelFor("client.org_name")).toBe("Client organization name");
  });

  it("falls back to the propertyKey for unknown globals", () => {
    expect(globalLabelFor("nope")).toBe("nope");
  });

  it("exposes a non-empty registry to the rest of the app", () => {
    expect(GLOBAL_PROPERTIES.length).toBeGreaterThan(0);
    for (const g of GLOBAL_PROPERTIES) {
      expect(typeof g.propertyKey).toBe("string");
      expect(typeof g.label).toBe("string");
    }
  });
});
