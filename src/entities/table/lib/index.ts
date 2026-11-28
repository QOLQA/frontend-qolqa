export {
	addAttributeToNestedTables,
	addNestedTableRecursively,
	createNestedTable,
} from "./table-operations";
export {
	findTableInTree,
	findTableWithColumn,
	removeColumnFromTree,
	removeTableFromTree,
	updateTableInTree,
} from "./tree-traversal";
export {
	getNestedTableLayout,
	NESTED_BESIDE_ATTRIBUTE_THRESHOLD,
	NESTED_GRID_MAX_COLUMNS,
} from "./nested-layout";
export type {
	NestedTableLayout,
	NestedContentLayout,
	NestedGridLayout,
} from "./nested-layout";
export { findFreeNodePosition, DEFAULT_NODE_SIZE } from "./node-placement";
export { getColumnTypeLabel, COLUMN_TYPE_LABELS, type KnownColumnType } from "./column-type-labels";
export {
	existsConnection,
	getNextAvailableSubmodelIndex,
	updateNestedSubmodelIndex,
	updateSubmodelIndexInTable,
	buildGraph,
	updateSubmodelIndexInNodes,
} from "./connection-operations";
