export {
	deleteTableRecursively,
	addAttributeToNestedTables,
	addNestedTableRecursively,
	createNestedTable,
} from "./table-operations";
export { getColumnTypeLabel, COLUMN_TYPE_LABELS } from "./column-type-labels";
export {
	existsConnection,
	getNextAvailableSubmodelIndex,
	updateNestedSubmodelIndex,
	updateSubmodelIndexInTable,
	buildGraph,
	updateSubmodelIndexInNodes,
} from "./connection-operations";
