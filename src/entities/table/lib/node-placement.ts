import type { Node } from "@xyflow/react";

type Size = { width: number; height: number };
type Position = { x: number; y: number };

/** Used for nodes React Flow has not measured yet (and for the new node). */
export const DEFAULT_NODE_SIZE: Size = { width: 260, height: 180 };
const GAP = 60;

/**
 * First free cell of a near-square grid (row by row from the origin) where a
 * node of `size` does not overlap any existing node, keeping a `GAP` between them.
 */
export function findFreeNodePosition(
	nodes: Pick<Node, "position" | "measured">[],
	size: Size = DEFAULT_NODE_SIZE,
): Position {
	const boxes = nodes.map((node) => ({
		...node.position,
		width: node.measured?.width ?? DEFAULT_NODE_SIZE.width,
		height: node.measured?.height ?? DEFAULT_NODE_SIZE.height,
	}));

	const isFree = ({ x, y }: Position) =>
		boxes.every(
			(box) =>
				x >= box.x + box.width + GAP ||
				x + size.width + GAP <= box.x ||
				y >= box.y + box.height + GAP ||
				y + size.height + GAP <= box.y,
		);

	const columns = Math.ceil(Math.sqrt(nodes.length + 1));
	for (let cell = 0; ; cell++) {
		const candidate = {
			x: (cell % columns) * (size.width + GAP),
			y: Math.floor(cell / columns) * (size.height + GAP),
		};
		if (isFree(candidate)) return candidate;
	}
}
