import type { SolutionStore } from "@fsd/entities/solution";
import { transformVersionToBackend } from "@fsd/entities/solution/lib/conversions";

export function hasUnsavedCanvasChanges(
	state: Pick<SolutionStore, "id" | "selectedVersionId" | "versions" | "nodes" | "edges">,
): boolean {
	const version = state.versions.find((item) => item._id === state.selectedVersionId);
	if (!state.id || !version) return false;

	const saved = transformVersionToBackend(version, version.nodes, version.edges);
	const current = transformVersionToBackend(version, state.nodes, state.edges);
	return JSON.stringify(saved.submodels) !== JSON.stringify(current.submodels);
}
