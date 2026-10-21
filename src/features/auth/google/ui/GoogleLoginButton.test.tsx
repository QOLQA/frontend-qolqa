import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSubmit = vi.fn();

vi.mock("@react-oauth/google", () => ({
	GoogleLogin: ({
		onSuccess,
		onError,
	}: {
		onSuccess: (credentialResponse: { credential?: string }) => void;
		onError: () => void;
	}) => (
		<>
			<button
				data-testid="mock-google-btn"
				onClick={() => onSuccess({ credential: "test-token" })}
			>
				Google Login
			</button>
			<button data-testid="mock-google-btn-error" onClick={() => onError()}>
				Google Login Error
			</button>
		</>
	),
}));

vi.mock("@fsd/features/auth/google/model/use-google-login", () => ({
	useGoogleLogin: () => ({
		submit: mockSubmit,
		error: null,
	}),
}));

import { GoogleLoginButton } from "./GoogleLoginButton";

describe("GoogleLoginButton", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("renders Google login button when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set", () => {
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";

		render(<GoogleLoginButton />);

		expect(screen.getByTestId("mock-google-btn")).toBeInTheDocument();
	});

	it("shows Spanish message when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset", () => {
		delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

		render(<GoogleLoginButton />);

		expect(
			screen.getByText("Login con Google no disponible."),
		).toBeInTheDocument();
		expect(screen.queryByTestId("mock-google-btn")).not.toBeInTheDocument();
	});

	it("calls submit with credential on successful Google login", async () => {
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";
		const user = userEvent.setup();

		render(<GoogleLoginButton />);

		await user.click(screen.getByTestId("mock-google-btn"));

		expect(mockSubmit).toHaveBeenCalledWith("test-token");
	});

	it("shows Spanish error message when Google GSI triggers onError", async () => {
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";
		const user = userEvent.setup();

		render(<GoogleLoginButton />);

		await user.click(screen.getByTestId("mock-google-btn-error"));

		expect(
			screen.getByText(
				"No se pudo abrir el login de Google. Intentá de nuevo.",
			),
		).toBeInTheDocument();
		expect(mockSubmit).not.toHaveBeenCalled();
	});
});
