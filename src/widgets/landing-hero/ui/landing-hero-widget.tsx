"use client";

import Image from "next/image";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useHeroAnimation } from "../model/use-hero-animation";
import Link from "next/link";

export const LandingHeroWidget = () => {
  const { t } = useTranslation();
  const { containerRef, badgeRef, titleRef, subtitleRef, ctaRef, cardRef } =
    useHeroAnimation();

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-32 pb-24 overflow-hidden bg-transparent"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#0052cc]/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1e1e]/80 backdrop-blur-md border border-[#363636] text-xs font-medium text-[#0052cc] mb-6 opacity-0"
        >
          <span className="w-2 h-2 rounded-full bg-[#0052cc] animate-pulse" />
          {t("landing.hero.badge")}
        </div>

        <h1
          ref={titleRef}
          className="text-h1 font-bold text-[#dfdfdf] tracking-tight max-w-4xl mx-auto opacity-0"
        >
          {t("landing.hero.title")}
        </h1>

        <p
          ref={subtitleRef}
          className="text-p-lg text-[#747474] mt-6 max-w-2xl mx-auto opacity-0"
        >
          {t("landing.hero.subtitle")}
        </p>

        <div
          ref={ctaRef}
          className="flex items-center justify-center gap-4 mt-8 opacity-0"
        >
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-[#0052cc] text-[#dfdfdf] font-medium hover:bg-[#0052cc]/90 transition-colors shadow-lg shadow-[#0052cc]/20"
          >
            {t("landing.hero.ctaPrimary")}
          </Link>
          <a
            href="#metrics"
            className="px-6 py-3 rounded-md bg-[#1e1e1e]/80 backdrop-blur-md border border-[#363636] text-[#dfdfdf] font-medium hover:bg-[#292929] transition-colors"
          >
            {t("landing.hero.ctaSecondary")}
          </a>
        </div>

        <div className="mt-16 [perspective:1000px]">
          <div
            ref={cardRef}
            className="relative mx-auto rounded-xl overflow-hidden border border-[#363636] bg-[#1e1e1e]/90 backdrop-blur-md shadow-2xl max-w-5xl opacity-0 transition-shadow duration-500 hover:shadow-[#0052cc]/20"
          >
            <Image
              src="/images/hero-canvas-preview.png"
              alt="Qolqa Canvas Real-time Editor"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};
