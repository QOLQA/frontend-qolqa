"use client";

import Image from "next/image";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useTeamAnimation } from "../model/use-team-animation";

interface Member {
  name: string;
  role: string;
  image: string;
}

const TEAM_MEMBERS: Member[] = [
  {
    name: "Dr. Harley Vera Olivera",
    role: "",
    image: "/team/integrante-harley.jpg",
  },
  {
    name: "Br. Anghelo Alagon Fernandez",
    role: "",
    image: "/team/integrante-anghelo.jpg",
  },
  {
    name: "Br. Yerson Chirinos Vilca",
    role: "",
    image: "/team/integrante-chiri.jpeg",
  },
];

export const LandingTeamWidget = () => {
  const { t } = useTranslation();
  const { containerRef } = useTeamAnimation();

  return (
    <section
      ref={containerRef}
      className="py-24 bg-transparent border-t border-[#363636]/40"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-wider text-[#0052cc] uppercase">
            {t("landing.team.tag")}
          </span>
          <h2 className="text-h2 font-bold text-[#dfdfdf] mt-2">
            {t("landing.team.title")}
          </h2>
          <p className="text-p-sm text-[#747474] mt-2">
            {t("landing.team.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={index}
              className="team-card group p-6 rounded-xl bg-[#1e1e1e]/80 backdrop-blur-md border border-[#363636] hover:border-[#0052cc] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#232323] mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h3 className="text-h4 font-semibold text-[#dfdfdf]">
                {member.name}
              </h3>
              <p className="text-xs text-[#747474] mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
