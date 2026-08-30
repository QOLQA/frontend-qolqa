"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@fsd/shared/lib/classnames";

const THEME_CYCLE = ["light", "dark"] as const;

function getNextTheme(current: string | undefined): string {
	const resolved =
		current === "light" || current === "dark" ? current : "light";
	const idx = THEME_CYCLE.indexOf(resolved);
	return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}

function ThemeToggle({ className }: { className?: string }) {
	const { theme, resolvedTheme, setTheme } = useTheme();

	function handleClick() {
		setTheme(getNextTheme(theme ?? resolvedTheme));
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			aria-label="Toggle theme"
			onClick={handleClick}
			className={cn(
				"relative inline-flex items-center justify-center rounded-xl p-2 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
				className,
			)}
		>
			<Sun
				className={cn(
					"size-5 rotate-0 scale-100 transition-all",
					isDark && "-rotate-90 scale-0",
				)}
			/>
			<Moon
				className={cn(
					"absolute size-5 rotate-90 scale-0 transition-all",
					isDark && "rotate-0 scale-100",
				)}
			/>
			<span className="sr-only">Toggle theme</span>
		</button>
	);
}

export { ThemeToggle };
