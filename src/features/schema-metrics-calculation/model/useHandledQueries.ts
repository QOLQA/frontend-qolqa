"use client";

import { useQueriesStore } from "@fsd/entities/query";
import { useSolutionStore } from "@fsd/entities/solution";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";
import { calculateHandledQueries } from "@fsd/entities/solution/lib/metrics";

export function useHandledQueries(): boolean[] {
	const queries = useQueriesStore((state) => state.queries);

	const { nodes, edges } = useSolutionStore(
		useShallow((state) => ({
			nodes: state.nodes,
			edges: state.edges,
		}))
	);

	return useMemo(
		() => calculateHandledQueries(queries, nodes, edges),
		[queries, nodes, edges]
	);
}
