import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@fsd/shared/ui/chart";
import type { CompletudeChartRow } from "@fsd/features/analysis";
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	completude: {
		label: "Completude",
		color: "var(--metric-gauge-arc)",
	},
} satisfies ChartConfig;

export function WorkloadDrivenMetric({
	completudeChartData,
}: {
	completudeChartData: CompletudeChartRow[];
}) {
	return (
		<div className="min-h-[100px] w-[45%] flex flex-col gap-10 ">
			<ChartContainer config={chartConfig} className="w-full h-full">
				<BarChart accessibilityLayer barSize={20} data={completudeChartData}>
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
						dataKey="completude"
						stackId="a"
						fill="var(--metric-gauge-arc)"
						radius={[0, 0, 4, 4]}
					/>
				</BarChart>
			</ChartContainer>

			<div className="flex gap-2 flex-row justify-center">
				<div className="text-[var(--metric-gauge-arc)] flex items-center gap-2">
					<div className="size-4 rounded-sm bg-[var(--metric-gauge-arc)]"></div>
					<p>Completude (Queries Handled)</p>
				</div>
			</div>
		</div>
	);
}
