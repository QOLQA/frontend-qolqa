import { beforeEach, describe, expect, it } from "vitest";
import type { Node } from "@xyflow/react";
import { useQueriesStore } from "@fsd/entities/query";
import { useSolutionStore, type TableData } from "@fsd/entities/solution";
import { findStepIndex, TOUR_STEPS } from "./tour-steps";
import { readTourSnapshot, relinkNodesByLabel } from "./tour-snapshot";
import { useTourStore } from "./tour-store";
import type { TourContext } from "./types";

const makeNode = (id: string, columns = 1, nested = 0): Node<TableData> => ({
	id,
	position: { x: 0, y: 0 },
	type: "table",
	data: {
		id,
		label: id,
		columns: Array.from({ length: columns }, (_, index) => ({
			id: `${id}-c${index}`,
			name: `c${index}`,
			type: "string",
		})),
		nestedTables: Array.from({ length: nested }, (_, index) => ({
			id: `${id}-n${index}`,
			label: `n${index}`,
			columns: [],
			nestedTables: [],
			submodelIndex: 0,
		})),
		submodelIndex: 0,
	} as TableData,
});

const step = (id: string) => {
	const found = TOUR_STEPS[findStepIndex(id)];
	if (!found) throw new Error(`missing step ${id}`);
	return found;
};

const runCheck = (id: string, ctx: TourContext) =>
	step(id).check?.(readTourSnapshot(), ctx);

describe("tour store", () => {
	beforeEach(() => {
		localStorage.clear();
		useSolutionStore.setState({
			nodes: [],
			edges: [],
			versions: [],
			selectedVersionId: "v1",
		});
		useQueriesStore.setState({ queries: [] });
		useTourStore.setState({
			status: "idle",
			stepIndex: 0,
			projectId: null,
			ctx: {},
		});
	});

	it("starts at the welcome step for the given project", () => {
		useTourStore.getState().start("p1");
		const state = useTourStore.getState();
		expect(state.status).toBe("running");
		expect(state.projectId).toBe("p1");
		expect(TOUR_STEPS[state.stepIndex]?.id).toBe("welcome");
		expect(state.ctx.baseline?.selectedVersionId).toBe("v1");
	});

	it("advances, merges context and completes after the last step", () => {
		const store = useTourStore.getState();
		store.start("p1");
		store.advance({ firstNodeId: "a" });
		expect(useTourStore.getState().stepIndex).toBe(1);
		expect(useTourStore.getState().ctx.firstNodeId).toBe("a");

		useTourStore.getState().goTo(TOUR_STEPS.length - 1);
		useTourStore.getState().advance();
		expect(useTourStore.getState().status).toBe("completed");
	});

	it("refreshes the baseline whenever a step is entered", () => {
		useTourStore.getState().start("p1");
		useSolutionStore.setState({ nodes: [makeNode("a")] });
		useTourStore.getState().goToId("collectionFill");
		expect(useTourStore.getState().ctx.baseline?.nodeIds).toEqual(["a"]);
	});

	it("clamps navigation inside the step list", () => {
		useTourStore.getState().start("p1");
		useTourStore.getState().back();
		expect(useTourStore.getState().stepIndex).toBe(0);
	});
});

describe("tour step conditions", () => {
	beforeEach(() => {
		useSolutionStore.setState({
			nodes: [],
			edges: [],
			versions: [],
			selectedVersionId: "v1",
		});
		useQueriesStore.setState({ queries: [] });
	});

	it("detects the newly created collection", () => {
		const ctx: TourContext = { baseline: readTourSnapshot() };
		expect(runCheck("collectionFill", ctx)).toBe(false);
		useSolutionStore.setState({ nodes: [makeNode("users")] });
		expect(runCheck("collectionFill", ctx)).toEqual({
			firstNodeId: "users",
			firstNodeLabel: "users",
		});
	});

	it("ignores collections that existed before the step", () => {
		useSolutionStore.setState({ nodes: [makeNode("old")] });
		const ctx: TourContext = { baseline: readTourSnapshot() };
		useSolutionStore.setState({ nodes: [makeNode("old"), makeNode("orders")] });
		expect(runCheck("secondFill", ctx)).toEqual({
			secondNodeId: "orders",
			secondNodeLabel: "orders",
		});
	});

	it("waits for new attributes on the first collection", () => {
		useSolutionStore.setState({ nodes: [makeNode("users", 1)] });
		const ctx: TourContext = {
			firstNodeId: "users",
			baseline: readTourSnapshot(),
		};
		expect(runCheck("attributesFill", ctx)).toBe(false);
		useSolutionStore.setState({ nodes: [makeNode("users", 3)] });
		expect(runCheck("attributesFill", ctx)).toBe(true);
	});

	it("waits for a nested document on the first collection", () => {
		useSolutionStore.setState({ nodes: [makeNode("users", 2, 0)] });
		const ctx: TourContext = {
			firstNodeId: "users",
			baseline: readTourSnapshot(),
		};
		useSolutionStore.setState({ nodes: [makeNode("users", 2, 1)] });
		expect(runCheck("nestedFill", ctx)).toBe(true);
	});

	it("advances the version step when the selected version changes", () => {
		const ctx: TourContext = { baseline: readTourSnapshot() };
		expect(runCheck("versionDuplicate", ctx)).toBe(false);
		useSolutionStore.setState({ selectedVersionId: "v2" });
		expect(runCheck("versionDuplicate", ctx)).toBe(true);
	});

	it("advances the query step when a query is added", () => {
		const ctx: TourContext = { baseline: readTourSnapshot() };
		useQueriesStore.setState({
			queries: [{ _id: "q1" } as never],
		});
		expect(runCheck("queryDocs", ctx)).toBe(true);
	});

	it("waits for the orders to be embedded in the copy", () => {
		useSolutionStore.setState({ nodes: [makeNode("users", 2, 1)] });
		const ctx: TourContext = {
			firstNodeId: "users",
			baseline: readTourSnapshot(),
		};
		expect(runCheck("embedFill", ctx)).toBe(false);
		useSolutionStore.setState({ nodes: [makeNode("users", 2, 2)] });
		expect(runCheck("embedFill", ctx)).toBe(true);
	});

	it("advances when the separate collection is deleted", () => {
		useSolutionStore.setState({
			nodes: [makeNode("users"), makeNode("orders")],
		});
		const ctx: TourContext = {
			secondNodeId: "orders",
			secondNodeLabel: "orders",
		};
		expect(runCheck("embedDeleteOption", ctx)).toBe(false);
		useSolutionStore.setState({ nodes: [makeNode("users")] });
		expect(runCheck("embedDeleteOption", ctx)).toBe(true);
	});

	it("advances the save step once the canvas matches the saved version", () => {
		const nodes = [makeNode("users", 2, 1)];
		useSolutionStore.setState({
			nodes,
			selectedVersionId: "v2",
			versions: [
				{ _id: "v2", nodes: [makeNode("users")], edges: [] } as never,
			],
		});
		expect(runCheck("embedSave", {})).toBe(false);
		useSolutionStore.setState({
			versions: [{ _id: "v2", nodes, edges: [] } as never],
		});
		expect(runCheck("embedSave", {})).toBe(true);
	});

	it("relinks tracked nodes by label when ids change", () => {
		useSolutionStore.setState({
			nodes: [makeNode("users-copy"), makeNode("orders-copy")],
		});
		const snapshot = {
			...readTourSnapshot(),
			labelsByNode: { "users-copy": "users", "orders-copy": "orders" },
		};
		expect(
			relinkNodesByLabel(snapshot, {
				firstNodeId: "users",
				firstNodeLabel: "users",
				secondNodeId: "orders",
				secondNodeLabel: "orders",
			}),
		).toEqual({ firstNodeId: "users-copy", secondNodeId: "orders-copy" });
		expect(
			relinkNodesByLabel(snapshot, {
				firstNodeId: "users-copy",
				firstNodeLabel: "users",
			}),
		).toBeNull();
	});

	it("advances the rename step once the copy gets a new name", () => {
		useSolutionStore.setState({
			selectedVersionId: "v2",
			versions: [{ _id: "v2", description: "1.0", nodes: [], edges: [] } as never],
		});
		const ctx: TourContext = { baseline: readTourSnapshot() };
		expect(runCheck("versionRenameFill", ctx)).toBe(false);
		useSolutionStore.setState({
			versions: [
				{ _id: "v2", description: "embedded orders", nodes: [], edges: [] } as never,
			],
		});
		expect(runCheck("versionRenameFill", ctx)).toBe(true);
	});
});
