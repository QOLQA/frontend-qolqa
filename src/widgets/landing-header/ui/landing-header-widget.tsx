"use client";

import Link from "next/link";
import { Logo as LogoSvg } from "@fsd/shared/ui/icons/HeaderIcons";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

export const LandingHeaderWidget = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f]/60 backdrop-blur-md border-b border-[#363636]/40 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Qolqa */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoSvg className="h-7 w-auto text-blue" />
        </Link>

        {/* Botón de Acceso / Login */}
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-[#1e1e1e] border border-[#363636] text-xs font-mono text-[#dfdfdf] hover:border-[#0052cc] hover:text-[#0052cc] transition-all duration-200"
        >
          Log In
        </Link>
      </div>
    </header>
  );
};
