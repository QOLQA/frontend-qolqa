import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import {
	addNestedTableRecursively,
	createNestedTable,
} from "@fsd/entities/table/lib";

interface UseAddNestedTableParams {
	nodeId: string;
	submodelIndex?: number;
	targetTableId: string | null;
	nodes: Node<TableData>[];
	editNode: (nodeId: string, newNode: Node<TableData>) => void;
}

export const useAddNestedTable = ({
	nodeId,
	submodelIndex,
	targetTableId,
	nodes,
	editNode,
}: UseAddNestedTableParams) => {
	return useCallback(
		(tableName: string) => {
			if (!targetTableId) return;

			const node = nodes.find((candidate: Node<TableData>) => {
				return candidate.id === nodeId;
			});
			if (!node) return;

			const newNestedTable = createNestedTable(
				targetTableId,
				tableName,
				submodelIndex,
			);

			const tableData = node.data;

			let updatedData: TableData;
			if (tableData.id === targetTableId) {
				updatedData = {
					...tableData,
					nestedTables: [...(tableData.nestedTables ?? []), newNestedTable],
				};
			} else {
				updatedData = {
					...tableData,
					nestedTables: addNestedTableRecursively(
						tableData.nestedTables ?? [],
						targetTableId,
						newNestedTable,
					),
				};
			}

			editNode(nodeId, { ...node, data: updatedData });
		},
		[nodeId, submodelIndex, targetTableId, nodes, editNode],
	);
};
