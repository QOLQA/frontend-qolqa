import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { removeColumnFromTree } from "@fsd/entities/table/lib";
import type { TableData } from "@fsd/entities/solution";
import { findRootNodeByColumnId } from "./find-root-node";

interface UseDeleteAttributeParams {
	nodes: Node<TableData>[];
	editNode: (nodeId: string, newNode: Node<TableData>) => void;
}

export const useDeleteAttribute = ({
	nodes,
	editNode,
}: UseDeleteAttributeParams) => {
	return useCallback(
		(columnId: string) => {
			const rootNode = findRootNodeByColumnId(nodes, columnId);
			if (!rootNode) return;

			editNode(rootNode.id, {
				...rootNode,
				data: removeColumnFromTree(rootNode.data, columnId),
			});
		},
		[nodes, editNode],
	);
};
