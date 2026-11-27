import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const {
	mockPush,
	mockRefresh,
	mockLoginAction,
	mockRegisterAction,
	mockGoogleLoginAction,
	mockLogoutAction,
	mockRedirectToLogin,
} = vi.hoisted(() => ({
	mockPush: vi.fn(),
	mockRefresh: vi.fn(),
	mockLoginAction: vi.fn(),
	mockRegisterAction: vi.fn(),
	mockGoogleLoginAction: vi.fn(),
	mockLogoutAction: vi.fn(),
	mockRedirectToLogin: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("./auth-actions", () => ({
	loginAction: mockLoginAction,
	registerAction: mockRegisterAction,
	googleLoginAction: mockGoogleLoginAction,
	logoutAction: mockLogoutAction,
}));

vi.mock("@fsd/shared/api/redirect", () => ({
	LOGIN_PATH: "/login",
	redirectToLogin: mockRedirectToLogin,
}));

import { useAuth } from "./useAuth";
import { AUTH_NETWORK_ERROR_MESSAGE } from "./auth-action-results";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const user = {
	id: "u1",
	username: "tester",
	email: "tester@example.com",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

const okResponse = (data: unknown) => ({
	ok: true,
	status: 200,
	json: () => Promise.resolve(data),
});

const unauthorizedResponse = () => ({
	ok: false,
	status: 401,
	json: () => Promise.resolve({ detail: "Not authenticated" }),
});

const fetchCall = (index = 0) => mockFetch.mock.calls[index] as [string, RequestInit];

const waitForMount = async (result: { current: { loading: boolean } }) => {
	await waitFor(() => expect(result.current.loading).toBe(false));
};

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		mockFetch.mockReset();
		mockFetch.mockResolvedValue(okResponse(user));
	});

	describe("checkAuth", () => {
		it("probes /auth/me through the same-origin proxy", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, init] = fetchCall();
			expect(url).toBe("/api/auth/me");
			expect(init.headers).not.toHaveProperty("Authorization");
			expect(result.current.user).toEqual(user);
			expect(result.current.isAuthenticated).toBe(true);
		});

		it("keeps the caller on public pages when the probe returns 401", async () => {
			mockFetch.mockResolvedValue(unauthorizedResponse());

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			expect(result.current.user).toBeNull();
			expect(result.current.isAuthenticated).toBe(false);
			expect(mockRedirectToLogin).not.toHaveBeenCalled();
		});

		it("never writes a token to localStorage", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			expect(localStorage.length).toBe(0);
			expect(localStorage.getItem("access_token")).toBeNull();
		});
	});

	describe("login", () => {
		it("delegates to the login server action and refreshes the session", async () => {
			mockLoginAction.mockResolvedValueOnce({ ok: true, data: null });

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await result.current.login({ username: "ada", password: "secret" });
			});

			expect(mockLoginAction).toHaveBeenCalledWith({
				username: "ada",
				password: "secret",
			});
			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(fetchCall(1)[0]).toBe("/api/auth/me");
			expect(result.current.user).toEqual(user);
			expect(result.current.error).toBeNull();
			expect(localStorage.length).toBe(0);
		});

		it("surfaces the backend detail without signing the user in", async () => {
			mockLoginAction.mockResolvedValueOnce({
				ok: false,
				status: 401,
				detail: "Incorrect username or password",
			});

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(
					result.current.login({ username: "ada", password: "wrong" }),
				).rejects.toThrow("Incorrect username or password");
			});

			expect(result.current.error).toBe("Incorrect username or password");
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("joins field errors from validation failures", async () => {
			mockLoginAction.mockResolvedValueOnce({
				ok: false,
				status: 422,
				fieldErrors: ["field required", "too short"],
			});

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(
					result.current.login({ username: "", password: "" }),
				).rejects.toThrow("field required, too short");
			});
		});

		it("reports connection problems for network failures", async () => {
			mockLoginAction.mockResolvedValueOnce({ ok: false, status: 0 });

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(
					result.current.login({ username: "ada", password: "secret" }),
				).rejects.toThrow(AUTH_NETWORK_ERROR_MESSAGE);
			});
		});
	});

	describe("googleLogin", () => {
		it("exposes googleLogin as a function", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			expect(typeof result.current.googleLogin).toBe("function");
		});

		it("on success: delegates to the server action and refreshes the session", async () => {
			mockGoogleLoginAction.mockResolvedValueOnce({ ok: true, data: null });

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await result.current.googleLogin("valid-google-token");
			});

			expect(mockGoogleLoginAction).toHaveBeenCalledWith("valid-google-token");
			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(fetchCall(1)[0]).toBe("/api/auth/me");
			expect(localStorage.getItem("access_token")).toBeNull();
		});

		it.each([
			[401, "Token de Google inválido. Intentá de nuevo."],
			[
				403,
				"Esta cuenta usa login con contraseña. Usá el formulario de email/password.",
			],
			[429, "Demasiados intentos. Esperá un momento."],
			[503, "Login con Google no disponible temporalmente."],
		])("on %i: throws the mapped message", async (status, message) => {
			mockGoogleLoginAction.mockResolvedValueOnce({ ok: false, status });

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(result.current.googleLogin("token")).rejects.toThrow(
					message,
				);
			});

			expect(result.current.error).toBe(message);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockRedirectToLogin).not.toHaveBeenCalled();
		});

		it("on empty credential: throws before calling the action", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(result.current.googleLogin("")).rejects.toThrow(
					"Credencial de Google vacía",
				);
			});

			expect(mockGoogleLoginAction).not.toHaveBeenCalled();
		});
	});

	describe("register", () => {
		it("delegates to the register action and returns the created user", async () => {
			mockRegisterAction.mockResolvedValueOnce({ ok: true, data: user });

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			let created: unknown;
			await act(async () => {
				created = await result.current.register({
					username: "ada",
					email: "ada@example.com",
					password: "secret123",
				});
			});

			expect(mockRegisterAction).toHaveBeenCalledWith({
				username: "ada",
				email: "ada@example.com",
				password: "secret123",
			});
			expect(created).toEqual(user);
			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(localStorage.length).toBe(0);
		});

		it("surfaces a duplicate account failure", async () => {
			mockRegisterAction.mockResolvedValueOnce({
				ok: false,
				status: 409,
				detail: "Username already registered",
			});

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await expect(
					result.current.register({
						username: "ada",
						email: "ada@example.com",
						password: "secret123",
					}),
				).rejects.toThrow("Username already registered");
			});

			expect(result.current.error).toBe("Username already registered");
		});
	});

	describe("logout", () => {
		it("clears the server cookie before navigating and drops the user", async () => {
			const order: string[] = [];
			mockLogoutAction.mockImplementation(async () => {
				order.push("logoutAction");
			});
			mockPush.mockImplementation(() => {
				order.push("push");
			});

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);
			expect(result.current.user).toEqual(user);

			await act(async () => {
				await result.current.logout();
			});

			expect(mockLogoutAction).toHaveBeenCalledTimes(1);
			expect(order).toEqual(["logoutAction", "push"]);
			expect(mockPush).toHaveBeenCalledWith("/login");
			expect(mockRefresh).toHaveBeenCalled();
			expect(result.current.user).toBeNull();
			expect(result.current.error).toBeNull();
		});

		it("still signs the user out locally when the server call fails", async () => {
			mockLogoutAction.mockRejectedValueOnce(new Error("offline"));

			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			await act(async () => {
				await result.current.logout();
			});

			expect(mockPush).toHaveBeenCalledWith("/login");
			expect(result.current.user).toBeNull();
		});
	});

	describe("refreshUser", () => {
		it("re-reads the session through the proxy", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			const updated = { ...user, full_name: "Ada Lovelace" };
			mockFetch.mockResolvedValueOnce(okResponse(updated));

			await act(async () => {
				await result.current.refreshUser();
			});

			expect(mockFetch.mock.calls[1][0]).toBe("/api/auth/me");
			expect(result.current.user).toEqual(updated);
		});

		it("keeps the current user when the refresh fails", async () => {
			const { result } = renderHook(() => useAuth());
			await waitForMount(result);

			mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

			await act(async () => {
				await result.current.refreshUser();
			});

			expect(result.current.user).toEqual(user);
			expect(mockRedirectToLogin).not.toHaveBeenCalled();
		});
	});
});
