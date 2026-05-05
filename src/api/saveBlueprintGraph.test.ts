import { afterEach, describe, expect, it, vi } from "vitest";
import { saveBlueprintGraph } from "./saveBlueprintGraph";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";

describe("saveBlueprintGraph", () => {
  afterEach(() => vi.restoreAllMocks());

  it("PUTs to the graph URL with serialized input_mappings", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    const mappings = {
      "form-d": {
        email: { sourceType: "form_field" as const, formNodeId: "form-a", fieldKey: "email" },
      },
    };

    await saveBlueprintGraph(dagFixtureGraph, mappings, '"etag-abc"');

    expect(fetch).toHaveBeenCalledOnce();
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]!;
    expect(calledUrl).toMatch(/\/graph$/);
    expect(calledInit?.method).toBe("PUT");
    expect((calledInit?.headers as Record<string, string>)["If-Match"]).toBe('"etag-abc"');
    const body = JSON.parse(calledInit?.body as string);
    expect(body.version_notes).toBe("Prefill mapping update");
    // The updated node should have the new input_mapping.
    const updatedNode = body.nodes.find((n: { id: string }) => n.id === "form-d");
    expect(updatedNode.data.input_mapping).toEqual({
      email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
    });
  });

  it("omits If-Match header when etag is empty (mock server)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    await saveBlueprintGraph(dagFixtureGraph, {}, "");

    const [, calledInit] = vi.mocked(fetch).mock.calls[0]!;
    expect((calledInit?.headers as Record<string, string>)["If-Match"]).toBeUndefined();
  });

  it("silently ignores a 404 response (read-only mock server)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(saveBlueprintGraph(dagFixtureGraph, {}, "")).resolves.toBeUndefined();
  });

  it("silently ignores a 412 Precondition Failed (concurrent edit)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 412 }));
    await expect(saveBlueprintGraph(dagFixtureGraph, {}, '"stale-etag"')).resolves.toBeUndefined();
  });

  it("silently ignores network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(saveBlueprintGraph(dagFixtureGraph, {}, "")).resolves.toBeUndefined();
  });
});
