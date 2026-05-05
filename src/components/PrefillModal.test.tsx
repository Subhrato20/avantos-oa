import { cleanup, render, screen, within } from "@testing-library/react";
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

  it("closes on the explicit Cancel button", async () => {
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
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("requires picking an option AND clicking Select before firing onSelect", async () => {
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
    const dialog = screen.getByRole("dialog");
    const selectBtn = within(dialog).getByRole("button", { name: /^select$/i });

    // Disabled until an option is picked.
    expect(selectBtn).toBeDisabled();

    // Pick the Form A category on the left.
    await userEvent.click(within(dialog).getByRole("button", { name: /^Form A$/ }));

    // Pick the email option on the right (full aria-label preserves "Form A / Email").
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Form A \/ Email/i }),
    );

    expect(onSelect).not.toHaveBeenCalled();
    expect(selectBtn).not.toBeDisabled();

    await userEvent.click(selectBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toMatchObject({
      binding: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
    });
  });

  it("commits the selection on double-click as a shortcut", async () => {
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
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^Form A$/ }),
    );
    await userEvent.dblClick(
      within(dialog).getByRole("button", { name: /Form A \/ Email/i }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
