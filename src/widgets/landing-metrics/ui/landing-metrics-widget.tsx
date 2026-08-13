"use client";

import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useMetricsAnimation } from "../model/use-metrics-animation";

export const LandingMetricsWidget = () => {
  const { t } = useTranslation();
  const { containerRef, gridRef } = useMetricsAnimation();

  const metricsData = [
    {
      key: "accessPattern",
      color: "border-t-[#0052cc]",
      formula:
        "$accessPattern = (maxDepth \\times 0.4) + (maxRelations \\times 0.6)$",
    },
    {
      key: "recoveryCost",
      color: "border-t-[#0052cc]",
      formula:
        "$recoveryCost = (totalAttributes \\times 0.51) + (totalNestedTables \\times 0.49) + accessPattern$",
    },
    {
      key: "redundancy",
      color: "border-t-[#e93544]",
      formula: "$redundancy = \\sum (count - 1)$",
    },
    {
      key: "completitud",
      color: "border-t-[#006239]",
      formula:
        "$completude = \\frac{handledQueries}{totalQueries} \\times 100$",
    },
  ] as const;

  return (
    <section
      ref={containerRef}
      id="metrics"
      className="py-24 bg-[#0f0f0f] border-t border-[#363636]/40"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-wider text-[#0052cc] uppercase">
            {t("landing.metrics.tag")}
          </span>
          <h2 className="text-h2 font-bold text-[#dfdfdf] mt-2">
            {t("landing.metrics.title")}
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {metricsData.map((metric) => (
            <div
              key={metric.key}
              className={`p-8 rounded-xl bg-[#1e1e1e] border border-[#363636] border-t-4 ${metric.color} hover:bg-[#232323] transition-colors`}
            >
              <h3 className="text-h3 font-semibold text-[#dfdfdf]">
                {t(
                  `landing.metrics.${metric.key}.name` as Parameters<
                    typeof t
                  >[0],
                )}
              </h3>
              <p className="text-xs text-[#0052cc] font-mono mt-1">
                {t(
                  `landing.metrics.${metric.key}.subtitle` as Parameters<
                    typeof t
                  >[0],
                )}
              </p>
              <p className="text-p-sm text-[#747474] mt-4">
                {t(
                  `landing.metrics.${metric.key}.description` as Parameters<
                    typeof t
                  >[0],
                )}
              </p>

              {/* Contenedor formal para la ecuación */}
              <div className="mt-6 p-4 rounded-lg bg-[#171717] border border-[#363636] font-mono text-xs text-[#9d9d9d] overflow-x-auto">
                {t(
                  `landing.metrics.${metric.key}.formula` as Parameters<
                    typeof t
                  >[0],
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
