import { useShallow } from "zustand/react/shallow";
import type { Node } from "@xyflow/react";
import { useSolutionStore } from "@fsd/entities/solution";
import type { TableData } from "@fsd/entities/solution";

export const useToggleFkArray = (nodeId: string) => {
	const { nodes, editNode } = useSolutionStore(
		useShallow((state) => ({
			nodes: state.nodes,
			editNode: state.editNode,
		})),
	);

	const handleToggle = (columnId: string) => {
		const node = nodes.find((n) => n.id === nodeId) as
			| Node<TableData>
			| undefined;
		if (!node) return;

		const updatedNode = structuredClone(node);
		const col = updatedNode.data.columns.find((c) => c.id === columnId);
		if (!col) return;

		if (col.type !== "FOREIGN_KEY" && col.type !== "FOREIGN_KEY_ARRAY") return;

		col.type =
			col.type === "FOREIGN_KEY_ARRAY" ? "FOREIGN_KEY" : "FOREIGN_KEY_ARRAY";

		editNode(nodeId, updatedNode);
	};

	return { handleToggle };
};
