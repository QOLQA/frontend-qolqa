import type { Node } from "@xyflow/react";
import { findTableInTree, findTableWithColumn } from "@fsd/entities/table/lib";
import type { TableData } from "@fsd/entities/solution";

/**
 * Finds the root node that owns a given table or column, without parsing
 * dash-separated ancestor paths: the id can live anywhere in the nested
 * tree, so every root node's tree is searched by opaque id.
 */

export const findRootNodeByTableId = (
	nodes: Node<TableData>[],
	tableId: string,
): Node<TableData> | undefined =>
	nodes.find(
		(node) =>
			node.id === tableId || findTableInTree(node.data, tableId) !== undefined,
	);

export const findRootNodeByColumnId = (
	nodes: Node<TableData>[],
	columnId: string,
): Node<TableData> | undefined =>
	nodes.find(
		(node) => findTableWithColumn(node.data, columnId) !== undefined,
	);
