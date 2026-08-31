import { SmoothScrollProvider } from "@fsd/widgets/smooth-scroll";
import { PreloaderWidget } from "@fsd/widgets/preloader";
import { ElectricBackgroundWidget } from "@fsd/widgets/electric-background";
import { LandingHeaderWidget } from "@fsd/widgets/landing-header";
import { LandingHeroWidget } from "@fsd/widgets/landing-hero";
import { LandingFeaturesWidget } from "@fsd/widgets/landing-features";
import { LandingMetricsWidget } from "@fsd/widgets/landing-metrics";
import { LandingTeamWidget } from "@fsd/widgets/landing-team";
import { LandingDonationWidget } from "@fsd/widgets/landing-donation";

export function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="relative bg-background text-foreground min-h-screen overflow-x-hidden">
        {/* Header Fijo */}
        <LandingHeaderWidget />

        {/* Loader Awwwards */}
        <PreloaderWidget />

        {/* Canvas de Fondo Electrónico */}
        <ElectricBackgroundWidget />

        {/* Contenido principal con padding-top por el Header */}
        <main className="relative z-10 pt-16">
          <LandingHeroWidget />
          <LandingFeaturesWidget />
          <LandingMetricsWidget />

          <LandingTeamWidget />

          <LandingDonationWidget />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
