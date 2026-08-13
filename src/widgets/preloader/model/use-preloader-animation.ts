"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const usePreloaderAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const [isFinished, setIsFinished] = useState(false);

  useGSAP(
    () => {
      const counterObj = { value: 0 };

      // Animación de rotación continua
      gsap.to(ringRef.current, {
        rotate: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          // Avisar globalmente que el preloader terminó
          window.dispatchEvent(new Event("preloaderComplete"));
          // Recalcular posiciones de scroll en todo el DOM
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        },
      });

      // Conteo 0 - 100%
      tl.to(counterObj, {
        value: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerText = `${Math.floor(counterObj.value)}`;
          }
        },
      })
        .to(logoRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        })
        .to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
        });
    },
    { scope: containerRef },
  );

  return { containerRef, logoRef, ringRef, numberRef, isFinished };
};
