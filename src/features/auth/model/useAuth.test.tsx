import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("exposes googleLogin as a function", () => {
		const { result } = renderHook(() => useAuth());

		expect(result.current.googleLogin).toBeDefined();
		expect(typeof result.current.googleLogin).toBe("function");
	});

	describe("googleLogin", () => {
		it("on 200: stores token in localStorage, sets cookie, returns data", async () => {
			const fakeToken = "eyJhbGciOiJIUzI1NiJ9.test.payload";
			const fakeData = { access_token: fakeToken, token_type: "bearer" };

			// First call: POST /auth/google
			// Second call: GET /auth/me (checkAuth)
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve(fakeData),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ id: "u1", username: "test" }),
				});

			const { result } = renderHook(() => useAuth());

			let returned: unknown;
			await act(async () => {
				returned = await result.current.googleLogin("valid-google-token");
			});

			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(mockFetch.mock.calls[0][0]).toContain("/auth/google");
			expect(mockFetch.mock.calls[0][1]).toMatchObject({
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
				credential: "valid-google-token",
			});

			expect(localStorage.getItem("access_token")).toBe(fakeToken);
			expect(returned).toEqual(fakeData);
		});

		it("on 401: throws Spanish message, no redirect", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({}),
			});

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await expect(
					result.current.googleLogin("bad-token"),
				).rejects.toThrow("Token de Google inválido. Intentá de nuevo.");
			});

			expect(result.current.error).toBe(
				"Token de Google inválido. Intentá de nuevo.",
			);
			expect(localStorage.getItem("access_token")).toBeNull();
		});

		it("on 403: throws Spanish message", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 403,
				json: () => Promise.resolve({}),
			});

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await expect(
					result.current.googleLogin("token"),
				).rejects.toThrow(
					"Esta cuenta usa login con contraseña. Usá el formulario de email/password.",
				);
			});
		});

		it("on 429: throws Spanish message", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 429,
				json: () => Promise.resolve({}),
			});

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await expect(
					result.current.googleLogin("token"),
				).rejects.toThrow("Demasiados intentos. Esperá un momento.");
			});
		});

		it("on 503: throws Spanish message", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 503,
				json: () => Promise.resolve({}),
			});

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await expect(
					result.current.googleLogin("token"),
				).rejects.toThrow(
					"Login con Google no disponible temporalmente.",
				);
			});
		});

		it("on empty credential: throws", async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await expect(result.current.googleLogin("")).rejects.toThrow(
					"Credencial de Google vacía",
				);
			});

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});
});
