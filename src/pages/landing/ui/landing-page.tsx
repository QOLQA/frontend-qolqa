import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { LandingPreloader } from "./preloader";
import { LandingElectricBackground } from "./electric-background";
import { LandingHeader } from "./header";
import { LandingHero } from "./hero";
import { LandingFeatures } from "./features";
import { LandingMetrics } from "./metrics";
import { LandingTeam } from "./team";
import { LandingDonation } from "./donation";

export function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="relative bg-background text-foreground min-h-screen overflow-x-hidden">
        <LandingHeader />
        <LandingPreloader />
        <LandingElectricBackground />

        <main className="relative z-10 pt-16">
          <LandingHero />
          <LandingFeatures />
          <LandingMetrics />
          <LandingTeam />
          <LandingDonation />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
