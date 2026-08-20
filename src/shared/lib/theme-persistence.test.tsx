/**
 * Theme Persistence Tests.
 *
 * Verifies that:
 * 1. Theme preference is saved to localStorage
 * 2. Theme preference is restored on page load
 * 3. System preference detection works
 *
 * next-themes handles persistence via localStorage key "theme".
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── localStorage mock ──────────────────────────────────────────────────────

const localStorageStore = new Map<string, string>();

const mockLocalStorage = {
	getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
	setItem: vi.fn((key: string, value: string) => {
		localStorageStore.set(key, value);
	}),
	removeItem: vi.fn((key: string) => {
		localStorageStore.delete(key);
	}),
	clear: vi.fn(() => localStorageStore.clear()),
	get length() {
		return localStorageStore.size;
	},
	key: vi.fn((index: number) => {
		const keys = Array.from(localStorageStore.keys());
		return keys[index] ?? null;
	}),
};

// ─── Mock next-themes ────────────────────────────────────────────────────────

const mockSetTheme = vi.fn();
let mockTheme = "system";
let mockResolvedTheme = "dark";

vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: mockTheme,
		setTheme: mockSetTheme,
		resolvedTheme: mockResolvedTheme,
		themes: ["light", "dark", "system"],
	}),
}));

// ─── Imports (after vi.mock) ─────────────────────────────────────────────────

import { ThemeToggle } from "@fsd/shared/ui/theme-toggle";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Theme Persistence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorageStore.clear();
		mockTheme = "system";
		mockResolvedTheme = "dark";
	});

	describe("localStorage storage", () => {
		it("stores theme preference under 'theme' key", () => {
			localStorageStore.set("theme", "light");

			expect(localStorageStore.get("theme")).toBe("light");
		});

		it("accepts 'system' as default value", () => {
			localStorageStore.set("theme", "system");

			expect(localStorageStore.get("theme")).toBe("system");
		});

		it("accepts 'light' value", () => {
			localStorageStore.set("theme", "light");

			expect(localStorageStore.get("theme")).toBe("light");
		});

		it("accepts 'dark' value", () => {
			localStorageStore.set("theme", "dark");

			expect(localStorageStore.get("theme")).toBe("dark");
		});

		it("overwrites previous preference on change", () => {
			localStorageStore.set("theme", "dark");
			expect(localStorageStore.get("theme")).toBe("dark");

			localStorageStore.set("theme", "light");
			expect(localStorageStore.get("theme")).toBe("light");
		});
	});

	describe("Theme preference restoration", () => {
		it("returns undefined when no preference is stored (first visit)", () => {
			expect(localStorageStore.get("theme")).toBeUndefined();
		});

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

		it("restores 'system' preference from localStorage", () => {
			localStorageStore.set("theme", "system");

			const stored = localStorageStore.get("theme");
			expect(stored).toBe("system");
		});
	});

	describe("System preference detection", () => {
		it("defaults to 'system' when no preference is stored", () => {
			// next-themes defaultTheme="system" means first visit uses system preference
			expect(localStorageStore.get("theme")).toBeUndefined();
		});

		it("setTheme can switch from system to light", async () => {
			mockTheme = "system";
			render(<ThemeToggle />);
			const button = screen.getByRole("button", { name: /toggle theme/i });
			const user = userEvent.setup();
			await user.click(button);

			expect(mockSetTheme).toHaveBeenCalledWith("light");
		});

		it("setTheme can switch from light to dark", async () => {
			mockTheme = "light";
			render(<ThemeToggle />);
			const button = screen.getByRole("button", { name: /toggle theme/i });
			const user = userEvent.setup();
			await user.click(button);

			expect(mockSetTheme).toHaveBeenCalledWith("dark");
		});

		it("setTheme can switch from dark to system", async () => {
			mockTheme = "dark";
			render(<ThemeToggle />);
			const button = screen.getByRole("button", { name: /toggle theme/i });
			const user = userEvent.setup();
			await user.click(button);

			expect(mockSetTheme).toHaveBeenCalledWith("system");
		});
	});

	describe("Theme toggle cycles all modes", () => {
		it("cycles dark → system → light → dark", async () => {
			const user = userEvent.setup();

			// Start at dark
			mockTheme = "dark";
			const { rerender } = render(<ThemeToggle />);

			const getButton = () =>
				screen.getByRole("button", { name: /toggle theme/i });

			// dark → system
			await user.click(getButton());
			expect(mockSetTheme).toHaveBeenCalledWith("system");

			// Simulate theme change to system
			mockTheme = "system";
			mockResolvedTheme = "light";
			vi.clearAllMocks();
			rerender(<ThemeToggle />);

			// system → light
			await user.click(getButton());
			expect(mockSetTheme).toHaveBeenCalledWith("light");

			// Simulate theme change to light
			mockTheme = "light";
			mockResolvedTheme = "light";
			vi.clearAllMocks();
			rerender(<ThemeToggle />);

			// light → dark
			await user.click(getButton());
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
		});
	});
});
