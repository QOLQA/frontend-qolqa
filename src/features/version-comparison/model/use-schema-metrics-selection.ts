"use client";

import { useCallback, useEffect, useState } from "react";
import type { MetricChartRow } from "./types";

export function useSchemaMetricsSelection(
	metricsChartData: MetricChartRow[],
	onSelectionChange?: (selectedSchemas: string[]) => void,
) {
	const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(() => {
		return new Set(metricsChartData.map((metric) => metric.schema));
	});

	// Reconciles the selection with the incoming metrics during render (React's
	// "adjusting state when a prop changes" pattern) instead of inside an
	// effect, so a metrics update does not trigger a cascading render.
	const [seenMetrics, setSeenMetrics] = useState(metricsChartData);
	if (seenMetrics !== metricsChartData) {
		setSeenMetrics(metricsChartData);
		if (metricsChartData.length === 0) {
			setSelectedSchemas(new Set());
		} else {
			const currentSchemas = new Set(
				metricsChartData.map((metric) => metric.schema),
			);
			setSelectedSchemas((prev) => {
				const updated = new Set(prev);
				currentSchemas.forEach((schema) => updated.add(schema));
				Array.from(updated).forEach((schema) => {
					if (!currentSchemas.has(schema)) {
						updated.delete(schema);
					}
				});
				return updated;
			});
		}
	}

	useEffect(() => {
		onSelectionChange?.(Array.from(selectedSchemas));
	}, [selectedSchemas, onSelectionChange]);

	const allSelected =
		metricsChartData.length > 0 &&
		selectedSchemas.size === metricsChartData.length &&
		metricsChartData.every((metric) => selectedSchemas.has(metric.schema));

	const handleSelectAll = useCallback(
		(checked: boolean) => {
			if (checked) {
				setSelectedSchemas(
					new Set(metricsChartData.map((metric) => metric.schema)),
				);
			} else {
				setSelectedSchemas(new Set());
			}
		},
		[metricsChartData],
	);

	const handleToggleSchema = useCallback((schema: string) => {
		setSelectedSchemas((prev) => {
			const next = new Set(prev);
			if (next.has(schema)) {
				next.delete(schema);
			} else {
				next.add(schema);
			}
			return next;
		});
	}, []);

	return {
		selectedSchemas,
		allSelected,
		handleSelectAll,
		handleToggleSchema,
	};
}
