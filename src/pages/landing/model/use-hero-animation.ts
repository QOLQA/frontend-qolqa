"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const useHeroAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const playHeroAnimation = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          badgeRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
        )
          .fromTo(
            titleRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1 },
            "-=0.5",
          )
          .fromTo(
            subtitleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.6",
          )
          .fromTo(
            ctaRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.6",
          )
          .fromTo(
            cardRef.current,
            { scale: 0.92, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
            "-=0.8",
          );
      };

      window.addEventListener("preloaderComplete", playHeroAnimation);

      // Tilt 3D SOLO al hacer hover directo SOBRE la imagen/tarjeta
      const cardElement = cardRef.current;

      const handleMouseMove = (e: MouseEvent) => {
        if (!cardElement) return;
        const { left, top, width, height } =
          cardElement.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(cardElement, {
          rotateY: x * 15,
          rotateX: -y * 15,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        if (!cardElement) return;
        gsap.to(cardElement, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      };

      if (cardElement) {
        cardElement.addEventListener("mousemove", handleMouseMove);
        cardElement.addEventListener("mouseleave", handleMouseLeave);
      }

      return () => {
        window.removeEventListener("preloaderComplete", playHeroAnimation);
        if (cardElement) {
          cardElement.removeEventListener("mousemove", handleMouseMove);
          cardElement.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
    },
    { scope: containerRef },
  );

  return { containerRef, badgeRef, titleRef, subtitleRef, ctaRef, cardRef };
};
