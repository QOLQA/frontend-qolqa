import type { Edge, Node } from "@xyflow/react";
import { useQueriesStore } from "@fsd/entities/query";
import { useSolutionStore, type TableData } from "@fsd/entities/solution";
import type { TourContext, TourSnapshot } from "./types";

/** Only the parts of the canvas that are persisted (ignores React Flow runtime fields). */
const serializeCanvas = (nodes: Node<TableData>[], edges: Edge[]) =>
	JSON.stringify({
		nodes: nodes.map((node) => ({ id: node.id, data: node.data })),
		edges: edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
		})),
	});

export function readTourSnapshot(): TourSnapshot {
	const { nodes, edges, versions, selectedVersionId } =
		useSolutionStore.getState();
	const { queries } = useQueriesStore.getState();

	const columnsByNode: Record<string, number> = {};
	const nestedByNode: Record<string, number> = {};
	const labelsByNode: Record<string, string> = {};
	for (const node of nodes) {
		columnsByNode[node.id] = node.data?.columns?.length ?? 0;
		nestedByNode[node.id] = node.data?.nestedTables?.length ?? 0;
		labelsByNode[node.id] = node.data?.label ?? "";
	}

	const savedVersion = versions.find(
		(version) => version._id === selectedVersionId,
	);
	const isCanvasSaved =
		!!savedVersion &&
		serializeCanvas(savedVersion.nodes, savedVersion.edges) ===
			serializeCanvas(nodes, edges);

	return {
		nodeIds: nodes.map((node) => node.id),
		edgeCount: edges.length,
		queryCount: queries.length,
		versionCount: versions.length,
		selectedVersionId,
		selectedVersionName: savedVersion?.description ?? "",
		columnsByNode,
		nestedByNode,
		labelsByNode,
		isCanvasSaved,
	};
}

/**
 * When a tracked node id no longer exists but a node with the same label does
 * (e.g. the backend regenerated ids when duplicating a version), returns the
 * corrected ids. Returns null when nothing needs to change.
 */
export function relinkNodesByLabel(
	snapshot: TourSnapshot,
	ctx: TourContext,
): Partial<TourContext> | null {
	const patch: Partial<TourContext> = {};
	const pairs = [
		["firstNodeId", ctx.firstNodeId, ctx.firstNodeLabel],
		["secondNodeId", ctx.secondNodeId, ctx.secondNodeLabel],
	] as const;
	for (const [key, id, label] of pairs) {
		if (!id || snapshot.nodeIds.includes(id)) continue;
		const match = findNodeIdByLabel(snapshot, label);
		if (match) patch[key] = match;
	}
	return Object.keys(patch).length > 0 ? patch : null;
}

/** Finds a node by label (ids may change when a version is duplicated). */
export const findNodeIdByLabel = (
	snapshot: TourSnapshot,
	label: string | undefined,
) =>
	label
		? snapshot.nodeIds.find((id) => snapshot.labelsByNode[id] === label)
		: undefined;
