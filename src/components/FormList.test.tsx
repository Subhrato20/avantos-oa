import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormList } from "./FormList";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";

describe("FormList", () => {
  afterEach(() => cleanup());

  it("renders only nodes whose type is 'form'", () => {
    const nodesWithNonForm = [
      ...dagFixtureGraph.nodes,
      {
        ...dagFixtureGraph.nodes[0]!,
        id: "trigger-1",
        type: "trigger",
        data: { ...dagFixtureGraph.nodes[0]!.data, name: "Trigger Node" },
      },
    ];
    render(<FormList nodes={nodesWithNonForm} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Form A" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trigger Node" })).not.toBeInTheDocument();
  });

  it("invokes onSelect with the clicked node id", async () => {
    const onSelect = vi.fn();
    render(
      <FormList nodes={dagFixtureGraph.nodes} selectedId={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Form D" }));
    expect(onSelect).toHaveBeenCalledWith("form-d");
  });

  it("marks the selected form button via aria/class state", () => {
    render(
      <FormList
        nodes={dagFixtureGraph.nodes}
        selectedId="form-b"
        onSelect={() => {}}
      />,
    );
    const selected = screen.getByRole("button", { name: "Form B" });
    const unselected = screen.getByRole("button", { name: "Form A" });
    // Class names are CSS-module-hashed but contain "Active" for the active item.
    expect(selected.className).toMatch(/Active/);
    expect(unselected.className).not.toMatch(/Active/);
  });
});
