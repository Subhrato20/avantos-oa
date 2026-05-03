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
    fetchBlueprintGraph.mockResolvedValue(dagFixtureGraph);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Fixture/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Form D" }));

    expect(screen.getByRole("heading", { name: /Prefill — Form D/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Choose source/i })).toBeInTheDocument();
  });

  it("sets and clears a prefill mapping via modal", async () => {
    fetchBlueprintGraph.mockResolvedValue(dagFixtureGraph);
    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Fixture/i })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "Form D" }));

    const configureButtons = screen.getAllByRole("button", { name: /Choose source/i });
    await userEvent.click(configureButtons[0]!);

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toBeInTheDocument(),
    );

    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Form A \/ Email/i }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(screen.getByText(/Form A \/ email/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Clear prefill for/i }));

    expect(screen.queryByText(/Form A \/ email/i)).not.toBeInTheDocument();
  });
});
