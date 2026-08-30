"use client";

import { useHandledQueriesPercentage } from "@fsd/features/modeling-metrics";
import {
	Label,
	PolarGrid,
	PolarRadiusAxis,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
} from "recharts";

export function QueryStatsGraph() {
	const handledPercentage = useHandledQueriesPercentage();
	const porcentageAngle = (handledPercentage * 360) / 100;
	const chartData = [
		{
			porcentage: handledPercentage,
			fill: "var(--metric-gauge-arc)",
		},
	];

	return (
		<ResponsiveContainer
			width="100%"
			height="100%"
			className="aspect-square max-h-[250px]"
		>
			<RadialBarChart
				data={chartData}
				startAngle={0}
				endAngle={porcentageAngle}
				innerRadius={77}
				outerRadius={98}
			>
				<defs>
					<filter id="metric-gauge-glow">
						<feGaussianBlur stdDeviation="4" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				<PolarGrid
					gridType="circle"
					radialLines={false}
					stroke="none"
					className="metric-gauge-glow first:fill-[var(--metric-gauge-track)] last:fill-[var(--metric-gauge-center)]"
					polarRadius={[80, 73]}
				/>
				<RadialBar
					dataKey="porcentage"
					cornerRadius={10}
					className="metric-gauge-glow"
				/>
				<PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text
										x={viewBox.cx}
										y={viewBox.cy}
										textAnchor="middle"
										dominantBaseline="middle"
									>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy || 0) - 2}
											className="fill-[var(--metric-gauge-label)] text-4xl font-bold"
										>
											{handledPercentage}%
										</tspan>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy || 0) + 32}
											className="fill-[var(--metric-gauge-label)] text-p"
										>
											Completude
										</tspan>
									</text>
								);
							}
						}}
					/>
				</PolarRadiusAxis>
			</RadialBarChart>
		</ResponsiveContainer>
	);
}
