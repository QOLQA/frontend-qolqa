import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import { useDeleteAttribute } from "./use-delete-attribute";

function buildNode(
	id: string,
	columns: TableData["columns"],
	nestedTables?: TableData[],
): Node<TableData> {
	return {
		id,
		type: "table",
		position: { x: 0, y: 0 },
		data: { id, label: id, columns, nestedTables },
	};
}

const ROOT_ID = "node1111";

function buildNodes() {
	return [
		buildNode(
			ROOT_ID,
			[
				{ id: `${ROOT_ID}-aaaaaaaa`, name: "orders_id", type: "PRIMARY_KEY" },
				{
					// FK columns use the synthetic edge id, whose dashes are not ancestors
					id: `e-${ROOT_ID}-node2222`,
					name: "customers_id",
					type: "FOREIGN_KEY",
				},
			],
			[
				{
					id: `${ROOT_ID}-nested999`,
					label: "items",
					columns: [
						{
							id: `${ROOT_ID}-nested999-col00001`,
							name: "qty",
							type: "NUMBER",
						},
					],
					nestedTables: [],
				},
			],
		),
	];
}

describe("useDeleteAttribute", () => {
	const editNode = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	function act() {
		const { result } = renderHook(() =>
			useDeleteAttribute({ nodes: buildNodes(), editNode }),
		);
		return result.current;
	}

	it("deletes a root-level FK column whose id contains non-ancestor dashes", () => {
		const handleDeleteAttribute = act();

		handleDeleteAttribute(`e-${ROOT_ID}-node2222`);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		const remainingIds = (updatedNode.data as TableData).columns.map(
			(column) => column.id,
		);
		expect(remainingIds).toEqual([`${ROOT_ID}-aaaaaaaa`]);
	});

	it("deletes a regular root-level column", () => {
		const handleDeleteAttribute = act();

		handleDeleteAttribute(`${ROOT_ID}-aaaaaaaa`);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [, updatedNode] = editNode.mock.calls[0];
		const remainingIds = (updatedNode.data as TableData).columns.map(
			(column) => column.id,
		);
		expect(remainingIds).toEqual([`e-${ROOT_ID}-node2222`]);
	});

	it("deletes a nested column without touching root columns", () => {
		const handleDeleteAttribute = act();

		handleDeleteAttribute(`${ROOT_ID}-nested999-col00001`);

		expect(editNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = editNode.mock.calls[0];
		expect(calledNodeId).toBe(ROOT_ID);
		const data = updatedNode.data as TableData;
		expect(data.columns).toHaveLength(2);
		expect(data.nestedTables?.[0]?.columns).toHaveLength(0);
	});

	it("does nothing when the column does not exist", () => {
		const handleDeleteAttribute = act();

		handleDeleteAttribute("missing");

		expect(editNode).not.toHaveBeenCalled();
	});
});
