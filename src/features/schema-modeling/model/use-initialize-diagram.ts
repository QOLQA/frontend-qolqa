"use client";

import { useSolutionStore } from "@fsd/entities/solution";
import type { VersionFrontend } from "@fsd/entities/solution";
import { useEffect, useSyncExternalStore } from "react";

interface LoaderData {
	name: string;
	versions: VersionFrontend[];
	solutionId: string;
	last_version_saved: string;
}

// Tracks whether the component has hydrated without setting state in an
// effect: on the server it reports false and on the client true, after the
// first hydration render.
const emptySubscribe = () => () => {};
const useIsHydrated = () =>
	useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);

export function useInitializeDiagram(loaderData: LoaderData): boolean {
	const isHydrated = useIsHydrated();

	const { id, setNodes, setEdges, setId, setVersions, setSelectedVersionId } =
		useSolutionStore();

	const versionId = loaderData.versions.findIndex(
		(version: VersionFrontend) => loaderData.last_version_saved === version._id,
	);
	const version = versionId >= 0 ? loaderData.versions[versionId] : null;

	useEffect(() => {
		if (isHydrated && version && id !== loaderData.solutionId) {
			setId(loaderData.solutionId);
			setNodes(version.nodes);
			setEdges(version.edges);
			setVersions(loaderData.versions);
			setSelectedVersionId(version._id);
		}
	}, [
		isHydrated,
		loaderData,
		version,
		id,
		setNodes,
		setEdges,
		setId,
		setVersions,
		setSelectedVersionId,
	]);

	return isHydrated;
}
