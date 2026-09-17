import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Dispatch, SetStateAction } from "react";

vi.mock("@fsd/features/auth", () => ({
	LoginForm: () => <div data-testid="login-form" />,
	useLoginFlow: vi.fn(),
	GoogleLoginButton: () => <div data-testid="google-login-button" />,
}));

vi.mock("./AuthToggle", () => ({
	AuthToggle: ({ isSignUp, onToggle }: { isSignUp: boolean; onToggle: (v: boolean) => void }) => (
		<button data-testid="auth-toggle" onClick={() => onToggle(!isSignUp)}>
			Toggle
		</button>
	),
}));

vi.mock("./StatusMessages", () => ({
	StatusMessages: () => <div data-testid="status-messages" />,
}));

vi.mock("@fsd/shared/ui/logo", () => ({
	Logo: () => <div data-testid="logo" />,
}));

import { AuthFlow } from "./AuthFlow";
import { useLoginFlow } from "@fsd/features/auth";

const mockUseLoginFlow = vi.mocked(useLoginFlow);

describe("AuthFlow", () => {
	it("renders GoogleLoginButton when in sign-in mode (isSignUp=false)", () => {
		mockUseLoginFlow.mockReturnValue({
			isSignUp: false,
			setIsSignUp: vi.fn() as unknown as Dispatch<SetStateAction<boolean>>,
			optimisticState: { status: "idle" },
			currentErrors: null,
			handleFormSubmit: vi.fn(),
		});

		render(<AuthFlow />);

		expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
	});

	it("does NOT render GoogleLoginButton when in sign-up mode (isSignUp=true)", () => {
		mockUseLoginFlow.mockReturnValue({
			isSignUp: true,
			setIsSignUp: vi.fn() as unknown as Dispatch<SetStateAction<boolean>>,
			optimisticState: { status: "idle" },
			currentErrors: null,
			handleFormSubmit: vi.fn(),
		});

		render(<AuthFlow />);

		expect(screen.queryByTestId("google-login-button")).not.toBeInTheDocument();
	});

	it("toggles between sign-in and sign-up modes", async () => {
		const user = userEvent.setup();
		let isSignUp = false;
		const setIsSignUp = vi.fn((v: boolean) => {
			isSignUp = v;
		}) as unknown as Dispatch<SetStateAction<boolean>>;

		mockUseLoginFlow.mockImplementation(() => ({
			isSignUp,
			setIsSignUp,
			optimisticState: { status: "idle" },
			currentErrors: null,
			handleFormSubmit: vi.fn(),
		}));

		const { rerender } = render(<AuthFlow />);

		expect(screen.getByTestId("google-login-button")).toBeInTheDocument();

		// After toggle, mock returns isSignUp=true
		mockUseLoginFlow.mockReturnValue({
			isSignUp: true,
			setIsSignUp,
			optimisticState: { status: "idle" },
			currentErrors: null,
			handleFormSubmit: vi.fn(),
		});

		await user.click(screen.getByTestId("auth-toggle"));
		rerender(<AuthFlow />);

		expect(screen.queryByTestId("google-login-button")).not.toBeInTheDocument();
	});
});
