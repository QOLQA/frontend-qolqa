import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { CardinalityType, TableData } from "@fsd/entities/solution";
import { useUpdateCardinality } from "./use-update-cardinality";

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
						cardinality: "1 ... n",
						nestedTables: [],
					},
				],
			},
		},
	];
}

describe("useUpdateCardinality", () => {
	const editNode = vi.fn();

	function act() {
		const { result } = renderHook(() =>
			useUpdateCardinality({ nodes: buildNodes(), editNode }),
		);
		return result.current;
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updates the cardinality of the nested table through its root node", () => {
		const handleUpdateCardinality = act();

		handleUpdateCardinality(NESTED_ID, "1 ... 1" as CardinalityType);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		expect(
			(updatedNode.data as TableData).nestedTables?.[0]?.cardinality,
		).toBe("1 ... 1");
	});

	it("does nothing when the table does not exist", () => {
		const handleUpdateCardinality = act();

		handleUpdateCardinality("missing", "1 ... 1" as CardinalityType);

		expect(editNode).not.toHaveBeenCalled();
	});
});
