import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrefillPanel } from "./PrefillPanel";
import { dagFixtureGraph } from "../test/fixtures/graphFixtures";
import { buildFormsById, buildNodesById } from "../api/mappers";

const nodesById = buildNodesById(dagFixtureGraph);
const formsById = buildFormsById(dagFixtureGraph);
const targetNode = nodesById.get("form-d")!;
const targetForm = formsById.get(targetNode.data.component_id)!;
const resolveFormName = (id: string) => nodesById.get(id)?.data.name ?? id;

describe("PrefillPanel", () => {
  afterEach(() => cleanup());

  it("lists each prefillable field as a clickable row when unmapped", () => {
    render(
      <PrefillPanel
        targetNode={targetNode}
        form={targetForm}
        mapping={{}}
        resolveFormName={resolveFormName}
        onClearField={() => {}}
        onOpenPicker={() => {}}
      />,
    );
    // Form D has `email` (and `submit`, which is a button and excluded).
    // Empty rows render the raw field key as the row label.
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Set prefill mapping for/i }),
    ).toBeInTheDocument();
    // No clear button when nothing is mapped.
    expect(
      screen.queryByRole("button", { name: /Clear prefill for/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the binding summary and clear button when a mapping exists", () => {
    render(
      <PrefillPanel
        targetNode={targetNode}
        form={targetForm}
        mapping={{
          email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
        }}
        resolveFormName={resolveFormName}
        onClearField={() => {}}
        onOpenPicker={() => {}}
      />,
    );
    expect(screen.getByText("Form A / email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear prefill for/i }),
    ).toBeInTheDocument();
  });

  it("calls onOpenPicker when a field row is clicked", async () => {
    const onOpenPicker = vi.fn();
    render(
      <PrefillPanel
        targetNode={targetNode}
        form={targetForm}
        mapping={{}}
        resolveFormName={resolveFormName}
        onClearField={() => {}}
        onOpenPicker={onOpenPicker}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Set prefill mapping for/i }),
    );
    expect(onOpenPicker).toHaveBeenCalledWith("email");
  });

  it("calls onClearField when the clear button is pressed", async () => {
    const onClearField = vi.fn();
    render(
      <PrefillPanel
        targetNode={targetNode}
        form={targetForm}
        mapping={{
          email: { sourceType: "form_field", formNodeId: "form-a", fieldKey: "email" },
        }}
        resolveFormName={resolveFormName}
        onClearField={onClearField}
        onOpenPicker={() => {}}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Clear prefill for/i }),
    );
    expect(onClearField).toHaveBeenCalledWith("email");
  });
});
