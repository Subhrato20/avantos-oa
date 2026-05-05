import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { dagFixtureGraph } from "./test/fixtures/graphFixtures";

const fetchBlueprintGraph = vi.fn();

vi.mock("./api/fetchBlueprintGraph", () => ({
  fetchBlueprintGraph: (...args: unknown[]) => fetchBlueprintGraph(...args),
}));

describe("App", () => {
  afterEach(() => {
    cleanup();
    fetchBlueprintGraph.mockReset();
  });

  it("loads graph and shows prefill for selected form", async () => {
    fetchBlueprintGraph.mockResolvedValue({ graph: dagFixtureGraph, etag: "" });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Fixture/i })).toBeInTheDocument();
    });

    // Select Form D from the list (FormList button).
    const formDListBtn = screen
      .getAllByRole("button", { name: "Form D" })
      .find((b) => b.tagName === "BUTTON")!;
    await userEvent.click(formDListBtn);

    // Panel heading is just "Prefill"; the target form name is in the hint.
    expect(screen.getByRole("heading", { name: /^Prefill$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Set prefill mapping for/i }),
    ).toBeInTheDocument();
  });

  it("sets and clears a prefill mapping via modal", async () => {
    fetchBlueprintGraph.mockResolvedValue({ graph: dagFixtureGraph, etag: "" });
    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Fixture/i })).toBeInTheDocument(),
    );

    const formDListBtn = screen
      .getAllByRole("button", { name: "Form D" })
      .find((b) => b.tagName === "BUTTON")!;
    await userEvent.click(formDListBtn);

    // Click the empty field row to open the modal.
    const fieldRow = screen.getByRole("button", { name: /Set prefill mapping for/i });
    await userEvent.click(fieldRow);

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const dialog = screen.getByRole("dialog");

    // Pick "Form A" category on the left.
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^Form A$/ }),
    );

    // Pick the email option on the right.
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Form A \/ Email/i }),
    );

    // Confirm with SELECT.
    await userEvent.click(within(dialog).getByRole("button", { name: /^select$/i }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    // Mapping summary appears in the panel.
    expect(screen.getByText(/Form A \/ email/i)).toBeInTheDocument();

    // Clear it.
    await userEvent.click(
      screen.getByRole("button", { name: /Clear prefill for/i }),
    );
    expect(screen.queryByText(/Form A \/ email/i)).not.toBeInTheDocument();
  });
});
