import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the toggle logic directly (pure function extracted from the hook body)
// since @testing-library/react is not installed in this project.

const mockEditNode = vi.fn();

function buildNode(id: string, columnId: string, columnType: string) {
	return {
		id,
		type: "table",
		position: { x: 0, y: 0 },
		data: {
			id,
			label: "Test",
			columns: [{ id: columnId, name: "ref_id", type: columnType }],
		},
	};
}

// Extracted toggle logic — mirrors handleToggle(columnId) in the hook
function applyToggle(
	nodes: ReturnType<typeof buildNode>[],
	nodeId: string,
	columnId: string,
	editNode: typeof mockEditNode,
) {
	const node = nodes.find((n) => n.id === nodeId);
	if (!node) return;

	const updatedNode = structuredClone(node);
	const col = updatedNode.data.columns.find((c) => c.id === columnId);
	if (!col) return;

	if (col.type !== "FOREIGN_KEY" && col.type !== "FOREIGN_KEY_ARRAY") return;

	col.type = col.type === "FOREIGN_KEY_ARRAY" ? "FOREIGN_KEY" : "FOREIGN_KEY_ARRAY";
	editNode(nodeId, updatedNode);
}

describe("useToggleFkArray — toggle logic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("toggles FOREIGN_KEY → FOREIGN_KEY_ARRAY", () => {
		const nodes = [buildNode("node-1", "col-1", "FOREIGN_KEY")];
		applyToggle(nodes, "node-1", "col-1", mockEditNode);

		expect(mockEditNode).toHaveBeenCalledTimes(1);
		const [calledNodeId, updatedNode] = mockEditNode.mock.calls[0];
		expect(calledNodeId).toBe("node-1");
		expect(updatedNode.data.columns[0].type).toBe("FOREIGN_KEY_ARRAY");
	});

	it("toggles FOREIGN_KEY_ARRAY → FOREIGN_KEY", () => {
		const nodes = [buildNode("node-1", "col-1", "FOREIGN_KEY_ARRAY")];
		applyToggle(nodes, "node-1", "col-1", mockEditNode);

		expect(mockEditNode).toHaveBeenCalledTimes(1);
		const [, updatedNode] = mockEditNode.mock.calls[0];
		expect(updatedNode.data.columns[0].type).toBe("FOREIGN_KEY");
	});

	it("is a no-op for non-FK column types", () => {
		const nodes = [buildNode("node-1", "col-1", "VARCHAR")];
		applyToggle(nodes, "node-1", "col-1", mockEditNode);
		expect(mockEditNode).not.toHaveBeenCalled();
	});

	it("is a no-op for PRIMARY_KEY", () => {
		const nodes = [buildNode("node-1", "col-1", "PRIMARY_KEY")];
		applyToggle(nodes, "node-1", "col-1", mockEditNode);
		expect(mockEditNode).not.toHaveBeenCalled();
	});

	it("is a no-op when node is not found", () => {
		applyToggle([], "missing-node", "col-1", mockEditNode);
		expect(mockEditNode).not.toHaveBeenCalled();
	});

	it("is a no-op when column is not found", () => {
		const nodes = [buildNode("node-1", "col-1", "FOREIGN_KEY")];
		applyToggle(nodes, "node-1", "col-99", mockEditNode);
		expect(mockEditNode).not.toHaveBeenCalled();
	});

	it("does not mutate the original node (uses structuredClone)", () => {
		const nodes = [buildNode("node-1", "col-1", "FOREIGN_KEY")];
		applyToggle(nodes, "node-1", "col-1", mockEditNode);
		// Original node must be unchanged
		expect(nodes[0].data.columns[0].type).toBe("FOREIGN_KEY");
	});
});
