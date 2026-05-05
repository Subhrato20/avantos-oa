import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBlueprintGraph } from "./useBlueprintGraph";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";

const fetchBlueprintGraph = vi.fn();
vi.mock("../api/fetchBlueprintGraph", () => ({
  fetchBlueprintGraph: (...args: unknown[]) => fetchBlueprintGraph(...args),
}));

describe("useBlueprintGraph", () => {
  afterEach(() => fetchBlueprintGraph.mockReset());

  it("starts in loading then resolves to ready with graph and etag", async () => {
    fetchBlueprintGraph.mockResolvedValue({ graph: dagFixtureGraph, etag: '"abc"' });
    const { result } = renderHook(() => useBlueprintGraph());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.graph).toBe(dagFixtureGraph);
    expect(result.current.etag).toBe('"abc"');
  });

  it("exposes empty etag when server returns none (mock server)", async () => {
    fetchBlueprintGraph.mockResolvedValue({ graph: dagFixtureGraph, etag: "" });
    const { result } = renderHook(() => useBlueprintGraph());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.etag).toBe("");
  });

  it("transitions to error on rejection", async () => {
    fetchBlueprintGraph.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useBlueprintGraph());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom");
  });

  it("ignores AbortError after unmount", async () => {
    const err = Object.assign(new Error("aborted"), { name: "AbortError" });
    fetchBlueprintGraph.mockRejectedValue(err);
    const { result, unmount } = renderHook(() => useBlueprintGraph());
    act(() => unmount());
    await Promise.resolve();
    expect(result.current.status).toBe("loading");
  });
});
