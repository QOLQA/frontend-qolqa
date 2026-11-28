import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import { useDeleteTable } from "./use-delete-table";

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
							{
								id: `${NESTED_ID}-col00001`,
								name: "qty",
								type: "NUMBER",
							},
						],
						nestedTables: [],
					},
				],
			},
		},
	];
}

describe("useDeleteTable", () => {
	const editNode = vi.fn();
	const removeNode = vi.fn();
	const handleNodeRemove = vi.fn();

	function act() {
		const { result } = renderHook(() =>
			useDeleteTable({
				nodes: buildNodes(),
				editNode,
				removeNode,
				handleNodeRemove,
			}),
		);
		return result.current.handleDeleteTable;
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes a root table through removeNode", () => {
		const handleDeleteTable = act();

		handleDeleteTable(ROOT_ID);

		expect(removeNode).toHaveBeenCalledWith(ROOT_ID);
		expect(editNode).not.toHaveBeenCalled();
		expect(handleNodeRemove).toHaveBeenCalledWith(ROOT_ID, buildNodes());
	});

	it("removes a nested table by editing its root node", () => {
		const handleDeleteTable = act();

		handleDeleteTable(NESTED_ID);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		expect((updatedNode.data as TableData).nestedTables).toHaveLength(0);
		expect(handleNodeRemove).toHaveBeenCalledWith(NESTED_ID, buildNodes());
	});

	it("does nothing when the table does not exist", () => {
		const handleDeleteTable = act();

		handleDeleteTable("missing");

		expect(editNode).not.toHaveBeenCalled();
		expect(removeNode).not.toHaveBeenCalled();
		expect(handleNodeRemove).not.toHaveBeenCalled();
	});
});
