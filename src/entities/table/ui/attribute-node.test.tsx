import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttributeNode } from "./attribute-node";
import { DropdownProvider } from "@fsd/shared/lib/dropdown-context";
import type { Column } from "@fsd/entities/solution";

// Wrap with the DropdownProvider required by ManagedDropdownMenu
function renderWithProvider(ui: React.ReactElement) {
  return render(<DropdownProvider>{ui}</DropdownProvider>);
}

const baseHandlers = {
  handleEdit: vi.fn(),
  handleDelete: vi.fn(),
  handleToggleFkArray: vi.fn(),
};

function makeColumn(type: string, name = "test_col"): Column {
  return { id: "col-1", name, type };
}

describe("AttributeNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Label display ─────────────────────────────────────────────────────────

  it("displays 'FK' label for FOREIGN_KEY column", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY", "user_id")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByText("FK")).toBeInTheDocument();
  });

  it("displays 'FK[]' label for FOREIGN_KEY_ARRAY column", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY_ARRAY", "user_ids")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByText("FK[]")).toBeInTheDocument();
  });

  it("displays 'PK' label for PRIMARY_KEY column", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("PRIMARY_KEY", "id")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByText("PK")).toBeInTheDocument();
  });

  it("displays raw type for user-defined column types", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("VARCHAR", "username")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByText("VARCHAR")).toBeInTheDocument();
  });

  // ─── Dropdown visibility ───────────────────────────────────────────────────

  it("shows the dropdown trigger for FOREIGN_KEY columns", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    // The MoreButton renders a button element
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows the dropdown trigger for FOREIGN_KEY_ARRAY columns", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY_ARRAY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does NOT show a dropdown trigger for PRIMARY_KEY columns", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("PRIMARY_KEY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the dropdown trigger for regular columns", () => {
    renderWithProvider(
      <AttributeNode
        column={makeColumn("VARCHAR")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // ─── FK dropdown contents ──────────────────────────────────────────────────

  it("opens dropdown showing only 'Toggle array' for FOREIGN_KEY", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Toggle array")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("opens dropdown showing only 'Toggle array' for FOREIGN_KEY_ARRAY", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY_ARRAY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Toggle array")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("calls handleToggleFkArray with columnId when 'Toggle array' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AttributeNode
        column={makeColumn("FOREIGN_KEY")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Toggle array"));

    expect(baseHandlers.handleToggleFkArray).toHaveBeenCalledWith("col-1");
    expect(baseHandlers.handleToggleFkArray).toHaveBeenCalledTimes(1);
  });

  // ─── Regular column dropdown contents ─────────────────────────────────────

  it("opens dropdown showing Edit and Delete for regular columns", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AttributeNode
        column={makeColumn("VARCHAR")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.queryByText("Toggle array")).not.toBeInTheDocument();
  });

  it("calls handleEdit when Edit is clicked", async () => {
    const user = userEvent.setup();
    const col = makeColumn("VARCHAR");
    renderWithProvider(
      <AttributeNode
        column={col}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Edit"));

    expect(baseHandlers.handleEdit).toHaveBeenCalledWith(col);
    expect(baseHandlers.handleEdit).toHaveBeenCalledTimes(1);
  });

  it("calls handleDelete when Delete is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AttributeNode
        column={makeColumn("VARCHAR")}
        columnId="col-1"
        {...baseHandlers}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Delete"));

    expect(baseHandlers.handleDelete).toHaveBeenCalledWith("col-1");
    expect(baseHandlers.handleDelete).toHaveBeenCalledTimes(1);
  });
});
