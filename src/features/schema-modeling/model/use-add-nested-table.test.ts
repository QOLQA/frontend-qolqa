import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import { useAddNestedTable } from "./use-add-nested-table";

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
						columns: [],
						nestedTables: [],
					},
				],
			},
		},
	];
}

describe("useAddNestedTable", () => {
	const editNode = vi.fn();

	function act(targetTableId: string | null, nodes = buildNodes()) {
		const { result } = renderHook(() =>
			useAddNestedTable({
				nodeId: ROOT_ID,
				submodelIndex: 0,
				targetTableId,
				nodes,
				editNode,
			}),
		);
		return result.current;
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("appends a nested table to the root target through editNode", () => {
		const handleAddNestedTable = act(ROOT_ID);

		handleAddNestedTable("reviews");

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		const nested = (updatedNode.data as TableData).nestedTables?.[1];
		expect(nested?.label).toBe("reviews");
		expect(nested?.id).toMatch(new RegExp(`^${ROOT_ID}-`));
		expect(nested?.columns[0]?.name).toBe("reviews_id");
		expect(nested?.columns[0]?.type).toBe("PRIMARY_KEY");
	});

	it("appends a nested table to a nested target", () => {
		const handleAddNestedTable = act(NESTED_ID);

		handleAddNestedTable("discounts");

		const [, updatedNode] = editNode.mock.calls[0];
		const nested = (updatedNode.data as TableData).nestedTables?.[0];
		expect(nested?.nestedTables?.[0]?.label).toBe("discounts");
	});

	it("does nothing when targetTableId is null", () => {
		const handleAddNestedTable = act(null);

		handleAddNestedTable("reviews");

		expect(editNode).not.toHaveBeenCalled();
	});

	it("does nothing when the node does not exist", () => {
		const handleAddNestedTable = act(NESTED_ID, []);

		handleAddNestedTable("reviews");

		expect(editNode).not.toHaveBeenCalled();
	});
});
