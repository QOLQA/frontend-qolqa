import { describe, it, expect } from "vitest";
import type { Node } from "@xyflow/react";
import {
	calculateRedundancyMetricsPure,
	getRedundancyMetrics,
} from "./redundancy";
import {
	createMockTableNode,
	createMockTableData,
} from "./metrics.fixtures";

describe("calculateRedundancyMetricsPure (R)", () => {
	it("grafo vacío devuelve 0", () => {
		const result = calculateRedundancyMetricsPure([]);
		expect(result).toBeCloseTo(0, 4);
	});

	it("1 colección sin duplicados devuelve 0", () => {
		const nodes = [createMockTableNode("users")];
		const result = calculateRedundancyMetricsPure(nodes);
		expect(result).toBeCloseTo(0, 4);
	});

	it("2 colecciones con el mismo nombre: R = 1 (2 - 1)", () => {
		const nodes = [
			createMockTableNode("users"),
			createMockTableNode("users"),
		];
		const result = calculateRedundancyMetricsPure(nodes);
		expect(result).toBeCloseTo(1, 4);
	});

	it("3 colecciones con el mismo nombre: R = 2 (3 - 1)", () => {
		const nodes = [
			createMockTableNode("users"),
			createMockTableNode("users"),
			createMockTableNode("users"),
		];
		const result = calculateRedundancyMetricsPure(nodes);
		expect(result).toBeCloseTo(2, 4);
	});

	it("múltiples nombres duplicados: R = suma de (count - 1) por cada nombre", () => {
		const nodes = [
			createMockTableNode("users"),
			createMockTableNode("users"),
			createMockTableNode("orders"),
			createMockTableNode("orders"),
			createMockTableNode("products"),
		];
		const result = calculateRedundancyMetricsPure(nodes);
		// users: 2-1=1, orders: 2-1=1, products: 0 → total 2
		expect(result).toBeCloseTo(2, 4);
	});

	it("nested tables con nombre duplicado también cuentan", () => {
		const nested = createMockTableData("audit_log");
		const nodes = [
			createMockTableNode("orders", {
				nestedTables: [nested],
			}),
			createMockTableNode("audit_log"),
		];
		const result = calculateRedundancyMetricsPure(nodes);
		// "audit_log" aparece 2 veces (una como nested, una como nodo raíz) → R=1
		expect(result).toBeCloseTo(1, 4);
	});

	it("colecciones sin atributos: redundancy solo por nombres de tabla", () => {
		const nodes = [
			createMockTableNode("users", { columns: [] }),
			createMockTableNode("users", { columns: [] }),
		];
		const result = calculateRedundancyMetricsPure(nodes);
		expect(result).toBeCloseTo(1, 4);
	});
});

describe("getRedundancyMetrics (con caché de memoización)", () => {
	it("devuelve el mismo resultado para los mismos nodos (caché hit)", () => {
		const nodes = [createMockTableNode("users"), createMockTableNode("users")];

		const primera = getRedundancyMetrics(nodes);
		const segunda = getRedundancyMetrics(nodes);

		expect(segunda).toBe(primera);
		expect(primera).toBeCloseTo(1, 4);
	});

	it("se invalida al cambiar la lista de nodos", () => {
		const inicial = getRedundancyMetrics([createMockTableNode("users")]);
		expect(inicial).toBeCloseTo(0, 4);

		const conDuplicado = getRedundancyMetrics([
			createMockTableNode("users"),
			createMockTableNode("users"),
		]);
		expect(conDuplicado).toBeCloseTo(1, 4);
		expect(conDuplicado).not.toBe(inicial);
	});
});
