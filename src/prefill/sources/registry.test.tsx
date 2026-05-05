/**
 * Extensibility contract test: prove that registering a new
 * `PrefillDataSource` is enough for it to surface in the modal.
 *
 * If this test breaks, the "extending data sources" story documented
 * in the README is also broken — fix one and the other together.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildFormsById, buildNodesById } from "../../api/mappers";
import { PrefillModal } from "../../components/PrefillModal";
import { dagFixtureGraph } from "../../test/fixtures/graphFixtures";
import type { PrefillDataSource } from "./types";

const fakeSource: PrefillDataSource = {
  id: "fake_source",
  sectionTitle: "Fake source for tests",
  listOptions: () => [
    {
      id: "fake:opt-1",
      label: "Fake Option 1",
      binding: { sourceType: "global_property", propertyKey: "fake.opt_1" },
    },
  ],
};

vi.mock("./index", async () => {
  const actual = await vi.importActual<typeof import("./index")>("./index");
  return {
    ...actual,
    getAllPrefillSources: () => [fakeSource],
  };
});

describe("prefill source registry — extensibility", () => {
  afterEach(() => cleanup());

  it("a freshly-registered source shows up in the modal", () => {
    const nodesById = buildNodesById(dagFixtureGraph);
    const formsById = buildFormsById(dagFixtureGraph);
    const targetFormNode = nodesById.get("form-d")!;

    render(
      <PrefillModal
        context={{ graph: dagFixtureGraph, nodesById, formsById, targetFormNode }}
        isOpen={true}
        title="Test"
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Fake source for tests")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fake Option 1" })).toBeInTheDocument();
  });
});
