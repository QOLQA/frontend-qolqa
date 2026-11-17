"use client";

import { cn } from "@fsd/shared/lib/classnames";
import type { Rect } from "../lib/placement";

const PADDING = 6;

type TourSpotlightProps = {
	rect: Rect | null;
	/** Dim the rest of the page. */
	dim: boolean;
};

export function TourSpotlight({ rect, dim }: TourSpotlightProps) {
	if (!rect) {
		return dim ? (
			<div
				aria-hidden
				className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[2px] pointer-events-none motion-safe:animate-tour-pop"
			/>
		) : null;
	}

	return (
		<div
			aria-hidden
			className={cn(
				"fixed z-[9990] rounded-xl pointer-events-none",
				"motion-safe:transition-[top,left,width,height] motion-safe:duration-300 ease-out",
				dim && "shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]",
			)}
			style={{
				top: rect.top - PADDING,
				left: rect.left - PADDING,
				width: rect.width + PADDING * 2,
				height: rect.height + PADDING * 2,
			}}
		>
			<span className="absolute inset-0 rounded-xl border-2 border-blue motion-safe:animate-tour-glow" />
		</div>
	);
}
