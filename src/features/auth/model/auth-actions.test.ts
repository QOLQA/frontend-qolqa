import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockCookieSet, mockCookieStore } = vi.hoisted(() => {
	const set = vi.fn();
	return {
		mockCookieSet: set,
		mockCookieStore: {
			set,
			get: vi.fn(),
			getAll: vi.fn(),
			has: vi.fn(),
			delete: vi.fn(),
		},
	};
});

vi.mock("next/headers", () => ({
	cookies: async () => mockCookieStore,
}));

import {
	googleLoginAction,
	loginAction,
	logoutAction,
	registerAction,
} from "./auth-actions";
import { AUTH_COOKIE_NAME } from "@fsd/shared/api/auth-cookie";
import { AUTH_NETWORK_ERROR_MESSAGE } from "./auth-action-results";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const backendUrl = "http://backend:8000";

const jsonResponse = (status: number, body: unknown) => ({
	ok: status >= 200 && status < 300,
	status,
	json: () => Promise.resolve(body),
});

const callOf = (index = 0) => mockFetch.mock.calls[index] as [string, RequestInit];

describe("auth server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.BACKEND_URL = backendUrl;
		process.env.NEXT_PUBLIC_BACKEND_URL = "http://public-browser-url:9999";
	});

	afterEach(() => {
		delete process.env.BACKEND_URL;
		delete process.env.NEXT_PUBLIC_BACKEND_URL;
	});

	describe("loginAction", () => {
		it("posts form-urlencoded credentials to the server-only backend url", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(200, { access_token: "jwt-token" }),
			);

			const result = await loginAction({
				username: "ada",
				password: "secret",
			});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, init] = callOf();
			expect(url).toBe(`${backendUrl}/auth/login`);
			expect(init.method).toBe("POST");
			expect(init.headers).toMatchObject({
				"Content-Type": "application/x-www-form-urlencoded",
			});
			expect(init.body).toBe("username=ada&password=secret");
			expect(result).toEqual({ ok: true, data: null });
		});

		it("never returns the access token to the browser", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(200, { access_token: "jwt-token" }),
			);

			const result = await loginAction({ username: "ada", password: "secret" });

			expect(JSON.stringify(result)).not.toContain("jwt-token");
		});

		it("sets the httpOnly access_token cookie aligned to the token lifetime", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(200, { access_token: "jwt-token" }),
			);

			await loginAction({ username: "ada", password: "secret" });

			expect(mockCookieSet).toHaveBeenCalledTimes(1);
			expect(mockCookieSet).toHaveBeenCalledWith(AUTH_COOKIE_NAME, "jwt-token", {
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				secure: false,
				maxAge: 1800,
			});
		});

		it("returns a typed failure and sets no cookie on invalid credentials", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(401, { detail: "Incorrect username or password" }),
			);

			const result = await loginAction({
				username: "ada",
				password: "wrong",
			});

			expect(result).toEqual({
				ok: false,
				status: 401,
				detail: "Incorrect username or password",
			});
			expect(mockCookieSet).not.toHaveBeenCalled();
		});

		it("flattens validation details into field errors", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(422, {
					detail: [{ msg: "field required" }, { msg: "too short" }],
				}),
			);

			const result = await loginAction({ username: "", password: "" });

			expect(result).toEqual({
				ok: false,
				status: 422,
				fieldErrors: ["field required", "too short"],
			});
			expect(mockCookieSet).not.toHaveBeenCalled();
		});

		it("returns a network failure instead of throwing", async () => {
			mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

			const result = await loginAction({ username: "ada", password: "x" });

			expect(result).toEqual({
				ok: false,
				status: 0,
				detail: AUTH_NETWORK_ERROR_MESSAGE,
			});
			expect(mockCookieSet).not.toHaveBeenCalled();
		});

		it("fails without a cookie when the backend omits the token", async () => {
			mockFetch.mockResolvedValueOnce(jsonResponse(200, { token_type: "bearer" }));

			const result = await loginAction({ username: "ada", password: "x" });

			expect(result.ok).toBe(false);
			expect(mockCookieSet).not.toHaveBeenCalled();
		});
	});

	describe("googleLoginAction", () => {
		it("posts the credential as json and stores the cookie", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(200, { access_token: "google-token" }),
			);

			const result = await googleLoginAction("google-credential");

			const [url, init] = callOf();
			expect(url).toBe(`${backendUrl}/auth/google`);
			expect(init.method).toBe("POST");
			expect(JSON.parse(String(init.body))).toEqual({
				credential: "google-credential",
			});
			expect(result).toEqual({ ok: true, data: null });
			expect(mockCookieSet).toHaveBeenCalledWith(
				AUTH_COOKIE_NAME,
				"google-token",
				expect.objectContaining({ httpOnly: true, maxAge: 1800 }),
			);
		});

		it("returns the backend status on rejected credentials", async () => {
			mockFetch.mockResolvedValueOnce(jsonResponse(401, {}));

			const result = await googleLoginAction("bad-credential");

			expect(result).toEqual({ ok: false, status: 401 });
			expect(mockCookieSet).not.toHaveBeenCalled();
		});
	});

	describe("registerAction", () => {
		const createdUser = {
			id: "u1",
			username: "ada",
			email: "ada@example.com",
			is_active: true,
			created_at: "2024-01-01T00:00:00Z",
		};

		it("registers, then logs in server-side to store the cookie", async () => {
			mockFetch
				.mockResolvedValueOnce(jsonResponse(201, createdUser))
				.mockResolvedValueOnce(jsonResponse(200, { access_token: "new-token" }));

			const result = await registerAction({
				username: "ada",
				email: "ada@example.com",
				password: "secret123",
			});

			expect(mockFetch).toHaveBeenCalledTimes(2);
			const [registerUrl, registerInit] = callOf(0);
			const [loginUrl] = callOf(1);
			expect(registerUrl).toBe(`${backendUrl}/auth/register`);
			expect(JSON.parse(String(registerInit.body))).toEqual({
				username: "ada",
				email: "ada@example.com",
				password: "secret123",
			});
			expect(loginUrl).toBe(`${backendUrl}/auth/login`);
			expect(result).toEqual({
				ok: true,
				data: { ...createdUser, profile_picture_url: null },
			});
			expect(mockCookieSet).toHaveBeenCalledWith(
				AUTH_COOKIE_NAME,
				"new-token",
				expect.objectContaining({ httpOnly: true }),
			);
		});

		it("does not log in again when registration already returns a token", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(201, { ...createdUser, access_token: "inline-token" }),
			);

			const result = await registerAction({
				username: "ada",
				email: "ada@example.com",
				password: "secret123",
			});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(result.ok).toBe(true);
			expect(mockCookieSet).toHaveBeenCalledWith(
				AUTH_COOKIE_NAME,
				"inline-token",
				expect.objectContaining({ httpOnly: true }),
			);

			expect(JSON.stringify(result)).not.toContain("inline-token");
		});

		it("returns a typed failure when registration is rejected", async () => {
			mockFetch.mockResolvedValueOnce(
				jsonResponse(409, { detail: "Username already registered" }),
			);

			const result = await registerAction({
				username: "ada",
				email: "ada@example.com",
				password: "secret123",
			});

			expect(result).toEqual({
				ok: false,
				status: 409,
				detail: "Username already registered",
			});
			expect(mockCookieSet).not.toHaveBeenCalled();
		});
	});

	describe("logoutAction", () => {
		it("expires the access_token cookie server-side", async () => {
			await logoutAction();

			expect(mockCookieSet).toHaveBeenCalledWith(AUTH_COOKIE_NAME, "", {
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				secure: false,
				maxAge: 0,
			});
		});
	});

	describe("cookie flags in production", () => {
		afterEach(() => {
			vi.unstubAllEnvs();
		});

		it("marks the cookie Secure in production", async () => {
			vi.stubEnv("NODE_ENV", "production");
			mockFetch.mockResolvedValueOnce(
				jsonResponse(200, { access_token: "prod-token" }),
			);

			await loginAction({ username: "ada", password: "secret" });

			expect(mockCookieSet).toHaveBeenCalledWith(
				AUTH_COOKIE_NAME,
				"prod-token",
				expect.objectContaining({ secure: true, httpOnly: true }),
			);
		});
	});
});
