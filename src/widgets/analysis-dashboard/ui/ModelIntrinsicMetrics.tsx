import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@fsd/shared/ui/chart";
import { ChartTooltipContent } from "@fsd/shared/ui/chart";
import type { MetricChartRow } from "@fsd/features/analysis";
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	redundancy: {
		label: "Redundancy",
		color: "var(--metric-redundancy)",
	},
	recovery_cost: {
		label: "Recovery Cost",
		color: "var(--metric-recovery)",
	},
	access_pattern: {
		label: "Access Pattern",
		color: "var(--metric-access)",
	},
} satisfies ChartConfig;

export function ModelIntrinsicMetrics({
	metricsChartData,
}: {
	metricsChartData: MetricChartRow[];
}) {
	return (
		<div className="min-h-[100px] w-[48%] flex flex-col gap-10 ">
			<ChartContainer config={chartConfig} className="w-full h-full">
				<BarChart accessibilityLayer barSize={20} data={metricsChartData}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="schema"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						tickFormatter={(value) => value}
						padding={{ left: 40, right: 40 }}
					/>
					<YAxis tickLine={false} tickMargin={10} axisLine={false} />
					<ChartTooltip
						content={
							<ChartTooltipContent hideLabel className="min-w-[10rem]" />
						}
					/>
					<Bar
						dataKey="redundancy"
						stackId="a"
						fill="var(--metric-redundancy)"
						radius={[0, 0, 4, 4]}
					/>
					<Bar
						dataKey="recovery_cost"
						stackId="a"
						fill="var(--metric-recovery)"
						radius={[4, 4, 0, 0]}
					/>
					<Bar
						dataKey="access_pattern"
						stackId="a"
						fill="var(--metric-access)"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ChartContainer>

			<div className="flex gap-2 flex-row justify-between pl-10">
				<div className="text-[var(--metric-access)] flex items-center gap-2">
					<div className="size-4 rounded-sm bg-[var(--metric-access)]"></div>
					<p>Access Pattern</p>
				</div>
				<div className="text-[var(--metric-recovery)] flex items-center gap-2">
					<div className="size-4 rounded-sm bg-[var(--metric-recovery)]"></div>
					<p>Recovery Cost</p>
				</div>
				<div className="text-[var(--metric-redundancy)] flex items-center gap-2">
					<div className="size-4 rounded-sm bg-[var(--metric-redundancy)]"></div>
					<p>Redundancy</p>
				</div>
			</div>
		</div>
	);
}
