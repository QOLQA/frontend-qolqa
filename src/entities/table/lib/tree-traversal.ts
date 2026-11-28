import type { TableData } from "@fsd/entities/solution";

/**
 * Pure traversal helpers over the nested table tree.
 *
 * These functions never parse ids as dash-separated ancestor paths and never
 * mutate their inputs: they locate tables and columns by their opaque unique
 * id, so ids with arbitrary formats (e.g. the synthetic FK column id
 * `e-<source>-<target>`) are handled like any other.
 */

/** Finds a table by id anywhere in the tree, including the root itself. */
export const findTableInTree = (
	tree: TableData,
	tableId: string,
): TableData | undefined => {
	if (tree.id === tableId) return tree;
	for (const nested of tree.nestedTables ?? []) {
		const found = findTableInTree(nested, tableId);
		if (found) return found;
	}
	return undefined;
};

/** Finds the table (root or nested) that owns the given column id. */
export const findTableWithColumn = (
	tree: TableData,
	columnId: string,
): TableData | undefined => {
	if (tree.columns.some((column) => column.id === columnId)) return tree;
	for (const nested of tree.nestedTables ?? []) {
		const found = findTableWithColumn(nested, columnId);
		if (found) return found;
	}
	return undefined;
};

/** Returns a new tree with the column removed from whichever table owns it. */
export const removeColumnFromTree = (
	tree: TableData,
	columnId: string,
): TableData => ({
	...tree,
	columns: tree.columns.filter((column) => column.id !== columnId),
	nestedTables: tree.nestedTables?.map((nested) =>
		removeColumnFromTree(nested, columnId),
	),
});

/** Returns a new tree with the nested table of the given id removed. */
export const removeTableFromTree = (
	tree: TableData,
	tableId: string,
): TableData => ({
	...tree,
	nestedTables: tree.nestedTables
		?.filter((nested) => nested.id !== tableId)
		.map((nested) => removeTableFromTree(nested, tableId)),
});

/** Returns a new tree with the updater applied to the matching table. */
export const updateTableInTree = (
	tree: TableData,
	tableId: string,
	updater: (table: TableData) => TableData,
): TableData => {
	if (tree.id === tableId) return updater(tree);
	return {
		...tree,
		nestedTables: tree.nestedTables?.map((nested) =>
			updateTableInTree(nested, tableId, updater),
		),
	};
};
