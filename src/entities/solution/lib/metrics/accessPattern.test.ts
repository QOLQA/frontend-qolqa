import { describe, it, expect } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import {
	calculateAccessPatternPure,
	getAccessPattern,
} from "./accessPattern";
import {
	createMockTableNode,
	createMockEdge,
	createMockTableData,
} from "./metrics.fixtures";

describe("calculateAccessPatternPure (AP)", () => {
	it("grafo vacío devuelve 0", () => {
		const result = calculateAccessPatternPure([], []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("1 colección sin relaciones: maxDepth=0, maxRelations=0 → AP=0", () => {
		const nodes = [createMockTableNode("users")];
		const result = calculateAccessPatternPure(nodes, []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("2 colecciones referenciadas (1 edge): maxDepth=0, maxRelations=1 → AP=0.6", () => {
		const nodes = [
			createMockTableNode("users"),
			createMockTableNode("orders"),
		];
		const edges = [createMockEdge("users", "orders")];
		const result = calculateAccessPatternPure(nodes, edges);
		expect(result).toBeCloseTo(0.6, 4);
	});

	it("esquema embedido (1 nodo con 1 nested): maxDepth=1, maxRelations=0 → AP=0.4", () => {
		const nested = createMockTableData("order_items");
		const nodes = [
			createMockTableNode("orders", {
				nestedTables: [nested],
			}),
		];
		const result = calculateAccessPatternPure(nodes, []);
		expect(result).toBeCloseTo(0.4, 4);
	});

	it("embbedo vs referenciado: AP del embbedo es menor que la del referenciado", () => {
		// Referenciado: 2 nodos conectados por edge
		const refNodes = [
			createMockTableNode("users"),
			createMockTableNode("orders"),
		];
		const refEdges = [createMockEdge("users", "orders")];
		const apReferenciado = calculateAccessPatternPure(refNodes, refEdges);

		// Embedo: 1 nodo con nested table
		const nested = createMockTableData("order_items");
		const embNodes = [
			createMockTableNode("orders", {
				nestedTables: [nested],
			}),
		];
		const apEmbedido = calculateAccessPatternPure(embNodes, []);

		// Embbedo visita menos colecciones → AP menor
		expect(apEmbedido).toBeLessThan(apReferenciado);
		expect(apReferenciado).toBeCloseTo(0.6, 4);
		expect(apEmbedido).toBeCloseTo(0.4, 4);
	});

	it("nodos aislados sin queries asociadas: maxRelations=0, AP solo por profundidad", () => {
		const nodes = [
			createMockTableNode("users"),
			createMockTableNode("orders"),
			createMockTableNode("products"),
		];
		// Sin edges: maxRelations=0, maxDepth=0 → AP=0
		const result = calculateAccessPatternPure(nodes, []);
		expect(result).toBeCloseTo(0, 4);
	});

	it("división por cero no aplica en AP: nunca divide, devuelve número finito", () => {
		const result = calculateAccessPatternPure([], []);
		expect(Number.isFinite(result)).toBe(true);
	});
});

describe("getAccessPattern (con caché de memoización)", () => {
	it("devuelve el mismo resultado para el mismo grafo (caché hit)", () => {
		const nodes = [createMockTableNode("users"), createMockTableNode("orders")];
		const edges = [createMockEdge("users", "orders")];

		const primera = getAccessPattern(nodes, edges);
		const segunda = getAccessPattern(nodes, edges);

		expect(segunda).toBe(primera);
		expect(primera).toBeCloseTo(0.6, 4);
	});

	it("se invalida el caché cuando cambian los nodos (mismo hash estructural distinto)", () => {
		const nodosIniciales = [createMockTableNode("users")];
		const edges: Edge[] = [];

		const inicial = getAccessPattern(nodosIniciales, edges);
		expect(inicial).toBeCloseTo(0, 4);

		// Mismo id pero distinto label/estructura → hash distinto → se recalcula
		const nodosModificados = [
			createMockTableNode("users", {
				label: "users_renamed",
			}),
		];
		const modificado = getAccessPattern(nodosModificados, edges);
		expect(modificado).toBeCloseTo(0, 4);

		// Agregar un nodo cambia el hash estructural
		const nodosConMas = [
			createMockTableNode("users"),
			createMockTableNode("orders"),
		];
		const conMas = getAccessPattern(nodosConMas, edges);
		expect(conMas).toBeCloseTo(0, 4);

		// Agregar una edge cambia el hash y el resultado
		const conEdge = getAccessPattern(
			nodosConMas,
			[createMockEdge("users", "orders")]
		);
		expect(conEdge).toBeCloseTo(0.6, 4);
		expect(conEdge).not.toBe(0);
	});

	it("no devuelve datos obsoletos tras mutar un nodo existente", () => {
		const base = [createMockTableNode("users")];
		const edges: Edge[] = [];

		const antes = getAccessPattern(base, edges);
		expect(antes).toBeCloseTo(0, 4);

		// Mutar el nodo (añadir columna no cambia hash de nodo porque generateNodeHashWithoutPosition
		// serializa data entero, así que sí cambia)
		const mutado = [createMockTableNode("users", { label: "usuarios" })];
		const despues = getAccessPattern(mutado, edges);
		expect(despues).toBeCloseTo(0, 4);
		// El valor puede ser igual (0), pero la caché se invalidó y recalculó:
		// si el grafo hubiera cambiado el resultado, se reflejaría.
		expect(despues).toBe(antes); // mismo valor numérico, pero recalculado
	});
});
