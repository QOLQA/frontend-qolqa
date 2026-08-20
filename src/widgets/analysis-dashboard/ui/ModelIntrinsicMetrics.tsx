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
		color: "var(--color-purple)",
	},
	recovery_cost: {
		label: "Recovery Cost",
		color: "var(--color-green)",
	},
	access_pattern: {
		label: "Access Pattern",
		color: "var(--color-blue)",
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
						fill="var(--color-purple)"
						radius={[0, 0, 4, 4]}
					/>
					<Bar
						dataKey="recovery_cost"
						stackId="a"
						fill="var(--color-green)"
						radius={[4, 4, 0, 0]}
					/>
					<Bar
						dataKey="access_pattern"
						stackId="a"
						fill="var(--color-blue)"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ChartContainer>

			<div className="flex gap-2 flex-row justify-between pl-10">
				<div className=" text-blue flex items-center gap-2">
					<div className="size-4 bg-blue rounded-sm"></div>
					<p>Access Pattern</p>
				</div>
				<div className=" text-green flex items-center gap-2">
					<div className="size-4 bg-green rounded-sm"></div>
					<p>Recovery Cost</p>
				</div>
				<div className=" text-purple flex items-center gap-2">
					<div className="size-4 bg-purple rounded-sm"></div>
					<p>Redundancy</p>
				</div>
			</div>
		</div>
	);
}
