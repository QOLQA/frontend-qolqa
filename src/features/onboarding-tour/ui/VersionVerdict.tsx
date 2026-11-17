"use client";

import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import { useQueriesStore } from "@fsd/entities/query";
import { useSolutionStore } from "@fsd/entities/solution";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { cn } from "@fsd/shared/lib/classnames";
import {
	rankVersions,
	scoreVersions,
	type VersionScore,
} from "../model/version-verdict";

const METRICS = [
	{ key: "completude", lowerIsBetter: false },
	{ key: "accessPattern", lowerIsBetter: true },
	{ key: "recoveryCost", lowerIsBetter: true },
	{ key: "redundancy", lowerIsBetter: true },
	{ key: "total", lowerIsBetter: true },
] as const satisfies readonly {
	key: keyof VersionScore;
	lowerIsBetter: boolean;
}[];

const format = (value: number, key: keyof VersionScore) =>
	key === "completude" ? `${Math.round(value)}%` : String(Math.round(value * 100) / 100);

/** Final-step summary: how to read each metric and why the winning version wins. */
export function VersionVerdict() {
	const { t } = useTranslation();
	const versions = useSolutionStore((state) => state.versions);
	const queries = useQueriesStore((state) => state.queries);
	const [winner, runnerUp] = rankVersions(scoreVersions(versions, queries));

	const reason =
		winner && runnerUp
			? winner.completude > runnerUp.completude
				? t("tour.verdict.reasonQueries")
						.replace("{winner}", format(winner.completude, "completude"))
						.replace("{other}", format(runnerUp.completude, "completude"))
				: t("tour.verdict.reasonCost")
						.replace("{queries}", format(winner.completude, "completude"))
						.replace("{winner}", format(winner.total, "total"))
						.replace("{other}", format(runnerUp.total, "total"))
			: null;

	return (
		<div className="mt-4 flex flex-col gap-3">
			<ul className="flex flex-col gap-1.5">
				{METRICS.filter(({ key }) => key !== "total").map(({ key, lowerIsBetter }) => {
					const Icon = lowerIsBetter ? ArrowDown : ArrowUp;
					return (
						<li key={key} className="flex gap-2 text-h7 text-secondary-white">
							<Icon className="mt-0.5 size-3.5 shrink-0 text-blue" />
							<span>
								<span className="font-semibold text-white">
									{t(`tour.verdict.metrics.${key}.name`)}:
								</span>{" "}
								{t(`tour.verdict.metrics.${key}.meaning`)}
							</span>
						</li>
					);
				})}
			</ul>

			{winner && runnerUp ? (
				<div className="rounded-xl border border-gray bg-secondary-gray p-3 dark:border-transparent dark:bg-terciary-gray">
					<p className="flex items-center gap-2 text-h6 font-semibold text-white">
						<Trophy className="size-4 shrink-0 text-green" />
						{t("tour.verdict.winner").replace("{name}", winner.name)}
					</p>
					<p className="mt-1 text-h7 text-secondary-white">{reason}</p>

					<table className="mt-3 w-full table-fixed text-h7">
						<thead className="text-lighter-gray">
							<tr>
								<th className="w-1/2 py-1 text-left font-medium">{t("tour.verdict.metric")}</th>
								<th className="truncate py-1 text-right font-medium text-white">{winner.name}</th>
								<th className="truncate py-1 text-right font-medium">{runnerUp.name}</th>
							</tr>
						</thead>
						<tbody>
							{METRICS.map(({ key, lowerIsBetter }) => {
								const diff = winner[key] - runnerUp[key];
								const isBetter = lowerIsBetter ? diff < 0 : diff > 0;
								const isWorse = lowerIsBetter ? diff > 0 : diff < 0;
								return (
									<tr key={key} className="border-t border-gray text-secondary-white">
										<td className="py-1">{t(`tour.verdict.metrics.${key}.name`)}</td>
										<td
											className={cn(
												"py-1 text-right font-semibold",
												isBetter && "text-green",
												isWorse && "text-red",
											)}
										>
											{format(winner[key], key)}
										</td>
										<td className="py-1 text-right">{format(runnerUp[key], key)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<p className="mt-2 text-h7 text-lighter-gray">{t("tour.verdict.legend")}</p>
				</div>
			) : (
				<p className="text-h7 text-secondary-white">{t("tour.verdict.needVersions")}</p>
			)}
		</div>
	);
}
