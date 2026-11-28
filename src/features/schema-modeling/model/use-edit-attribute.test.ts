import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import { useEditAttribute } from "./use-edit-attribute";
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
					{
						id: `e-${ROOT_ID}-node2222`,
						name: "customers_id",
						type: "FOREIGN_KEY",
					},
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

describe("useEditAttribute", () => {
	const openUpdateAttributesModal = vi.fn();

	function act() {
		const { result } = renderHook(() =>
			useEditAttribute({ nodeId: ROOT_ID, nodes: buildNodes(), openUpdateAttributesModal }),
		);
		return result.current;
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("opens the modal with the root table id and marks only the selected column editable", () => {
		const handleEditAttribute = act();

		handleEditAttribute({ id: `${ROOT_ID}-aaaaaaaa`, name: "orders_id", type: "PRIMARY_KEY" });

		expect(openUpdateAttributesModal).toHaveBeenCalledTimes(1);
		const [tableId, attributes] = openUpdateAttributesModal.mock.calls[0] as [
			string,
			TableAttribute[],
		];
		expect(tableId).toBe(ROOT_ID);
		expect(attributes).toHaveLength(2);
		expect(attributes.find((a) => a.id === `${ROOT_ID}-aaaaaaaa`)?.ableToEdit).toBe(true);
		expect(attributes.find((a) => a.id === `e-${ROOT_ID}-node2222`)?.ableToEdit).toBe(false);
	});

	it("opens the modal with the owning nested table id for a nested column", () => {
		const handleEditAttribute = act();

		handleEditAttribute({ id: `${NESTED_ID}-col00001`, name: "qty", type: "NUMBER" });

		const [tableId, attributes] = openUpdateAttributesModal.mock.calls[0] as [
			string,
			TableAttribute[],
		];
		expect(tableId).toBe(NESTED_ID);
		expect(attributes).toHaveLength(1);
		expect(attributes[0]?.ableToEdit).toBe(true);
	});

	it("opens the modal with the root table id for an FK column with non-ancestor dashes", () => {
		const handleEditAttribute = act();

		handleEditAttribute({ id: `e-${ROOT_ID}-node2222`, name: "customers_id", type: "FOREIGN_KEY" });

		expect(openUpdateAttributesModal).toHaveBeenCalledTimes(1);
		const [tableId, attributes] = openUpdateAttributesModal.mock.calls[0] as [
			string,
			TableAttribute[],
		];
		expect(tableId).toBe(ROOT_ID);
		expect(attributes.find((a) => a.id === `e-${ROOT_ID}-node2222`)?.ableToEdit).toBe(true);
	});

	it("does nothing when the column does not exist", () => {
		const handleEditAttribute = act();

		handleEditAttribute({ id: "missing", name: "x", type: "TEXT" });

		expect(openUpdateAttributesModal).not.toHaveBeenCalled();
	});
});
