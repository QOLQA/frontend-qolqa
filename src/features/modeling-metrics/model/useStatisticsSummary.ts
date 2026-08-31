"use client";

import { useSolutionStore, type StatType } from "@fsd/entities/solution";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";
import {
  getAccessPattern,
  getRecoveryCost,
  getRedundancyMetrics,
} from "@fsd/entities/solution/lib/metrics";

export function useStatisticsSummary(): StatType[] {
  const { nodes, edges, selectedVersionId } = useSolutionStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      selectedVersionId: state.selectedVersionId,
    }))
  );

  return useMemo(
    () => [
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
    ],
    [nodes, edges, selectedVersionId]
  );
}
