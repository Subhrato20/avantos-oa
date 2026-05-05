import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMappings } from "./useMappings";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";

describe("useMappings", () => {
  it("getMapping returns {} for unknown nodes", () => {
    const { result } = renderHook(() => useMappings(dagFixtureGraph));
    expect(result.current.getMapping("nope")).toEqual({});
  });

  it("setBinding adds a field-level mapping", () => {
    const { result } = renderHook(() => useMappings(dagFixtureGraph));
    act(() =>
      result.current.setBinding("form-d", "email", {
        sourceType: "form_field",
        formNodeId: "form-a",
        fieldKey: "email",
      }),
    );
    expect(result.current.getMapping("form-d")).toEqual({
      email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
    });
  });

  it("clearBinding removes a single field without touching siblings", () => {
    const { result } = renderHook(() => useMappings(dagFixtureGraph));
    act(() => {
      result.current.setBinding("form-d", "email", {
        sourceType: "form_field",
        formNodeId: "form-a",
        fieldKey: "email",
      });
      result.current.setBinding("form-d", "phone", {
        sourceType: "global_property",
        propertyKey: "client.org_id",
      });
    });
    act(() => result.current.clearBinding("form-d", "email"));
    expect(result.current.getMapping("form-d")).toEqual({
      phone: { sourceType: "global_property", propertyKey: "client.org_id" },
    });
  });

  it("returns empty mappings when graph is null", () => {
    const { result } = renderHook(() => useMappings(null));
    expect(result.current.getMapping("anything")).toEqual({});
  });
});
