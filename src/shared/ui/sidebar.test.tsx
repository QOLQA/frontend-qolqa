import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SidebarMenuSkeleton } from "./sidebar";

const skeletonWidths = (container: HTMLElement): string[] =>
	Array.from(
		container.querySelectorAll<HTMLElement>(
			'[data-sidebar="menu-skeleton-text"]',
		),
	).map((node) => node.style.getPropertyValue("--skeleton-width"));

describe("SidebarMenuSkeleton", () => {
	it("gives each mounted skeleton its own width within the 50-89% range", () => {
		const { container } = render(
			<div>
				<SidebarMenuSkeleton />
				<SidebarMenuSkeleton />
			</div>,
		);

		const widths = skeletonWidths(container);

		expect(widths).toHaveLength(2);
		for (const width of widths) {
			expect(width).toMatch(/^\d+%$/);
			const percent = Number.parseInt(width, 10);
			expect(percent).toBeGreaterThanOrEqual(50);
			expect(percent).toBeLessThanOrEqual(89);
		}
		expect(widths[0]).not.toBe(widths[1]);
	});

	it("keeps the width of the same instance stable across re-renders", () => {
		const { container, rerender } = render(<SidebarMenuSkeleton />);
		const [initialWidth] = skeletonWidths(container);

		expect(initialWidth).toMatch(/^\d+%$/);

		rerender(<SidebarMenuSkeleton />);
		rerender(<SidebarMenuSkeleton />);

		const [widthAfterRerender] = skeletonWidths(container);
		expect(widthAfterRerender).toBe(initialWidth);
	});
});
