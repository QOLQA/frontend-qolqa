import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@react-oauth/google", () => ({
	GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="google-oauth-provider">{children}</div>
	),
}));

import { GoogleProvider } from "./GoogleProvider";

describe("GoogleProvider", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("renders GoogleOAuthProvider wrapper when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set", () => {
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";

		render(
			<GoogleProvider>
				<div data-testid="child">Hello</div>
			</GoogleProvider>,
		);

		expect(screen.getByTestId("google-oauth-provider")).toBeInTheDocument();
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("renders children directly when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset", () => {
		delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

		render(
			<GoogleProvider>
				<div data-testid="child">Hello</div>
			</GoogleProvider>,
		);

		expect(screen.queryByTestId("google-oauth-provider")).not.toBeInTheDocument();
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});
});
