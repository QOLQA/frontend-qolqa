import type { Query, VersionFrontend } from "@fsd/entities/solution";
import {
	calculateHandledQueriesPercentage,
	getAccessPattern,
	getRecoveryCost,
	getRedundancyMetrics,
} from "@fsd/entities/solution/lib/metrics";

export type VersionScore = {
	id: string;
	name: string;
	/** Lower is better. */
	accessPattern: number;
	/** Lower is better. */
	recoveryCost: number;
	/** Lower is better. */
	redundancy: number;
	/** Percentage of queries the schema answers. Higher is better. */
	completude: number;
	/** Sum of the "lower is better" metrics. */
	total: number;
};

export function scoreVersions(
	versions: VersionFrontend[],
	queries: Query[],
): VersionScore[] {
	return versions.map((version) => {
		const accessPattern = getAccessPattern(version.nodes, version.edges);
		const recoveryCost = getRecoveryCost(version.nodes, version.edges);
		const redundancy = getRedundancyMetrics(version.nodes);
		return {
			id: version._id,
			name: version.description,
			accessPattern,
			recoveryCost,
			redundancy,
			completude: calculateHandledQueriesPercentage(
				queries,
				version.nodes,
				version.edges,
			),
			total: Math.round((accessPattern + recoveryCost + redundancy) * 100) / 100,
		};
	});
}

/**
 * Best first: a schema must first answer the queries (highest completude);
 * among those, the lowest combined cost wins. Ties keep the original order.
 */
export function rankVersions(scores: VersionScore[]): VersionScore[] {
	return [...scores].sort(
		(a, b) => b.completude - a.completude || a.total - b.total,
	);
}
