import { describe, expect, it } from "vitest";
import { computeCardPosition, unionRect } from "./placement";

describe("unionRect", () => {
	it("returns null without rectangles", () => {
		expect(unionRect([])).toBeNull();
	});

	it("covers every rectangle", () => {
		expect(
			unionRect([
				{ top: 100, left: 50, width: 200, height: 100 },
				{ top: 300, left: 400, width: 150, height: 80 },
			]),
		).toEqual({ top: 100, left: 50, width: 500, height: 280 });
	});
});

const viewport = { width: 1200, height: 800 };
const card = { width: 300, height: 200 };

describe("computeCardPosition", () => {
	it("centers the card when there is no target", () => {
		const result = computeCardPosition(null, card, viewport);
		expect(result).toEqual({
			top: 300,
			left: 450,
			placement: "center",
			arrowOffset: 0,
		});
	});

	it("uses the preferred side when it fits", () => {
		const target = { top: 300, left: 100, width: 100, height: 50 };
		const result = computeCardPosition(target, card, viewport, "right");
		expect(result.placement).toBe("right");
		expect(result.left).toBe(216);
	});

	it("flips to the opposite side when the preferred one overflows", () => {
		const target = { top: 300, left: 1050, width: 100, height: 50 };
		const result = computeCardPosition(target, card, viewport, "right");
		expect(result.placement).toBe("left");
		expect(result.left).toBe(1050 - 300 - 16);
	});

	it("keeps the card inside the viewport", () => {
		const target = { top: 0, left: 0, width: 50, height: 20 };
		const result = computeCardPosition(target, card, viewport, "top");
		expect(result.top).toBeGreaterThanOrEqual(12);
		expect(result.left).toBeGreaterThanOrEqual(12);
	});

	it("points the arrow at the target center", () => {
		const target = { top: 300, left: 100, width: 100, height: 50 };
		const result = computeCardPosition(target, card, viewport, "right");
		expect(result.top + result.arrowOffset).toBe(325);
	});

	it("keeps the arrow inside the card", () => {
		const target = { top: 2, left: 100, width: 100, height: 10 };
		const result = computeCardPosition(target, card, viewport, "right");
		expect(result.arrowOffset).toBeGreaterThanOrEqual(20);
	});
});
