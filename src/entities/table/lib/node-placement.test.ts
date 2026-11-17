import { describe, expect, it } from "vitest";
import { DEFAULT_NODE_SIZE, findFreeNodePosition } from "./node-placement";

const node = (x: number, y: number, width?: number, height?: number) => ({
	position: { x, y },
	measured: width && height ? { width, height } : undefined,
});

const overlaps = (
	a: { x: number; y: number },
	b: { x: number; y: number; width: number; height: number },
) =>
	a.x < b.x + b.width &&
	a.x + DEFAULT_NODE_SIZE.width > b.x &&
	a.y < b.y + b.height &&
	a.y + DEFAULT_NODE_SIZE.height > b.y;

describe("findFreeNodePosition", () => {
	it("places the first node at the origin", () => {
		expect(findFreeNodePosition([])).toEqual({ x: 0, y: 0 });
	});

	it("places the next node beside the existing one", () => {
		const position = findFreeNodePosition([node(0, 0)]);
		expect(position).toEqual({ x: DEFAULT_NODE_SIZE.width + 60, y: 0 });
	});

	it("never overlaps measured nodes, even tall ones", () => {
		const existing = [node(0, 0, 300, 700), node(320, 0, 260, 180)];
		const position = findFreeNodePosition(existing);
		for (const item of existing) {
			expect(
				overlaps(position, {
					...item.position,
					width: item.measured?.width ?? 0,
					height: item.measured?.height ?? 0,
				}),
			).toBe(false);
		}
	});

	it("fills a gap left by a deleted node", () => {
		const step = DEFAULT_NODE_SIZE.width + 60;
		const position = findFreeNodePosition([node(step, 0), node(0, 240)]);
		expect(position).toEqual({ x: 0, y: 0 });
	});
});
