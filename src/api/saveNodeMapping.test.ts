import { afterEach, describe, expect, it, vi } from "vitest";
import { saveNodeMapping } from "./saveNodeMapping";

describe("saveNodeMapping", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("PATCHes the correct node URL with serialized input_mapping", async () => {
    const fetched: RequestInit[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string, init: RequestInit) => {
        fetched.push({ ...init, url } as RequestInit & { url: string });
        return Promise.resolve({ ok: true, status: 200 });
      }),
    );

    await saveNodeMapping("form-d", {
      email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
    });

    expect(fetch).toHaveBeenCalledOnce();
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]!;
    expect(calledUrl).toMatch(/\/nodes\/form-d$/);
    expect(calledInit?.method).toBe("PATCH");
    const body = JSON.parse(calledInit?.body as string);
    expect(body).toEqual({
      input_mapping: {
        email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
      },
    });
  });

  it("silently ignores a 404 response (read-only mock server)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    await expect(saveNodeMapping("form-d", {})).resolves.toBeUndefined();
  });

  it("silently ignores a 405 response (method not allowed)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 405 }),
    );
    await expect(saveNodeMapping("form-d", {})).resolves.toBeUndefined();
  });

  it("silently ignores network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(saveNodeMapping("form-d", {})).resolves.toBeUndefined();
  });
});
