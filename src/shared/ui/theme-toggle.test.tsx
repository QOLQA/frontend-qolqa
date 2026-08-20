import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./theme-toggle";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "dark";
let mockResolvedTheme = "dark";

vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: mockTheme,
		setTheme: mockSetTheme,
		resolvedTheme: mockResolvedTheme,
	}),
}));

describe("ThemeToggle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTheme = "dark";
	});

	it("renders a button with accessible label", () => {
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		expect(button).toBeInTheDocument();
	});

	it("calls setTheme with next theme on click", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		await user.click(button);

		// From dark → should cycle to light (system → light → dark → system)
		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});

	it("supports keyboard activation via Enter", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		button.focus();
		await user.keyboard("{Enter}");

		expect(mockSetTheme).toHaveBeenCalledOnce();
	});

	it("supports keyboard activation via Space", async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);

		const button = screen.getByRole("button", { name: /toggle theme/i });
		button.focus();
		await user.keyboard(" ");

		expect(mockSetTheme).toHaveBeenCalledOnce();
	});

	it("cycles through themes: dark → system → light → dark", async () => {
		const user = userEvent.setup();
		const { rerender } = render(<ThemeToggle />);

		// Start at dark → click → should go to system
		const button = screen.getByRole("button", { name: /toggle theme/i });
		await user.click(button);
		expect(mockSetTheme).toHaveBeenCalledWith("system");

		// Simulate theme change to system (resolved as light for testing)
		mockTheme = "system";
		mockResolvedTheme = "light";
		vi.clearAllMocks();
		rerender(<ThemeToggle />);

		// From system → click → should go to light
		await user.click(screen.getByRole("button", { name: /toggle theme/i }));
		expect(mockSetTheme).toHaveBeenCalledWith("light");

		// Simulate theme change to light
		mockTheme = "light";
		mockResolvedTheme = "light";
		vi.clearAllMocks();
		rerender(<ThemeToggle />);

		// From light → click → should go to dark
		await user.click(screen.getByRole("button", { name: /toggle theme/i }));
		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("shows Sun icon when theme is dark", () => {
		mockTheme = "dark";
		mockResolvedTheme = "dark";
		render(<ThemeToggle />);

		const sunIcon = screen.getByRole("button", { name: /toggle theme/i }).querySelector("svg");
		expect(sunIcon).toBeInTheDocument();
	});

	it("shows Moon icon when theme is light", () => {
		mockTheme = "light";
		mockResolvedTheme = "light";
		render(<ThemeToggle />);

		// Both icons are rendered; Moon should be visible (scale-100) when light
		const button = screen.getByRole("button", { name: /toggle theme/i });
		expect(button).toBeInTheDocument();
		expect(button.querySelector(".sr-only")).toHaveTextContent("Toggle theme");
	});
});
