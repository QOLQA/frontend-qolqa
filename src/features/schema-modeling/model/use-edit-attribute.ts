import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { findTableWithColumn } from "@fsd/entities/table/lib";
import type { Column, TableData } from "@fsd/entities/solution";
import type { TableAttribute } from "./use-attribute-modal";

interface UseEditAttributeParams {
	nodeId: string;
	nodes: Node<TableData>[];
	openUpdateAttributesModal: (
		tableId: string,
		attributes: TableAttribute[],
	) => void;
}

export const useEditAttribute = ({
	nodeId,
	nodes,
	openUpdateAttributesModal,
}: UseEditAttributeParams) => {
	return useCallback(
		(selectedColumn: Column) => {
			const node = nodes?.find((n: Node<TableData>) => n.id === nodeId);
			const table = node && findTableWithColumn(node.data, selectedColumn.id);
			if (!table) return;

			const columns = table.columns.map((column: Column) => ({
				...column,
				ableToEdit: column.id === selectedColumn.id,
			}));

			openUpdateAttributesModal(table.id, columns);
		},
		[nodes, nodeId, openUpdateAttributesModal],
	);
};
