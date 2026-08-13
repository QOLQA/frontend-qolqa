"use client";

import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useDonationAnimation } from "../model/use-donation-animation";

export const LandingDonationWidget = () => {
  const { t } = useTranslation();
  const { containerRef, buttonRef } = useDonationAnimation();

  return (
    <section
      ref={containerRef}
      className="py-20 bg-[#0f0f0f] border-t border-[#363636]/40"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-[#171717] border border-[#363636] text-center relative overflow-hidden">
          <span className="text-xs font-semibold tracking-wider text-[#0052cc] uppercase">
            {t("landing.donation.tag")}
          </span>
          <h2 className="text-h3 font-bold text-[#dfdfdf] mt-2 mb-4">
            {t("landing.donation.title")}
          </h2>
          <p className="text-p-sm text-[#747474] mb-8 max-w-xl mx-auto">
            {t("landing.donation.description")}
          </p>

          <a
            ref={buttonRef}
            href="https://paypal.me/your-paypal-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-md bg-[#0052cc] text-[#dfdfdf] font-medium hover:bg-[#0052cc]/90 transition-colors shadow-lg shadow-[#0052cc]/25"
          >
            {t("landing.donation.cta")}
          </a>
        </div>
      </div>
    </section>
  );
};
