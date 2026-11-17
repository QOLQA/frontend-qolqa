import type { Query, VersionBackend } from "@fsd/entities/solution";
import { loadCanva } from "./load";
import { api } from "@fsd/shared/api";
import { transformVersionToBackend } from "@fsd/entities/solution/lib/conversions";
import { useSolutionStore } from "@fsd/entities/solution";

export const saveCanvas = async (
	diagramId: string,
	versionId: string,
	diagram?: VersionBackend,
	shouldReload: boolean = true,
) => {
	const { versions, nodes, edges } = useSolutionStore.getState();
	const version = versions.find((item) => item._id === versionId);
	if (!version) throw new Error("Version not found");

	const savedNodes = structuredClone(nodes);
	const savedEdges = structuredClone(edges);
	const diagramToSave = diagram ?? transformVersionToBackend(version, savedNodes, savedEdges);

	await api.patch(`/solutions/${diagramId}/versions/${versionId}`, diagramToSave);

	const state = useSolutionStore.getState();
	if (state.id !== diagramId) return;
	state.setVersions(state.versions.map((item) =>
		item._id === versionId ? { ...item, nodes: savedNodes, edges: savedEdges } : item,
	));

	if (shouldReload) await loadCanva(diagramId, versionId);
};

export const saveSolution = async (
	diagramId: string,
	queries: Query[],
	src_img: string
) => {
	if (!src_img) {
		console.warn("src_img is empty, skipping solution image update");
		return;
	}

	try {
		await api.patch(`/solutions/${diagramId}`, { queries, src_img });
	} catch (error) {
		console.error("Error saving solution:", error);
		throw new Error("Failed to save solution");
	}
};
