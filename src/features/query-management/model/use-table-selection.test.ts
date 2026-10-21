import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableSelection } from "./use-table-selection";

type Props = {
	q: string;
	tables: string[];
	open: boolean;
	initial?: string[];
};

// Helper to make a fresh hook invocation under a given initial state.
function setup(
	queryText: string,
	availableTableNames: string[],
	isOpen: boolean,
	initialTables?: string[]
) {
	return renderHook(
		({ q, tables, open, initial }: Props) =>
			useTableSelection(q, tables, open, initial),
		{
			initialProps: {
				q: queryText,
				tables: availableTableNames,
				open: isOpen,
				initial: initialTables,
			},
		}
	);
}

describe("useTableSelection — initialTables (edit mode) path", () => {
	it("preselects initialTables exactly even when those tables are NOT in availableTableNames", () => {
		const queryText = "SELECT * FROM custom_collection WHERE id = 1";
		const { result } = setup(
			queryText,
			[],
			true,
			["custom_collection", "legacy_table"]
		);

		expect(result.current.selectedTables).toEqual([
			"custom_collection",
			"legacy_table",
		]);
	});

	it("computes highlightedWords against initialTables using 3-char prefix match", () => {
		const queryText = "SELECT * FROM cus leg nothing";
		const { result } = setup(queryText, [], true, [
			"custom_collection",
			"legacy_table",
		]);

		// "cus" → matches custom_collection, "leg" → matches legacy_table,
		// "nothing" → "not" matches neither.
		expect(result.current.highlightedWords).toEqual(["cus", "leg"]);
	});

	it("still allows adding a table that exists only in availableTableNames", () => {
		const queryText = "SELECT * FROM users";
		const { result } = setup(queryText, ["users", "orders"], true, [
			"legacy_table",
		]);

		act(() => {
			result.current.addTable("users");
		});

		expect(result.current.selectedTables).toEqual([
			"legacy_table",
			"users",
		]);
	});

	it("still allows removing a pre-selected initialTable", () => {
		const queryText = "SELECT * FROM legacy_table";
		const { result } = setup(queryText, ["users"], true, [
			"legacy_table",
			"users",
		]);

		act(() => {
			result.current.removeTable("users");
		});

		expect(result.current.selectedTables).toEqual(["legacy_table"]);
	});
});

describe("useTableSelection — autoSelect (create mode) path", () => {
	it("keeps autoSelectTables behavior when initialTables is not provided", () => {
		const queryText = "SELECT * FROM users orders WHERE id";
		const { result } = setup(queryText, ["users", "orders", "products"], true);

		expect(result.current.selectedTables).toEqual(["users", "orders"]);
		expect(result.current.highlightedWords).toEqual(["users", "orders"]);
	});

	it("handles empty queryText without auto-selecting anything", () => {
		const { result } = setup("", ["users", "orders"], true);

		expect(result.current.selectedTables).toEqual([]);
		expect(result.current.highlightedWords).toEqual([]);
	});

	it("matches by 3-char prefix, not exact match", () => {
		const queryText = "USE ORD";
		const { result } = setup(queryText, ["users", "orders"], true);

		expect(result.current.selectedTables).toEqual(["users", "orders"]);
	});
});

describe("useTableSelection — open/close lifecycle", () => {
	it("does not pre-select when the modal is closed", () => {
		const queryText = "SELECT * FROM users";
		const { result } = setup(queryText, ["users", "orders"], false, [
			"legacy_table",
		]);

		expect(result.current.selectedTables).toEqual([]);
	});

	it("pre-selects initialTables when the modal opens (isOpen flips to true)", () => {
		const queryText = "SELECT * FROM users";
		const utils = setup(queryText, ["users"], false, ["legacy_table"]);
		expect(utils.result.current.selectedTables).toEqual([]);

		act(() => {
			utils.rerender({
				q: queryText,
				tables: ["users"],
				open: true,
				initial: ["legacy_table"],
			});
		});

		expect(utils.result.current.selectedTables).toEqual(["legacy_table"]);
	});

	it("does not pre-select when queryText is empty/whitespace even if initialTables present", () => {
		const { result } = setup("   ", ["users"], true, ["legacy_table"]);

		expect(result.current.selectedTables).toEqual([]);
		expect(result.current.highlightedWords).toEqual([]);
	});
});

describe("useTableSelection — clearSelection and validateSelection", () => {
	it("clearSelection resets selection and highlights", () => {
		const queryText = "SELECT * FROM users";
		const { result } = setup(queryText, [], true, ["legacy_table", "users"]);

		act(() => {
			result.current.clearSelection();
		});

		expect(result.current.selectedTables).toEqual([]);
		expect(result.current.highlightedWords).toEqual([]);
	});

	it("validateSelection returns false and sets error when nothing selected", () => {
		const queryText = "SELECT * FROM users";
		const { result } = setup(queryText, [], false);

		let valid: boolean | undefined;
		act(() => {
			valid = result.current.validateSelection();
		});

		expect(valid).toBe(false);
		expect(result.current.error).toBe(true);
	});

	it("validateSelection returns true when a table is selected", () => {
		const queryText = "SELECT * FROM users";
		const { result } = setup(queryText, [], true, ["legacy_table"]);

		let valid: boolean | undefined;
		act(() => {
			valid = result.current.validateSelection();
		});

		expect(valid).toBe(true);
		expect(result.current.error).toBe(false);
	});
});
