import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBlueprintGraphUrl, fetchBlueprintGraph } from "./fetchBlueprintGraph";

describe("fetchBlueprintGraph", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildBlueprintGraphUrl", () => {
    it("omits version segment when versionId is empty", () => {
      const url = buildBlueprintGraphUrl("http://localhost:3000", "tenant-1", "bp_abc", "");
      expect(url).toBe("http://localhost:3000/api/v1/tenant-1/actions/blueprints/bp_abc/graph");
    });

    it("includes version segment when versionId is provided", () => {
      const url = buildBlueprintGraphUrl("http://localhost:3000", "tenant-1", "bp_abc", "bpv_xyz");
      expect(url).toBe(
        "http://localhost:3000/api/v1/tenant-1/actions/blueprints/bp_abc/bpv_xyz/graph",
      );
    });
  });

  it("fetches JSON and captures ETag header", async () => {
    const payload = { id: "bp", tenant_id: "1", nodes: [], edges: [], forms: [], branches: [], triggers: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
        headers: { get: (h: string) => (h === "ETag" ? '"abc123"' : null) },
      }),
    );

    const result = await fetchBlueprintGraph();
    expect(result.graph).toEqual(payload);
    expect(result.etag).toBe('"abc123"');
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/1/actions/blueprints/bp_test/graph",
      expect.any(Object),
    );
  });

  it("returns empty etag when server sends no ETag header", async () => {
    const payload = { id: "bp", tenant_id: "1", nodes: [], edges: [], forms: [], branches: [], triggers: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
        headers: { get: () => null },
      }),
    );

    const result = await fetchBlueprintGraph();
    expect(result.etag).toBe("");
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
          headers: { get: () => null },
        }),
    );

    const result = await fetchBlueprintGraph();
    expect(result.graph).toEqual(fallback);
    expect(result.etag).toBe("");
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
