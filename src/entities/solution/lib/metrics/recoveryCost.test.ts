import { describe, it, expect } from "vitest";
import type { Edge } from "@xyflow/react";
import {
	calculateRecoveryCostPure,
	getRecoveryCost,
} from "./recoveryCost";
import { createMockTableNode, createMockEdge, createMockTableData } from "./metrics.fixtures";

describe("calculateRecoveryCostPure (RC)", () => {
	it("grafo vacío devuelve 0", () => {
		const result = calculateRecoveryCostPure([], []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("1 colección con 2 columnas simples, sin relaciones: RC = 2*0.51 + 0 + AP(0) = 1.02", () => {
		const nodes = [
			createMockTableNode("users", {
				columns: [
					{ id: "c1", name: "id", type: "PRIMARY_KEY" },
					{ id: "c2", name: "name", type: "VARCHAR" },
				],
			}),
		];
		const result = calculateRecoveryCostPure(nodes, []);
		expect(result).toBeCloseTo(1.02, 4);
	});

	it("2 colecciones referenciadas con 1 columna cada una: RC = 2*0.51 + 0 + AP(0.6) = 1.62", () => {
		const nodes = [
			createMockTableNode("users", {
				columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
			}),
			createMockTableNode("orders", {
				columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
			}),
		];
		const edges = [createMockEdge("users", "orders")];
		const result = calculateRecoveryCostPure(nodes, edges);
		expect(result).toBeCloseTo(1.62, 4);
	});

	it("esquema embedido (1 nodo con 1 nested, 1 columna cada uno): RC = 2*0.51 + 1*0.49 + AP(0.4) = 1.91", () => {
		const nested = createMockTableData("order_items", {
			columns: [{ id: "c1", name: "product_id", type: "VARCHAR" }],
		});
		const nodes = [
			createMockTableNode("orders", {
				columns: [{ id: "c1", name: "order_id", type: "PRIMARY_KEY" }],
				nestedTables: [nested],
			}),
		];
		const result = calculateRecoveryCostPure(nodes, []);
		expect(result).toBeCloseTo(1.91, 4);
	});

	it("embbedo vs referenciado: RC del embedido es mayor (más nested tables)", () => {
		// Referenciado: 2 nodos, 1 columna cada uno, 1 edge
		const refNodes = [
			createMockTableNode("users", {
				columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
			}),
			createMockTableNode("orders", {
				columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
			}),
		];
		const refEdges = [createMockEdge("users", "orders")];
		const rcReferenciado = calculateRecoveryCostPure(refNodes, refEdges);

		// Embedo: 1 nodo con 1 nested, 1 columna cada uno
		const nested = createMockTableData("order_items", {
			columns: [{ id: "c1", name: "product_id", type: "VARCHAR" }],
		});
		const embNodes = [
			createMockTableNode("orders", {
				columns: [{ id: "c1", name: "order_id", type: "PRIMARY_KEY" }],
				nestedTables: [nested],
			}),
		];
		const rcEmbedido = calculateRecoveryCostPure(embNodes, []);

		expect(rcReferenciado).toBeCloseTo(1.62, 4);
		expect(rcEmbedido).toBeCloseTo(1.91, 4);
		expect(rcEmbedido).toBeGreaterThan(rcReferenciado);
	});

	it("colecciones sin atributos (columns vacías): no rompe, RC solo por AP", () => {
		const nodes = [
			createMockTableNode("users", { columns: [] }),
			createMockTableNode("orders", { columns: [] }),
		];
		const edges = [createMockEdge("users", "orders")];
		const result = calculateRecoveryCostPure(nodes, edges);
		// totalAttrs=0, totalNested=0, AP=0.6 → RC=0.6
		expect(result).toBeCloseTo(0.6, 4);
	});

	it("división por cero no aplica en RC: nunca divide", () => {
		const result = calculateRecoveryCostPure([], []);
		expect(Number.isFinite(result)).toBe(true);
	});
});

describe("getRecoveryCost (con caché de memoización)", () => {
	it("devuelve el mismo resultado para el mismo grafo (caché hit)", () => {
		const nodes = [
			createMockTableNode("users", {
				columns: [
					{ id: "c1", name: "id", type: "PRIMARY_KEY" },
					{ id: "c2", name: "name", type: "VARCHAR" },
				],
			}),
		];
		const edges: Edge[] = [];

		const primera = getRecoveryCost(nodes, edges);
		const segunda = getRecoveryCost(nodes, edges);

		expect(segunda).toBe(primera);
		expect(primera).toBeCloseTo(1.02, 4);
	});

	it("se invalida el caché al cambiar la estructura del grafo", () => {
		const nodosIniciales = [
			createMockTableNode("users", {
				columns: [
					{ id: "c1", name: "id", type: "PRIMARY_KEY" },
					{ id: "c2", name: "name", type: "VARCHAR" },
				],
			}),
		];
		const edges: Edge[] = [];

		const inicial = getRecoveryCost(nodosIniciales, edges);
		expect(inicial).toBeCloseTo(1.02, 4);

		// Agregar un nodo y una edge cambia hash y resultado
		const conMas = getRecoveryCost(
			[
				createMockTableNode("users", {
					columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
				}),
				createMockTableNode("orders", {
					columns: [{ id: "c1", name: "id", type: "PRIMARY_KEY" }],
				}),
			],
			[createMockEdge("users", "orders")]
		);
		expect(conMas).toBeCloseTo(1.62, 4);
		expect(conMas).not.toBe(inicial);
	});
});
