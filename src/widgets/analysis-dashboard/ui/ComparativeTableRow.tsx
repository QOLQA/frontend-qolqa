"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
	CompletudeChartRow,
	MetricChartRow,
} from "@fsd/features/analysis";
import { SubmodelRow } from "./SubmodelRow";

interface ComparativeTableRowProps {
	metric: MetricChartRow;
	completudeRow?: CompletudeChartRow;
	isSelected: boolean;
	onToggleSelection: () => void;
}

export function ComparativeTableRow({
	metric,
	completudeRow,
	isSelected,
	onToggleSelection,
}: ComparativeTableRowProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasSubmodels = metric.submodels && metric.submodels.length > 0;
	const completudeVal = completudeRow?.completude;
	const metricsTotal =
		metric.access_pattern + metric.recovery_cost + metric.redundancy;

	const toggleExpand = () => setIsExpanded((prev) => !prev);

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="w-full flex flex-row items-center">
				<div className="w-[10%] flex justify-center items-center gap-3">
					{hasSubmodels ? (
						<button
							onClick={toggleExpand}
							className="text-gray-400 hover:text-white transition-colors"
						>
							{isExpanded ? (
								<ChevronDown size={20} />
							) : (
								<ChevronRight size={20} />
							)}
						</button>
					) : (
						<div className="w-5" />
					)}
					<div
						className={`size-5 border rounded-md transition-colors cursor-pointer ${
							isSelected
								? "border-secondary-white bg-secondary-white"
								: "border-secondary-white bg-transparent"
						}`}
						onClick={onToggleSelection}
					>
						{isSelected && (
							<svg
								className="w-full h-full text-gray"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>
				</div>
				<div className="w-[30%] flex justify-start items-center gap-2">
					<h3 className="text-[20px] font-bold text-secondary-white">
						{metric.schema}
					</h3>
				</div>
				<div className="w-[12%] flex justify-center items-center">
					<div className="w-[90px] h-[32px] flex justify-center items-center rounded-lg bg-[color-mix(in_srgb,var(--metric-access)_12%,transparent)]">
						<h3 className="text-[20px] font-bold text-[var(--metric-access)]">
							{metric.access_pattern}
						</h3>
					</div>
				</div>
				<div className="w-[12%] flex justify-center items-center">
					<div className="w-[90px] h-[32px] flex justify-center items-center rounded-lg bg-[color-mix(in_srgb,var(--metric-recovery)_12%,transparent)]">
						<h3 className="text-[20px] font-bold text-[var(--metric-recovery)]">
							{metric.recovery_cost}
						</h3>
					</div>
				</div>
				<div className="w-[12%] flex justify-center items-center">
					<div className="w-[90px] h-[32px] flex justify-center items-center rounded-lg bg-[color-mix(in_srgb,var(--metric-redundancy)_12%,transparent)]">
						<h3 className="text-[20px] font-bold text-[var(--metric-redundancy)]">
							{metric.redundancy}
						</h3>
					</div>
				</div>
				<div className="w-[12%] flex justify-center items-center">
					<div className="w-[90px] h-[32px] flex justify-center items-center bg-cuartenary-gray/80 rounded-lg border border-none">
						<h3 className="text-[20px] font-bold text-secondary-white">
							{parseFloat(metricsTotal.toFixed(2))}
						</h3>
					</div>
				</div>
				<div className="w-[12%] flex justify-center items-center">
					<div className="w-[90px] h-[32px] flex justify-center items-center rounded-lg bg-[color-mix(in_srgb,var(--metric-gauge-arc)_12%,transparent)]">
						<h3 className="text-[20px] font-bold text-[var(--metric-gauge-arc)]">
							{completudeVal}
						</h3>
					</div>
				</div>
			</div>
			{hasSubmodels && isExpanded && (
				<div className="flex flex-col w-full gap-4 mt-2 py-4 rounded-lg">
					{metric.submodels!.map((sub) => {
						const subCompletude = completudeRow?.submodels?.find(
							(s) => s.schema === sub.schema,
						)?.completude;

						return (
							<SubmodelRow
								key={`${metric.schema}-${sub.schema}`}
								metric={sub}
								completude={subCompletude}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
