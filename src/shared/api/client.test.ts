import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedirectToLogin } = vi.hoisted(() => ({
	mockRedirectToLogin: vi.fn(),
}));

vi.mock("./redirect", () => ({
	LOGIN_PATH: "/login",
	redirectToLogin: mockRedirectToLogin,
}));

import {
	API_ERROR_REQUEST_FAILED,
	API_ERROR_SESSION_EXPIRED,
	API_PROXY_BASE,
	api,
	clearAuthCookie,
	fetchWithAuth,
	resolveApiUrl,
} from "./client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const okResponse = (data: unknown) => ({
	ok: true,
	status: 200,
	json: () => Promise.resolve(data),
});

const errorResponse = (status: number, body: unknown) => ({
	ok: false,
	status,
	json: () => Promise.resolve(body),
});

const unauthorizedResponse = () => ({
	ok: false,
	status: 401,
	json: () => Promise.resolve({ detail: "Not authenticated" }),
});

const headersOf = (callIndex = 0): Record<string, string> =>
	(mockFetch.mock.calls[callIndex][1]?.headers ?? {}) as Record<string, string>;

describe("resolveApiUrl", () => {
	it("routes relative endpoints through the same-origin proxy", () => {
		expect(API_PROXY_BASE).toBe("/api");
		expect(resolveApiUrl("/auth/me")).toBe("/api/auth/me");
	});

	it("passes absolute urls through untouched", () => {
		expect(resolveApiUrl("https://res.cloudinary.com/x/y")).toBe(
			"https://res.cloudinary.com/x/y",
		);
	});
});

describe("fetchWithAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		clearAuthCookie();
	});

	it("requests the same-origin proxy with the json content type", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ ok: true }));

		await fetchWithAuth("/projects");

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][0]).toBe("/api/projects");
		expect(headersOf()).toMatchObject({
			"Content-Type": "application/json",
		});
	});

	it("no longer sends a bearer token from localStorage", async () => {
		localStorage.setItem("access_token", "stray-token");
		mockFetch.mockResolvedValueOnce(okResponse({ ok: true }));

		await fetchWithAuth("/auth/me");

		expect(headersOf()).not.toHaveProperty("Authorization");
		expect(mockFetch.mock.calls[0][1]?.headers).not.toHaveProperty(
			"authorization",
		);
	});

	it("keeps passing absolute urls straight through", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ ok: true }));

		await fetchWithAuth("https://example.com/upload", { method: "POST" });

		expect(mockFetch.mock.calls[0][0]).toBe("https://example.com/upload");
	});

	it("clears the cookie, redirects to /login and throws on 401", async () => {
		document.cookie = "access_token=stale; path=/";
		mockFetch.mockResolvedValueOnce(unauthorizedResponse());

		await expect(fetchWithAuth("/projects")).rejects.toThrow(
			API_ERROR_SESSION_EXPIRED,
		);

		expect(mockRedirectToLogin).toHaveBeenCalledTimes(1);
		expect(document.cookie).not.toContain("access_token");
	});

	it("suppresses the redirect but still throws on 401 when asked to", async () => {
		mockFetch.mockResolvedValueOnce(unauthorizedResponse());

		await expect(
			fetchWithAuth("/auth/me", { redirectOnUnauthorized: false }),
		).rejects.toThrow(API_ERROR_SESSION_EXPIRED);

		expect(mockRedirectToLogin).not.toHaveBeenCalled();
	});

	it("does not facet-shape the request with the redirect switch", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ ok: true }));

		await fetchWithAuth("/auth/me", { redirectOnUnauthorized: false });

		expect(mockFetch.mock.calls[0][1]).not.toHaveProperty(
			"redirectOnUnauthorized",
		);
	});

	it("resolves non-401 error responses untouched", async () => {
		const response = errorResponse(500, { detail: "boom" });
		mockFetch.mockResolvedValueOnce(response);

		await expect(fetchWithAuth("/projects")).resolves.toBe(response);
		expect(mockRedirectToLogin).not.toHaveBeenCalled();
	});
});

describe("api", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("get returns the parsed body from the proxy", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ id: "u1" }));

		await expect(api.get<{ id: string }>("/auth/me")).resolves.toEqual({
			id: "u1",
		});
		expect(mockFetch.mock.calls[0][0]).toBe("/api/auth/me");
	});

	it("get forwards the redirect opt-out", async () => {
		mockFetch.mockResolvedValueOnce(unauthorizedResponse());

		await expect(
			api.get("/auth/me", { redirectOnUnauthorized: false }),
		).rejects.toThrow(API_ERROR_SESSION_EXPIRED);
		expect(mockRedirectToLogin).not.toHaveBeenCalled();
	});

	it("get surfaces the backend detail message", async () => {
		mockFetch.mockResolvedValueOnce(
			errorResponse(404, { detail: "Project not found" }),
		);

		await expect(api.get("/projects/1")).rejects.toThrow("Project not found");
	});

	it("get falls back to the request-failed key when the body is not json", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 502,
			json: () => Promise.reject(new SyntaxError("Unexpected token <")),
		});

		await expect(api.get("/projects")).rejects.toThrow(
			API_ERROR_REQUEST_FAILED,
		);
	});

	it("post sends the json body through the proxy", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ id: "p1" }));

		await api.post("/projects", { name: "demo" });

		expect(mockFetch.mock.calls[0][0]).toBe("/api/projects");
		expect(mockFetch.mock.calls[0][1]).toMatchObject({
			method: "POST",
			body: JSON.stringify({ name: "demo" }),
		});
	});

	it("patch sends the json body through the proxy", async () => {
		mockFetch.mockResolvedValueOnce(okResponse({ id: "p1" }));

		await api.patch("/projects/p1", { name: "renamed" });

		expect(mockFetch.mock.calls[0][1]).toMatchObject({
			method: "PATCH",
			body: JSON.stringify({ name: "renamed" }),
		});
	});

	it("delete resolves on 204 and surfaces detail otherwise", async () => {
		mockFetch.mockResolvedValueOnce({ ok: false, status: 204 });
		await expect(api.delete("/projects/p1")).resolves.toBeUndefined();
		expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: "DELETE" });

		mockFetch.mockResolvedValueOnce(
			errorResponse(409, { detail: "Version in use" }),
		);
		await expect(api.delete("/versions/1")).rejects.toThrow("Version in use");
	});
});

describe("clearAuthCookie", () => {
	it("expires the access_token cookie client-side", () => {
		document.cookie = "access_token=stale; path=/";

		clearAuthCookie();

		expect(document.cookie).not.toContain("access_token");
	});
});
