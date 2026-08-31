"use client";

import { useMemo } from "react";
import { useSolutionStore } from "@fsd/entities/solution";
import { useShallow } from "zustand/react/shallow";
import {
	getAccessPattern,
	getRecoveryCost,
	getRedundancyMetrics,
} from "@fsd/entities/solution/lib/metrics";
import { QueryStatsGraph } from "./QueryStatsGraph";
import { SquadStats } from "./SquadStats";
import { StatsLineTotal } from "./StatsLineTotal";

export function MetricsPanel() {
	const { nodes, edges, selectedVersionId } = useSolutionStore(
		useShallow((state) => ({
			nodes: state.nodes,
			edges: state.edges,
			selectedVersionId: state.selectedVersionId,
		})),
	);

	const data = useMemo(() => {
		return [
			{
				name: "Access Pattern",
				value: getAccessPattern(nodes, edges),
				color: "var(--metric-access)",
				surface: "var(--metric-access-surface)",
				foreground: "var(--metric-access-foreground)",
			},
			{
				name: "Recovery Cost",
				value: getRecoveryCost(nodes, edges),
				color: "var(--metric-recovery)",
				surface: "var(--metric-recovery-surface)",
				foreground: "var(--metric-recovery-foreground)",
			},
			{
				name: "Redundancy",
				value: getRedundancyMetrics(nodes),
				color: "var(--metric-redundancy)",
				surface: "var(--metric-redundancy-surface)",
				foreground: "var(--metric-redundancy-foreground)",
			},
		];
	}, [nodes, edges, selectedVersionId]);

	return (
		<div className="flex flex-col h-full w-full items-center justify-between gap-6 overflow-auto custom-scrollbar">
			<div className="w-full">
				<QueryStatsGraph />
			</div>
			<div className="flex items-center justify-between w-full h-full pb-9 gap-2">
				<SquadStats data={data} />
				<StatsLineTotal data={data} />
			</div>
		</div>
	);
}
