import { transformVersionToBackend } from "@fsd/entities/solution/lib/conversions";
import { useSolutionStore } from "@fsd/entities/solution";
import type {
	NestedNode,
	NodeBackend,
	TableData,
	VersionBackend,
	VersionFrontend,
} from "@fsd/entities/solution";
import type { Node } from "@xyflow/react";
import type { ActionFailure } from "@fsd/shared/api/action-results";
import {
	createEmptyVersion as createEmptyVersionAction,
	deleteVersion as deleteVersionAction,
	duplicateVersion as duplicateVersionAction,
	renameVersion,
} from "../model/actions";

/**
 * Server actions report expected failures as data; the editor flows keep their
 * reject-on-failure contract for toasts and dialogs, so adapt them here.
 */
const failureToError = (failure: ActionFailure, fallback: string): Error =>
	new Error(failure.detail ?? fallback);

// ---------------------------------------------------------------------------
// Versioning pure functions
// ---------------------------------------------------------------------------

/** Parsed version structure from a description like "project v1.2" */
export interface ParsedVersion {
	base: string;   // "project" (everything before " vX.Y")
	major: number;  // 1
	minor: number;  // 2
}

const VERSION_REGEX = /^(.*?)\s*v(\d+)\.(\d+)$/;

/** Base given to versions created with "Add new version" when none is in use. */
export const DEFAULT_VERSION_BASE = "project";

/**
 * Parses "project v1.2" → { base: "project", major: 1, minor: 2 }
 * Returns null if the description doesn't match the vX.Y pattern.
 */
export function parseVersion(description: string): ParsedVersion | null {
	const match = description.match(VERSION_REGEX);
	if (!match) return null;
	return {
		base: match[1],
		major: Number(match[2]),
		minor: Number(match[3]),
	};
}

/**
 * Finds the highest major version across all versions and returns "base vN+1.0",
 * using the most common base or `DEFAULT_VERSION_BASE`.
 * If no versions match the pattern, returns "project v1.0" (bootstrap case).
 */
export function generateNextMajorVersion(versions: VersionFrontend[]): string {
	const parsed = versions
		.map((v) => parseVersion(v.description))
		.filter((p): p is ParsedVersion => p !== null);

	if (parsed.length === 0) {
		return `${DEFAULT_VERSION_BASE} v1.0`;
	}

	// Find the most common base string
	const baseCounts = parsed.reduce<Record<string, number>>((acc, p) => {
		acc[p.base] = (acc[p.base] ?? 0) + 1;
		return acc;
	}, {});

	const mostCommonBase = Object.entries(baseCounts).reduce(
		(best, [base, count]) => (count > best.count ? { base, count } : best),
		{ base: parsed[0].base, count: 0 }
	).base;

	const maxMajor = Math.max(...parsed.map((p) => p.major));
	return `${mostCommonBase || DEFAULT_VERSION_BASE} v${maxMajor + 1}.0`;
}

/**
 * Given the current version's description and all versions,
 * increments the minor: "project v1.0" → "project v1.1"
 * If current doesn't match pattern, falls back to "(copia N)" legacy behavior.
 */
export function generateNextMinorVersion(
	currentDescription: string,
	versions: VersionFrontend[]
): string {
	const current = parseVersion(currentDescription);
	if (!current) {
		// Legacy fallback
		return generateDuplicateDescription(currentDescription, versions);
	}

	const siblings = versions
		.map((v) => parseVersion(v.description))
		.filter(
			(p): p is ParsedVersion =>
				p !== null &&
				p.base === current.base &&
				p.major === current.major
		);

	const maxMinor = siblings.length > 0
		? Math.max(...siblings.map((p) => p.minor))
		: current.minor;

	const prefix = current.base ? `${current.base} ` : "";
	return `${prefix}v${current.major}.${maxMinor + 1}`;
}

/**
 * Transforms a VersionBackend to VersionFrontend format
 */
function transformVersionBackendToFrontend(
	version: VersionBackend
): VersionFrontend {
	function mapNode(
		node: NodeBackend | NestedNode,
		submodelIndex: number
	): Node<TableData> {
		const mappedNode: Node<TableData> = {
			id: node.id,
			position: "position" in node ? node.position : { x: 0, y: 0 },
			type: "table",
			data: {
				id: node.id,
				label: node.name,
				columns: node.cols.map((col) => ({
					id: col.id,
					name: col.name,
					type: col.type,
				})),
				nestedTables: mapNestedNode(node.nested_nodes || [], submodelIndex),
				submodelIndex,
			},
		};
		return mappedNode;
	}

	function mapNestedNode(
		nestedNodes: NestedNode[],
		submodelIndex: number
	): TableData[] {
		return nestedNodes.map((nestedNode) => ({
			id: nestedNode.id,
			label: nestedNode.name,
			columns: nestedNode.cols.map((col) => ({
				id: col.id,
				name: col.name,
				type: col.type,
			})),
			nestedTables: mapNestedNode(nestedNode.nested_nodes || [], submodelIndex),
			submodelIndex,
		}));
	}

	return {
		nodes: version.submodels.flatMap((submodel, submodelIndex) =>
			submodel.nodes.map((node) => mapNode(node, submodelIndex))
		),
		edges: version.submodels.flatMap((submodel) => submodel.edges),
		description: version.description,
		solution_id: version.solution_id,
		_id: version._id,
	};
}

export async function createEmptyVersion(
	solutionId: string,
	description: string
): Promise<VersionFrontend> {
	const result = await createEmptyVersionAction(solutionId, description);
	if (!result.ok) {
		throw failureToError(result, "Error creating empty version");
	}

	const transformedVersion = transformVersionBackendToFrontend(result.data);

	const {
		versions,
		setVersions,
		setNodes,
		setEdges,
		setSelectedVersionId,
	} = useSolutionStore.getState();
	const updatedVersions = [...versions, transformedVersion];

	setVersions(updatedVersions);
	setNodes(transformedVersion.nodes);
	setEdges(transformedVersion.edges);
	setSelectedVersionId(transformedVersion._id);

	return transformedVersion;
}

export async function duplicateVersion(
	solutionId: string,
	versionId: string
): Promise<VersionFrontend> {
	const { versions } = useSolutionStore.getState();

	const currentVersion = versions.find((v) => v._id === versionId);
	if (!currentVersion) {
		throw new Error("Current version not found");
	}

	const versionBackend = transformVersionToBackend(
		currentVersion,
		currentVersion.nodes,
		currentVersion.edges
	);

	const duplicateDescription = generateNextMinorVersion(
		currentVersion.description,
		versions
	);

	const result = await duplicateVersionAction(
		solutionId,
		duplicateDescription,
		versionBackend.submodels
	);
	if (!result.ok) {
		throw failureToError(result, "Error duplicating version");
	}

	const transformedVersion = transformVersionBackendToFrontend(result.data);

	const {
		versions: currentVersions,
		setVersions,
		setNodes,
		setEdges,
		setSelectedVersionId,
	} = useSolutionStore.getState();
	const updatedVersions = [...currentVersions, transformedVersion];

	setVersions(updatedVersions);
	setNodes(transformedVersion.nodes);
	setEdges(transformedVersion.edges);
	setSelectedVersionId(transformedVersion._id);

	return transformedVersion;
}

export async function updateVersionDescription(
	solutionId: string,
	versionId: string,
	newDescription: string
): Promise<VersionFrontend> {
	const result = await renameVersion(solutionId, versionId, newDescription);
	if (!result.ok) {
		throw failureToError(result, "Error updating version description");
	}

	const transformedVersion = transformVersionBackendToFrontend(result.data);

	const { versions, setVersions } = useSolutionStore.getState();
	const updatedVersions = versions.map((v) =>
		v._id === versionId ? transformedVersion : v
	);

	setVersions(updatedVersions);

	return transformedVersion;
}

/**
 * Deletes a version from the backend and updates the store.
 * If the deleted version was selected, switches to versions[0] of the remaining list.
 * Throws if fewer than 2 versions exist (cannot delete last version).
 */
export async function deleteVersion(versionId: string): Promise<void> {
	const {
		versions,
		selectedVersionId,
		setVersions,
		setNodes,
		setEdges,
		setSelectedVersionId,
	} = useSolutionStore.getState();

	if (versions.length <= 1) {
		throw new Error("Cannot delete the only version");
	}

	const result = await deleteVersionAction(versionId);
	if (!result.ok) {
		throw failureToError(result, "Error deleting version");
	}

	const remainingVersions = versions.filter((v) => v._id !== versionId);
	setVersions(remainingVersions);

	if (selectedVersionId === versionId) {
		const nextVersion = remainingVersions[0];
		setNodes(nextVersion.nodes);
		setEdges(nextVersion.edges);
		setSelectedVersionId(nextVersion._id);
	}
}

function generateDuplicateDescription(
	originalDescription: string,
	existingVersions: VersionFrontend[]
): string {
	const baseDescription = originalDescription
		.replace(/\s*\(copia\s*\d*\)\s*$/i, "")
		.trim();

	const copyCount = existingVersions.filter((v) =>
		v.description.toLowerCase().startsWith(baseDescription.toLowerCase())
	).length;

	if (copyCount === 0) {
		return `${baseDescription} (copia)`;
	}

	return `${baseDescription} (copia ${copyCount})`;
}
