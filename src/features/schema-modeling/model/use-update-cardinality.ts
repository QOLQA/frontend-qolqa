import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { updateTableInTree } from "@fsd/entities/table/lib";
import type { CardinalityType, TableData } from "@fsd/entities/solution";
import { findRootNodeByTableId } from "./find-root-node";

interface UseUpdateCardinalityParams {
	nodes: Node<TableData>[];
	editNode: (nodeId: string, newNode: Node<TableData>) => void;
}

export const useUpdateCardinality = ({
	nodes,
	editNode,
}: UseUpdateCardinalityParams) => {
	return useCallback(
		(tableId: string, newCardinality: CardinalityType) => {
			const rootNode = findRootNodeByTableId(nodes, tableId);
			if (!rootNode) return;

			editNode(rootNode.id, {
				...rootNode,
				data: updateTableInTree(rootNode.data, tableId, (table) => ({
					...table,
					cardinality: newCardinality,
				})),
			});
		},
		[nodes, editNode],
	);
};
