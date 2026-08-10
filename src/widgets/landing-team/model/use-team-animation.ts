"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const useTeamAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const initAnimation = () => {
        const cards = containerRef.current?.querySelectorAll(".team-card");
        if (!cards || cards.length === 0) return;

        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      };

      initAnimation();
      window.addEventListener("preloaderComplete", initAnimation);

      return () => {
        window.removeEventListener("preloaderComplete", initAnimation);
      };
    },
    { scope: containerRef },
  );

  return { containerRef };
};
