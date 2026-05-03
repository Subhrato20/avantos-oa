import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBlueprintGraphUrl, fetchBlueprintGraph } from "./fetchBlueprintGraph";

describe("fetchBlueprintGraph", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("buildBlueprintGraphUrl joins path segments", () => {
    const url = buildBlueprintGraphUrl(
      "http://localhost:3000",
      "tenant-1",
      "bp_abc",
    );
    expect(url).toBe(
      "http://localhost:3000/api/v1/tenant-1/actions/blueprints/bp_abc/graph",
    );
  });

  it("fetches JSON", async () => {
    const payload = { id: "bp", tenant_id: "1", nodes: [], edges: [], forms: [], branches: [], triggers: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      }),
    );

    const result = await fetchBlueprintGraph();
    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/1/actions/blueprints/bp_test/graph",
      expect.any(Object),
    );
  });

  it("in dev, falls back to bundled graph when API returns non-OK", async () => {
    const fallback = {
      id: "bp_fallback",
      tenant_id: "1",
      nodes: [],
      edges: [],
      forms: [],
      branches: [],
      triggers: [],
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve("err"),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(fallback),
        }),
    );

    const result = await fetchBlueprintGraph();
    expect(result).toEqual(fallback);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it("throws when API errors and bundled mock also fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve("err"),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: () => Promise.resolve(""),
        }),
    );

    await expect(fetchBlueprintGraph()).rejects.toThrow(/fallback failed/);
  });
});
