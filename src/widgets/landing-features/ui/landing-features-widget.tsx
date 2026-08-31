"use client";

import Image from "next/image";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useFeaturesAnimation } from "../model/use-features-animation";

export const LandingFeaturesWidget = () => {
  const { t } = useTranslation();
  const { containerRef, addToRefs } = useFeaturesAnimation();

  return (
    <section
      ref={containerRef}
      id="canvas"
      className="py-24 bg-background border-t border-gray/40"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-semibold tracking-wider text-blue uppercase">
            {t("landing.features.tag")}
          </span>
          <h2 className="text-h2 font-bold text-foreground mt-2">
            {t("landing.features.title")}
          </h2>
        </div>

        <div className="space-y-24">
          {/* Feature 1: Canvas Editor */}
          <div
            ref={addToRefs}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary-gray p-8 lg:p-12 rounded-2xl border border-gray"
          >
            <div>
              <h3 className="text-h3 font-semibold text-foreground mb-4">
                {t("landing.features.canvas.title")}
              </h3>
              <p className="text-p-md text-lighter-gray">
                {t("landing.features.canvas.desc")}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray bg-secondary-gray">
              <Image
                src="/images/canvas-feature.png"
                alt="Interactive React Flow Canvas"
                width={700}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Feature 2: Natural Language Queries */}
          <div
            ref={addToRefs}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary-gray p-8 lg:p-12 rounded-2xl border border-gray"
          >
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden border border-gray bg-secondary-gray">
              <Image
                src="/images/query-modal-feature.png"
                alt="Natural Language Query Linking"
                width={700}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-h3 font-semibold text-foreground mb-4">
                {t("landing.features.queries.title")}
              </h3>
              <p className="text-p-md text-lighter-gray">
                {t("landing.features.queries.desc")}
              </p>
            </div>
          </div>

          {/* Feature 3: Version Matrix */}
          <div
            ref={addToRefs}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary-gray p-8 lg:p-12 rounded-2xl border border-gray"
          >
            <div>
              <h3 className="text-h3 font-semibold text-foreground mb-4">
                {t("landing.features.versioning.title")}
              </h3>
              <p className="text-p-md text-lighter-gray">
                {t("landing.features.versioning.desc")}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray bg-secondary-gray">
              <Image
                src="/images/metrics-chart-feature.png"
                alt="Version Comparison Matrix"
                width={700}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
