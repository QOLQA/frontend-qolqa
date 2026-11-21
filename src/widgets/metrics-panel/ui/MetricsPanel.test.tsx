import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import { MetricsPanel } from "./MetricsPanel";
import { useSolutionStore } from "@fsd/entities/solution";
import {
	createMockTableNode,
	createMockEdge,
} from "@fsd/entities/solution/lib/metrics/metrics.fixtures";

// Mock del gráfico de Recharts para evitar depender de ResizeObserver / canvas en jsdom
vi.mock("./QueryStatsGraph", () => ({
	QueryStatsGraph: () => <div data-testid="query-stats-graph">mocked graph</div>,
}));

const resetStore = () => {
	useSolutionStore.setState({
		nodes: [],
		edges: [],
		selectedVersionId: "",
		loadedSolutionId: null,
		isChangingVersion: false,
		id: "",
		versions: [],
		_hasHydrated: false,
	});
};

const getMetricValue = (metricName: string): string => {
	const nameEl = screen.getByText(metricName);
	const card = nameEl.closest("div");
	return within(card!).getByText(/^\d+(\.\d+)?$/).textContent;
};

describe("MetricsPanel (integración de UI)", () => {
	beforeEach(() => {
		resetStore();
	});

	afterEach(() => {
		resetStore();
	});

	it("renderiza los 3 indicadores con valor 0 cuando el grafo está vacío", () => {
		render(<MetricsPanel />);

		// Nombres de métrica únicos → queries semánticas seguras
		expect(screen.getByText("Access Pattern")).toBeInTheDocument();
		expect(screen.getByText("Recovery Cost")).toBeInTheDocument();
		expect(screen.getByText("Redundancy")).toBeInTheDocument();

		// El gráfico mockeado debe estar presente
		expect(screen.getByTestId("query-stats-graph")).toBeInTheDocument();

		// Cada tarjeta muestra su valor numérico; within() evita ambigüedad
		// cuando varios indicadores coinciden en "0".
		expect(getMetricValue("Access Pattern")).toBe("0");
		expect(getMetricValue("Recovery Cost")).toBe("0");
		expect(getMetricValue("Redundancy")).toBe("0");
	});

	it("actualiza los indicadores cuando cambian los nodos y aristas del store", () => {
		render(<MetricsPanel />);

		// Inyectar estado externo al store dentro de act() (React 19 + Zustand)
		// Las acciones de Zustand se acceden vía getState()
		act(() => {
			useSolutionStore.getState().setNodes([
				createMockTableNode("users"),
				createMockTableNode("orders"),
			]);
			useSolutionStore.getState().setEdges([createMockEdge("users", "orders")]);
		});

		// AP: 2 nodos conectados (maxRelations=1, maxDepth=0) → 0.6
		expect(getMetricValue("Access Pattern")).toBe("0.6");

		// RC: 0 attrs + 0 nested + AP(0.6) → 0.6
		expect(getMetricValue("Recovery Cost")).toBe("0.6");

		// R: sin nombres duplicados → 0
		expect(getMetricValue("Redundancy")).toBe("0");
	});

	it("no se desincroniza al vaciar el grafo tras tener datos", () => {
		// Primero con datos (2 nodos mismo nombre → redundancia = 1)
		render(<MetricsPanel />);

		act(() => {
			useSolutionStore.getState().setNodes([
				createMockTableNode("users"),
				createMockTableNode("users"),
			]);
			useSolutionStore.getState().setEdges([]);
		});

		expect(getMetricValue("Redundancy")).toBe("1");

		// Luego vaciar el store
		act(() => {
			useSolutionStore.getState().setNodes([]);
			useSolutionStore.getState().setEdges([]);
		});

		// El componente se re-renderiza por suscripción al store
		expect(getMetricValue("Redundancy")).toBe("0");
		expect(getMetricValue("Access Pattern")).toBe("0");
	});
});
