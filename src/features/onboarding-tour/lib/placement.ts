import type { TourPlacement } from "../model/types";

export type Rect = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Point = { top: number; left: number };
export type CardPosition = Point & {
	placement: TourPlacement | "center";
	/** Distance from the card's top (left/right) or left (top/bottom) edge to the arrow. */
	arrowOffset: number;
};

/** Smallest rectangle containing every given rectangle (null when empty). */
export function unionRect(rects: Rect[]): Rect | null {
	if (rects.length === 0) return null;
	const top = Math.min(...rects.map((rect) => rect.top));
	const left = Math.min(...rects.map((rect) => rect.left));
	const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));
	const right = Math.max(...rects.map((rect) => rect.left + rect.width));
	return { top, left, width: right - left, height: bottom - top };
}

const GAP = 16;
const MARGIN = 12;
const ARROW_INSET = 20;

const ORDER: Record<TourPlacement, TourPlacement[]> = {
	right: ["right", "left", "bottom", "top"],
	left: ["left", "right", "bottom", "top"],
	bottom: ["bottom", "top", "right", "left"],
	top: ["top", "bottom", "right", "left"],
};

const positionFor = (
	placement: TourPlacement,
	target: Rect,
	card: Size,
): Point => {
	const centerX = target.left + target.width / 2 - card.width / 2;
	const centerY = target.top + target.height / 2 - card.height / 2;
	switch (placement) {
		case "right":
			return { top: centerY, left: target.left + target.width + GAP };
		case "left":
			return { top: centerY, left: target.left - card.width - GAP };
		case "bottom":
			return { top: target.top + target.height + GAP, left: centerX };
		case "top":
			return { top: target.top - card.height - GAP, left: centerX };
	}
};

const fitsOnMainAxis = (
	placement: TourPlacement,
	point: Point,
	card: Size,
	viewport: Size,
) => {
	if (placement === "right") return point.left + card.width <= viewport.width - MARGIN;
	if (placement === "left") return point.left >= MARGIN;
	if (placement === "bottom") return point.top + card.height <= viewport.height - MARGIN;
	return point.top >= MARGIN;
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Picks the first placement (starting from the preferred one) where the card
 * fits next to the target, then clamps it inside the viewport.
 * Without a target the card is centered.
 */
export function computeCardPosition(
	target: Rect | null,
	card: Size,
	viewport: Size,
	preferred: TourPlacement = "right",
): CardPosition {
	if (!target) {
		return {
			top: clamp((viewport.height - card.height) / 2, MARGIN, viewport.height),
			left: clamp((viewport.width - card.width) / 2, MARGIN, viewport.width),
			placement: "center",
			arrowOffset: 0,
		};
	}

	const candidates = ORDER[preferred];
	const placement =
		candidates.find((candidate) =>
			fitsOnMainAxis(candidate, positionFor(candidate, target, card), card, viewport),
		) ?? preferred;
	const point = positionFor(placement, target, card);
	const top = clamp(point.top, MARGIN, viewport.height - card.height - MARGIN);
	const left = clamp(point.left, MARGIN, viewport.width - card.width - MARGIN);

	const isHorizontal = placement === "left" || placement === "right";
	const arrowOffset = isHorizontal
		? clamp(target.top + target.height / 2 - top, ARROW_INSET, card.height - ARROW_INSET)
		: clamp(target.left + target.width / 2 - left, ARROW_INSET, card.width - ARROW_INSET);

	return { top, left, placement, arrowOffset };
}
