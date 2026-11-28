import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import type { Column, TableData } from "@fsd/entities/solution";
import { addAttributeToNestedTables } from "@fsd/entities/table/lib";
import { generateRandomId } from "@fsd/shared/lib/ids";
import type { AttributeModalType, TableAttribute } from "./use-attribute-modal";

interface UseAddAttributeParams {
	nodeId: string;
	targetTableId: string | null;
	nodes: Node<TableData>[];
	editNode: (nodeId: string, newNode: Node<TableData>) => void;
}

export const useAddAttribute = ({
	nodeId,
	targetTableId,
	nodes,
	editNode,
}: UseAddAttributeParams) => {
	return useCallback(
		(newAtributes: TableAttribute[], typeModal: AttributeModalType) => {
			if (!targetTableId) return;

			const node = nodes.find((candidate: Node<TableData>) => {
				return candidate.id === nodeId;
			});
			if (!node) return;

			const newAtributesWithId =
				typeModal === "create"
					? newAtributes.map((atribute) => ({
							id: `${targetTableId}-${generateRandomId()}`,
							name: atribute.name,
							type: atribute.type,
							ableToEdit: atribute.ableToEdit,
						}))
					: newAtributes;

			const tableData = node.data;

			let updatedData: TableData;
			if (tableData.id === targetTableId) {
				updatedData = {
					...tableData,
					columns:
						typeModal === "create"
							? [...tableData.columns, ...newAtributesWithId]
							: newAtributesWithId,
				};
			} else {
				updatedData = {
					...tableData,
					nestedTables: addAttributeToNestedTables(
						tableData.nestedTables ?? [],
						targetTableId,
						newAtributesWithId as Column[],
						typeModal,
					),
				};
			}

			editNode(nodeId, { ...node, data: updatedData });
		},
		[nodeId, targetTableId, nodes, editNode],
	);
};
