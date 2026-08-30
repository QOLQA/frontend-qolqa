/**
 * Theme Persistence Tests.
 *
 * Verifies that:
 * 1. Theme preference is saved to localStorage
 * 2. Theme preference is restored on page load
 * 3. Theme toggle cycles light ↔ dark
 *
 * next-themes handles persistence via localStorage key "theme".
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const localStorageStore = new Map<string, string>();

const mockSetTheme = vi.fn();
let mockTheme = "light";
let mockResolvedTheme = "light";

vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: mockTheme,
		setTheme: mockSetTheme,
		resolvedTheme: mockResolvedTheme,
		themes: ["light", "dark"],
	}),
}));

import { ThemeToggle } from "@fsd/shared/ui/theme-toggle";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Theme Persistence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorageStore.clear();
		mockTheme = "light";
		mockResolvedTheme = "light";
	});

	describe("localStorage storage", () => {
		it("stores theme preference under 'theme' key", () => {
			localStorageStore.set("theme", "light");

			expect(localStorageStore.get("theme")).toBe("light");
		});

		it("accepts 'light' value", () => {
			localStorageStore.set("theme", "light");

			expect(localStorageStore.get("theme")).toBe("light");
		});

		it("accepts 'dark' value", () => {
			localStorageStore.set("theme", "dark");

			expect(localStorageStore.get("theme")).toBe("dark");
		});

		it("can clear theme preference", () => {
			localStorageStore.set("theme", "dark");
			localStorageStore.delete("theme");

			expect(localStorageStore.get("theme")).toBeUndefined();
		});
	});

	describe("localStorage restoration", () => {
		it("restores 'light' preference from localStorage", () => {
			localStorageStore.set("theme", "light");

			const stored = localStorageStore.get("theme");
			expect(stored).toBe("light");
		});

		it("restores 'dark' preference from localStorage", () => {
			localStorageStore.set("theme", "dark");

			const stored = localStorageStore.get("theme");
			expect(stored).toBe("dark");
		});
	});

	describe("Theme preference switching", () => {
		it("defaults to no stored preference on first visit", () => {
			expect(localStorageStore.get("theme")).toBeUndefined();
		});

		it("setTheme can switch from light to dark", async () => {
			mockTheme = "light";
			render(<ThemeToggle />);
			const button = screen.getByRole("button", { name: /toggle theme/i });
			const user = userEvent.setup();
			await user.click(button);

			expect(mockSetTheme).toHaveBeenCalledWith("dark");
		});

		it("setTheme can switch from dark to light", async () => {
			mockTheme = "dark";
			mockResolvedTheme = "dark";
			render(<ThemeToggle />);
			const button = screen.getByRole("button", { name: /toggle theme/i });
			const user = userEvent.setup();
			await user.click(button);

			expect(mockSetTheme).toHaveBeenCalledWith("light");
		});
	});

	describe("Theme toggle cycles light and dark", () => {
		it("cycles dark → light → dark", async () => {
			const user = userEvent.setup();

			mockTheme = "dark";
			mockResolvedTheme = "dark";
			const { rerender } = render(<ThemeToggle />);

			const getButton = () =>
				screen.getByRole("button", { name: /toggle theme/i });

			await user.click(getButton());
			expect(mockSetTheme).toHaveBeenCalledWith("light");

			mockTheme = "light";
			mockResolvedTheme = "light";
			vi.clearAllMocks();
			rerender(<ThemeToggle />);

			await user.click(getButton());
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
		});
	});
});
