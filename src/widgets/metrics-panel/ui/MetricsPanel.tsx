"use client";

import { useStatisticsSummary } from "@fsd/features/schema-metrics-calculation";
import { QueryStatsGraph } from "./QueryStatsGraph";
import { SquadStats } from "./SquadStats";
import { StatsLineTotal } from "./StatsLineTotal";

export function MetricsPanel() {
	const data = useStatisticsSummary();

	return (
		<div className="flex flex-col h-full w-full items-center justify-between gap-6 overflow-auto custom-scrollbar">
			<div className="w-full" data-tour="metrics-queries">
				<QueryStatsGraph />
			</div>
			<div
				className="flex items-center justify-between w-full h-full pb-9 gap-2"
				data-tour="metrics-scores"
			>
				<SquadStats data={data} />
				<StatsLineTotal data={data} />
			</div>
		</div>
	);
}
