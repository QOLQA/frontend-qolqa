"use client";

import { Logo as LogoSvg } from "@fsd/shared/ui/icons/HeaderIcons";
import { usePreloaderAnimation } from "../model/use-preloader-animation";

export const PreloaderWidget = () => {
  const { containerRef, logoRef, ringRef, numberRef, isFinished } =
    usePreloaderAnimation();

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f0f] text-[#dfdfdf]"
    >
      <div ref={logoRef} className="relative flex flex-col items-center">
        {/* Anillo de pulso de energía eléctrica */}
        <div
          ref={ringRef}
          className="absolute -inset-13 aspect-square rounded-full border border-dashed border-[#0052cc]/60 shadow-[0_0_40px_rgba(0,82,204,0.4)] pointer-events-none"
        />

        <div className="relative top-1/2 -translate-y-[10px] flex flex-col items-center gap-3">
          {/* Logo de Qolqa */}
          <LogoSvg className="w-48 h-auto drop-shadow-[0_0_20px_rgba(0,82,204,0.8)] text-blue" />

          {/* Contador porcentual */}
          <div className="flex items-baseline gap-1 font-mono text-3xl font-bold tracking-tighter">
            <span ref={numberRef}>0</span>
            <span className="text-xs text-[#0052cc]">%</span>
          </div>

          <p className="text-xs font-mono text-[#747474] mt-2 tracking-widest uppercase">
            Initializing Engine...
          </p>
        </div>
      </div>
    </div>
  );
};
