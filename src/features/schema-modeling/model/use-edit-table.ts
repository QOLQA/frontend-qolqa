import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { findTableInTree } from "@fsd/entities/table/lib";
import type { Column, TableData } from "@fsd/entities/solution";
import type { TableAttribute } from "./use-attribute-modal";

interface UseEditTableParams {
	nodeId: string;
	nodes: Node<TableData>[];
	openUpdateAttributesModal: (
		tableId: string,
		attributes: TableAttribute[],
	) => void;
}

export const useEditTable = ({
	nodeId,
	nodes,
	openUpdateAttributesModal,
}: UseEditTableParams) => {
	return useCallback(
		(tableId: string) => {
			const node = nodes?.find((n: Node<TableData>) => n.id === nodeId);
			const table = node && findTableInTree(node.data, tableId);
			if (!table) return;

			const columns = table.columns.map((column: Column) => ({
				...column,
				ableToEdit:
					column.type !== "PRIMARY_KEY" &&
					column.type !== "FOREIGN_KEY" &&
					column.type !== "DOCUMENT",
			}));

			openUpdateAttributesModal(tableId, columns);
		},
		[nodeId, nodes, openUpdateAttributesModal],
	);
};
