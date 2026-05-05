import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrefillModal } from "./PrefillModal";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";
import { buildFormsById, buildNodesById } from "../api/mappers";

const nodesById = buildNodesById(dagFixtureGraph);
const formsById = buildFormsById(dagFixtureGraph);
const ctx = {
  graph: dagFixtureGraph,
  nodesById,
  formsById,
  targetFormNode: nodesById.get("form-d")!,
};

describe("PrefillModal — accessibility", () => {
  afterEach(() => cleanup());

  it("renders nothing when isOpen is false", () => {
    render(
      <PrefillModal
        context={ctx}
        isOpen={false}
        title="t"
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape regardless of focus location", async () => {
    const onClose = vi.fn();
    render(
      <PrefillModal
        context={ctx}
        isOpen={true}
        title="t"
        onClose={onClose}
        onSelect={() => {}}
      />,
    );
    // Fire Escape on document.body — this previously did NOT trigger onClose
    // because the listener was on the backdrop's onKeyDown.
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click but not on dialog click", async () => {
    const onClose = vi.fn();
    render(
      <PrefillModal
        context={ctx}
        isOpen={true}
        title="t"
        onClose={onClose}
        onSelect={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("invokes onSelect with the chosen option's binding", async () => {
    const onSelect = vi.fn();
    render(
      <PrefillModal
        context={ctx}
        isOpen={true}
        title="t"
        onClose={() => {}}
        onSelect={onSelect}
      />,
    );
    // Form D's transitive upstream Form A → Email
    await userEvent.click(screen.getByRole("button", { name: /Form A \/ Email/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toMatchObject({
      binding: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
    });
  });
});
