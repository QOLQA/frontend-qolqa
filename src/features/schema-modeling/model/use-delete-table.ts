import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { removeTableFromTree } from "@fsd/entities/table/lib";
import type { TableData } from "@fsd/entities/solution";
import { findRootNodeByTableId } from "./find-root-node";

interface UseDeleteTableParams {
	nodes: Node<TableData>[];
	editNode: (nodeId: string, newNode: Node<TableData>) => void;
	removeNode: (nodeId: string) => void;
	handleNodeRemove: (nodeId: string, currentNodes: Node<TableData>[]) => void;
}

export const useDeleteTable = ({
	nodes,
	editNode,
	removeNode,
	handleNodeRemove,
}: UseDeleteTableParams) => {
	const handleDeleteTable = useCallback(
		(tableId: string) => {
			const rootNode = findRootNodeByTableId(nodes, tableId);
			if (!rootNode) return;

			if (rootNode.id === tableId) {
				removeNode(tableId);
				handleNodeRemove(tableId, nodes);
				return;
			}

			editNode(rootNode.id, {
				...rootNode,
				data: removeTableFromTree(rootNode.data, tableId),
			});
			handleNodeRemove(tableId, nodes);
		},
		[nodes, editNode, removeNode, handleNodeRemove],
	);

	return { handleDeleteTable };
};
