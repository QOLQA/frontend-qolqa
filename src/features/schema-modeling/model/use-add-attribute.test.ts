import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import { useAddAttribute } from "./use-add-attribute";
import type { TableAttribute } from "./use-attribute-modal";

const ROOT_ID = "node1111";
const NESTED_ID = `${ROOT_ID}-nested999`;

function buildNodes(): Node<TableData>[] {
	return [
		{
			id: ROOT_ID,
			type: "table",
			position: { x: 0, y: 0 },
			data: {
				id: ROOT_ID,
				label: "orders",
				columns: [
					{ id: `${ROOT_ID}-aaaaaaaa`, name: "orders_id", type: "PRIMARY_KEY" },
				],
				nestedTables: [
					{
						id: NESTED_ID,
						label: "items",
						columns: [
							{ id: `${NESTED_ID}-col00001`, name: "qty", type: "NUMBER" },
						],
						nestedTables: [],
					},
				],
			},
		},
	];
}

describe("useAddAttribute", () => {
	const editNode = vi.fn();

	function act(targetTableId: string | null, nodes = buildNodes()) {
		const { result } = renderHook(() =>
			useAddAttribute({ nodeId: ROOT_ID, targetTableId, nodes, editNode }),
		);
		return result.current;
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("appends a created attribute to the root table through editNode", () => {
		const handleAddAtribute = act(ROOT_ID);

		handleAddAtribute(
			[{ id: "", name: "status", type: "TEXT", ableToEdit: true }],
			"create",
		);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		const columns = (updatedNode.data as TableData).columns;
		expect(columns).toHaveLength(2);
		expect(columns[1]?.name).toBe("status");
		expect(columns[1]?.id).toMatch(new RegExp(`^${ROOT_ID}-`));
	});

	it("appends a created attribute to a nested table", () => {
		const handleAddAtribute = act(NESTED_ID);

		handleAddAtribute(
			[{ id: "", name: "discount", type: "NUMBER", ableToEdit: true }],
			"create",
		);

		const [, updatedNode] = editNode.mock.calls[0];
		const nested = (updatedNode.data as TableData).nestedTables?.[0];
		expect(nested?.columns).toHaveLength(2);
		expect(nested?.columns?.[1]?.name).toBe("discount");
		expect(nested?.columns?.[1]?.id).toMatch(
			new RegExp(`^${NESTED_ID}-`),
		);
	});

	it("replaces the columns of the target table in update mode", () => {
		const handleAddAtribute = act(ROOT_ID);

		handleAddAtribute(
			[
				{ id: `${ROOT_ID}-aaaaaaaa`, name: "orders_id", type: "PRIMARY_KEY", ableToEdit: false },
				{ id: `${ROOT_ID}-bbbbbbbb`, name: "status", type: "TEXT", ableToEdit: true },
			],
			"update",
		);

		const [, updatedNode] = editNode.mock.calls[0];
		const columns = (updatedNode.data as TableData).columns;
		expect(columns.map((column) => column.id)).toEqual([
			`${ROOT_ID}-aaaaaaaa`,
			`${ROOT_ID}-bbbbbbbb`,
		]);
	});

	it("does nothing when targetTableId is null", () => {
		const handleAddAtribute = act(null);

		handleAddAtribute(
			[{ id: "", name: "status", type: "TEXT", ableToEdit: true }],
			"create",
		);

		expect(editNode).not.toHaveBeenCalled();
	});

	it("does nothing when the node does not exist", () => {
		const handleAddAtribute = act(ROOT_ID, []);

		handleAddAtribute(
			[{ id: "", name: "status", type: "TEXT", ableToEdit: true }],
			"create",
		);

		expect(editNode).not.toHaveBeenCalled();
	});
});
