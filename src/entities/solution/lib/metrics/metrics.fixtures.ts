import type { Node, Edge } from "@xyflow/react";
import type { TableData, Query, Column } from "@fsd/entities/solution";

/**
 * Crea una columna mock válida para TableData.
 */
export const createMockColumn = (
	id: string,
	name: string,
	type: Column["type"] = "VARCHAR"
): Column => ({
	id,
	name,
	type,
});

/**
 * Crea un objeto TableData mínimo y válido.
 * Útil para construir nestedTables sin envolver en Node de xyflow.
 */
export const createMockTableData = (
	id: string,
	overrides: Partial<TableData> = {}
): TableData => ({
	id,
	label: id,
	columns: [],
	nestedTables: [],
	...overrides,
});

/**
 * Crea un Node<TableData> de xyflow listo para usar en las métricas.
 */
export const createMockTableNode = (
	id: string,
	overrides: Partial<TableData> = {}
): Node<TableData> => ({
	id,
	type: "tableNode",
	position: { x: 0, y: 0 },
	data: createMockTableData(id, overrides),
});

/**
 * Crea un Edge de xyflow entre dos nodos por sus ids.
 */
export const createMockEdge = (source: string, target: string): Edge => ({
	id: `${source}-${target}`,
	source,
	target,
});

/**
 * Crea un Query mock para pruebas de completitud (C).
 */
export const createMockQuery = (
	_id: string,
	collections: string[]
): Query => ({
	_id,
	full_query: `SELECT * FROM ${collections.join(", ")}`,
	collections,
	highlighted_words: [],
});
