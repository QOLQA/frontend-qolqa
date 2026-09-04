import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useGoogleLogin } from "./use-google-login";
import { AuthContext } from "@fsd/features/auth/model/auth-context";
import type { AuthContextType } from "@fsd/features/auth/model/auth-context";

const mockGoogleLogin = vi.fn();

const { mockPush, mockRefresh, mockSearchParams } = vi.hoisted(() => ({
	mockPush: vi.fn(),
	mockRefresh: vi.fn(),
	mockSearchParams: { get: vi.fn((): string | null => null) },
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
	useSearchParams: () => mockSearchParams,
}));

function createWrapper(overrides?: Partial<AuthContextType>) {
	const value: AuthContextType = {
		user: null,
		loading: false,
		error: null,
		login: vi.fn(),
		googleLogin: mockGoogleLogin,
		register: vi.fn(),
		logout: vi.fn(),
		refreshUser: vi.fn(),
		isAuthenticated: false,
		...overrides,
	};

	return function Wrapper({ children }: { children: ReactNode }) {
		return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
	};
}

describe("useGoogleLogin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSearchParams.get.mockReturnValue(null);
	});

	it("does not call googleLogin on empty credential", async () => {
		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("");
		});

		expect(mockGoogleLogin).not.toHaveBeenCalled();
	});

	it("calls googleLogin with credential on valid input", async () => {
		mockGoogleLogin.mockResolvedValueOnce({ access_token: "tok" });

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("google-cred");
		});

		expect(mockGoogleLogin).toHaveBeenCalledWith("google-cred");
		expect(result.current.error).toBeNull();
	});

	it("surfaces error message when googleLogin throws", async () => {
		mockGoogleLogin.mockRejectedValueOnce(
			new Error("Token de Google inválido. Intentá de nuevo."),
		);

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("bad-cred");
		});

		expect(result.current.error).toBe(
			"Token de Google inválido. Intentá de nuevo.",
		);
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("redirects to /projects on successful submit", async () => {
		mockGoogleLogin.mockResolvedValueOnce({ access_token: "tok" });

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("google-cred");
		});

		expect(mockRefresh).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith("/projects");
	});

	it("redirects to the redirect search param when present", async () => {
		mockGoogleLogin.mockResolvedValueOnce({ access_token: "tok" });
		mockSearchParams.get.mockReturnValue("/modeling");

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("google-cred");
		});

		expect(mockPush).toHaveBeenCalledWith("/modeling");
	});

	it("falls back to /projects when redirect is an external URL", async () => {
		mockGoogleLogin.mockResolvedValueOnce({ access_token: "tok" });
		mockSearchParams.get.mockReturnValue("https://evil.com");

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("google-cred");
		});

		expect(mockPush).toHaveBeenCalledWith("/projects");
	});

	it("falls back to /projects when redirect starts with //", async () => {
		mockGoogleLogin.mockResolvedValueOnce({ access_token: "tok" });
		mockSearchParams.get.mockReturnValue("//evil.com");

		const { result } = renderHook(() => useGoogleLogin(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.submit("google-cred");
		});

		expect(mockPush).toHaveBeenCalledWith("/projects");
	});
});
