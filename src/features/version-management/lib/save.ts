import type { Query, VersionBackend } from "@fsd/entities/solution";
import { loadCanva } from "./load";
import { transformVersionToBackend } from "@fsd/entities/solution/lib/conversions";
import { useSolutionStore } from "@fsd/entities/solution";
import type { ActionFailure } from "@fsd/shared/api/action-results";
import {
	saveSolutionQueriesAndImage,
	saveVersionDiagram,
} from "../model/actions";

/**
 * Server actions report expected failures as data; the editor flow keeps its
 * reject-on-failure contract for toasts and dialogs, so adapt them here.
 */
const failureToError = (failure: ActionFailure, fallback: string): Error =>
	new Error(failure.detail ?? fallback);

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

	const result = await saveVersionDiagram(diagramId, versionId, diagramToSave);
	if (!result.ok) throw failureToError(result, "Failed to save canvas");

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
	// The image upload is a separate, skippable step: without it there is nothing
	// new to persist for the solution document.
	if (!src_img) return;

	const result = await saveSolutionQueriesAndImage(diagramId, queries, src_img);
	if (!result.ok) throw failureToError(result, "Failed to save solution");
};
