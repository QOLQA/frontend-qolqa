import { describe, it, expect } from "vitest";
import type { TableData } from "@fsd/entities/solution";
import {
	findTableInTree,
	findTableWithColumn,
	removeColumnFromTree,
	removeTableFromTree,
	updateTableInTree,
} from "./tree-traversal";

function buildTree(): TableData {
	return {
		id: "root00000",
		label: "orders",
		columns: [
			{ id: "root00000-pk000001", name: "orders_id", type: "PRIMARY_KEY" },
			{
				// Synthetic FK id: dashes are not ancestors.
				id: "e-root00000-cust0001",
				name: "customers_id",
				type: "FOREIGN_KEY",
			},
		],
		nestedTables: [
			{
				id: "root00000-nested001",
				label: "items",
				columns: [
					{
						id: "root00000-nested001-col0001",
						name: "qty",
						type: "NUMBER",
					},
				],
				nestedTables: [
					{
						id: "root00000-nested001-deep001",
						label: "discounts",
						columns: [
							{
								id: "root00000-nested001-deep001-col001",
								name: "pct",
								type: "NUMBER",
							},
						],
					},
				],
			},
		],
	};
}

describe("findTableInTree", () => {
	it("finds the root table by its own id", () => {
		expect(findTableInTree(buildTree(), "root00000")?.label).toBe("orders");
	});

	it("finds a nested table at any depth", () => {
		expect(
			findTableInTree(buildTree(), "root00000-nested001-deep001")?.label,
		).toBe("discounts");
	});

	it("returns undefined for a missing id", () => {
		expect(findTableInTree(buildTree(), "missing")).toBeUndefined();
	});
});

describe("findTableWithColumn", () => {
	it("finds the root table for a root column", () => {
		expect(
			findTableWithColumn(buildTree(), "root00000-pk000001")?.id,
		).toBe("root00000");
	});

	it("finds the owning table for a deep nested column", () => {
		expect(
			findTableWithColumn(
				buildTree(),
				"root00000-nested001-deep001-col001",
			)?.id,
		).toBe("root00000-nested001-deep001");
	});

	it("finds the root table for an FK column with non-ancestor dashes", () => {
		expect(
			findTableWithColumn(buildTree(), "e-root00000-cust0001")?.id,
		).toBe("root00000");
	});

	it("returns undefined for a missing column", () => {
		expect(findTableWithColumn(buildTree(), "missing")).toBeUndefined();
	});
});

describe("removeColumnFromTree", () => {
	it("removes a root-level FK column with non-ancestor dashes", () => {
		const tree = buildTree();
		const result = removeColumnFromTree(tree, "e-root00000-cust0001");

		expect(result.columns.map((column) => column.id)).toEqual([
			"root00000-pk000001",
		]);
	});

	it("removes a deep nested column and leaves other tables untouched", () => {
		const result = removeColumnFromTree(
			buildTree(),
			"root00000-nested001-deep001-col001",
		);

		expect(result.columns).toHaveLength(2);
		expect(result.nestedTables?.[0]?.columns).toHaveLength(1);
		expect(
			result.nestedTables?.[0]?.nestedTables?.[0]?.columns,
		).toHaveLength(0);
	});

	it("does not mutate the input tree", () => {
		const tree = buildTree();
		const treeBefore = JSON.stringify(tree);
		removeColumnFromTree(tree, "root00000-pk000001");

		expect(JSON.stringify(tree)).toBe(treeBefore);
	});

	it("keeps the tree intact for a missing column", () => {
		const result = removeColumnFromTree(buildTree(), "missing");

		expect(result.columns).toHaveLength(2);
	});
});

describe("removeTableFromTree", () => {
	it("removes a nested table and its subtree", () => {
		const result = removeTableFromTree(
			buildTree(),
			"root00000-nested001",
		);

		expect(result.nestedTables).toHaveLength(0);
		expect(result.columns).toHaveLength(2);
	});

	it("removes a deeply nested table without touching siblings", () => {
		const result = removeTableFromTree(
			buildTree(),
			"root00000-nested001-deep001",
		);

		expect(result.nestedTables?.[0]?.id).toBe("root00000-nested001");
		expect(result.nestedTables?.[0]?.nestedTables).toHaveLength(0);
	});

	it("does not remove the root table", () => {
		const result = removeTableFromTree(buildTree(), "root00000");

		expect(result.id).toBe("root00000");
		expect(result.columns).toHaveLength(2);
	});

	it("does not mutate the input tree", () => {
		const tree = buildTree();
		const treeBefore = JSON.stringify(tree);
		removeTableFromTree(tree, "root00000-nested001");

		expect(JSON.stringify(tree)).toBe(treeBefore);
	});
});

describe("updateTableInTree", () => {
	it("updates the root table", () => {
		const result = updateTableInTree(
			buildTree(),
			"root00000",
			(table) => ({ ...table, label: "renamed" }),
		);

		expect(result.label).toBe("renamed");
	});

	it("updates a deeply nested table only", () => {
		const result = updateTableInTree(
			buildTree(),
			"root00000-nested001-deep001",
			(table) => ({ ...table, cardinality: "1 ... 1" }),
		);

		expect(
			result.nestedTables?.[0]?.nestedTables?.[0]?.cardinality,
		).toBe("1 ... 1");
		expect(result.cardinality).toBeUndefined();
		expect(result.nestedTables?.[0]?.cardinality).toBeUndefined();
	});

	it("does not mutate the input tree", () => {
		const tree = buildTree();
		const treeBefore = JSON.stringify(tree);
		updateTableInTree(
			tree,
			"root00000-nested001",
			(table) => ({ ...table, label: "renamed" }),
		);

		expect(JSON.stringify(tree)).toBe(treeBefore);
	});
});
