import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import type { Query, TableData } from "@fsd/entities/solution";
import { useSolutionStore } from "@fsd/entities/solution";
import { useQueriesStore } from "@fsd/entities/query";
import {
	createMockEdge,
	createMockQuery,
	createMockTableNode,
} from "@fsd/entities/solution/lib/metrics/metrics.fixtures";
import { useHandledQueries } from "./useHandledQueries";

function setSchema(nodes: Node<TableData>[], edges: Edge[]): void {
	useSolutionStore.setState({ nodes, edges });
}

function setQueries(queries: Query[]): void {
	useQueriesStore.setState({ queries });
}

const renderHandledQueries = () => renderHook(() => useHandledQueries());

beforeEach(() => {
	setSchema([], []);
	setQueries([]);
});

describe("useHandledQueries", () => {
	it("returns an empty array when there are no queries", () => {
		setSchema([createMockTableNode("users")], []);

		const { result } = renderHandledQueries();

		expect(result.current).toEqual([]);
	});

	it("returns booleans aligned with the queries order", () => {
		setSchema(
			[
				createMockTableNode("users"),
				createMockTableNode("orders"),
				createMockTableNode("products"),
			],
			[createMockEdge("users", "orders")]
		);
		setQueries([
			createMockQuery("q1", ["users", "orders"]), // satisfecha (conectadas)
			createMockQuery("q2", ["inexistente"]), // no satisfecha (no existe)
			createMockQuery("q3", ["products", "users"]), // no satisfecha (sin camino)
			createMockQuery("q4", ["products"]), // satisfecha
		]);

		const { result } = renderHandledQueries();

		expect(result.current).toEqual([true, false, false, true]);
	});

	it("reads the current schema and queries from the stores", () => {
		setSchema([createMockTableNode("users")], []);
		setQueries([createMockQuery("q1", ["users"])]);

		const { result } = renderHandledQueries();

		expect(result.current).toEqual([true]);
	});
});
