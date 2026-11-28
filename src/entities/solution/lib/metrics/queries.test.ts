import { describe, it, expect } from "vitest";
import type { Node } from "@xyflow/react";
import type { TableData } from "@fsd/entities/solution";
import {
	calculateHandledQueries,
	calculateHandledQueriesPercentage,
} from "./queries";
import {
	createMockTableNode,
	createMockEdge,
	createMockQuery,
	createMockTableData,
} from "./metrics.fixtures";

function buildNodes(tableDataList: TableData[]): Node<TableData>[] {
	return tableDataList.map((td) =>
		createMockTableNode(td.id, { ...td })
	);
}

describe("calculateHandledQueries (satisfacción por query)", () => {
	it("lista de queries vacía devuelve un array vacío", () => {
		const nodes = buildNodes([createMockTableData("users")]);
		expect(calculateHandledQueries([], nodes, [])).toEqual([]);
	});

	it("query cuyas colecciones existen y están conectadas: true", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
		]);
		const edges = [createMockEdge("users", "orders")];
		const queries = [createMockQuery("q1", ["users", "orders"])];
		expect(calculateHandledQueries(queries, nodes, edges)).toEqual([true]);
	});

	it("query que nombra una colección inexistente: false", () => {
		const nodes = buildNodes([createMockTableData("users")]);
		const queries = [createMockQuery("q1", ["inexistente"])];
		expect(calculateHandledQueries(queries, nodes, [])).toEqual([false]);
	});

	it("query con colecciones existentes pero no conectadas: false", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
		]);
		const queries = [createMockQuery("q1", ["users", "orders"])];
		expect(calculateHandledQueries(queries, nodes, [])).toEqual([false]);
	});

	it("lista mixta devuelve booleanos alineados al orden de entrada", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
			createMockTableData("products"),
		]);
		const edges = [createMockEdge("users", "orders")];
		const queries = [
			createMockQuery("q1", ["users", "orders"]), // true
			createMockQuery("q2", ["inexistente"]), // false
			createMockQuery("q3", ["products", "users"]), // false (sin camino)
			createMockQuery("q4", ["products"]), // true
		];
		expect(calculateHandledQueries(queries, nodes, edges)).toEqual([
			true,
			false,
			false,
			true,
		]);
	});

	it("tabla padre y su tabla anidada cuentan como conectadas: true", () => {
		const nodes = [
			createMockTableNode("orders", {
				nestedTables: [createMockTableData("order_items")],
			}),
		];
		const queries = [createMockQuery("q1", ["orders", "order_items"])];
		expect(calculateHandledQueries(queries, nodes, [])).toEqual([true]);
	});
});

describe("calculateHandledQueriesPercentage (C - completitud)", () => {
	it("lista de queries vacía devuelve 0 (división por cero controlada)", () => {
		const result = calculateHandledQueriesPercentage([], [], []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("1 query con colección que existe: 100%", () => {
		const nodes = buildNodes([createMockTableData("users")]);
		const queries = [createMockQuery("q1", ["users"])];
		const result = calculateHandledQueriesPercentage(queries, nodes, []);
		expect(result).toBeCloseTo(100, 4);
	});

	it("1 query con colección que NO existe: 0%", () => {
		const nodes = buildNodes([createMockTableData("users")]);
		const queries = [createMockQuery("q1", ["inexistente"])];
		const result = calculateHandledQueriesPercentage(queries, nodes, []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("2 queries, 1 manejada y 1 no manejada: 50%", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
		]);
		const edges = [createMockEdge("users", "orders")];
		const queries = [
			createMockQuery("q1", ["users", "orders"]), // manejada (conectadas por edge)
			createMockQuery("q2", ["inexistente"]), // no manejada
		];
		const result = calculateHandledQueriesPercentage(queries, nodes, edges);
		expect(result).toBeCloseTo(50, 4);
	});

	it("2 queries con 2 colecciones conectadas por edge: ambas manejadas, 100%", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
		]);
		const edges = [createMockEdge("users", "orders")];
		const queries = [
			createMockQuery("q1", ["users"]),
			createMockQuery("q2", ["orders"]),
		];
		const result = calculateHandledQueriesPercentage(queries, nodes, edges);
		expect(result).toBeCloseTo(100, 4);
	});

	it("2 colecciones NO conectadas: query no manejada, 0%", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
		]);
		// Sin edges: no hay camino entre users y orders
		const queries = [createMockQuery("q1", ["users", "orders"])];
		const result = calculateHandledQueriesPercentage(queries, nodes, []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("query con nested table: la tabla anidada se considera existente", () => {
		const nested = createMockTableData("order_items");
		const nodes = buildNodes([
			createMockTableData("orders", { nestedTables: [nested] }),
		]);
		const queries = [createMockQuery("q1", ["order_items"])];
		const result = calculateHandledQueriesPercentage(queries, nodes, []);
		expect(result).toBeCloseTo(100, 4);
	});

	it("múltiples queries con mix de manejadas y no manejadas: porcentaje proporcional", () => {
		const nodes = buildNodes([
			createMockTableData("users"),
			createMockTableData("orders"),
			createMockTableData("products"),
		]);
		const edges = [createMockEdge("users", "orders")];
		const queries = [
			createMockQuery("q1", ["users"]), // manejada
			createMockQuery("q2", ["orders"]), // manejada
			createMockQuery("q3", ["products"]), // manejada
			createMockQuery("q4", ["inexistente"]), // no manejada
		];
		const result = calculateHandledQueriesPercentage(queries, nodes, edges);
		// 3 de 4 manejadas → 75%
		expect(result).toBeCloseTo(75, 4);
	});
});
