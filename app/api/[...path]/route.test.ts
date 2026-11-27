import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { mockCookieGet } = vi.hoisted(() => ({ mockCookieGet: vi.fn() }));

vi.mock("next/headers", () => ({
	cookies: async () => ({
		get: mockCookieGet,
		getAll: () => [],
		has: () => true,
		set: vi.fn(),
		delete: vi.fn(),
	}),
}));

import { DELETE, GET, PATCH, POST, PUT } from "./route";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const backendUrl = "http://backend:8000";

const routeContext = (path: string[]) => ({
	params: Promise.resolve({ path }),
});

const request = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
	new NextRequest(`http://localhost:3000/api/${path}`, init);

const jsonHeaders = { "content-type": "application/json" };

const backendResponse = (
	body: unknown,
	status = 200,
	headers: Record<string, string> = jsonHeaders,
) =>
	new Response(body === null ? null : JSON.stringify(body), { status, headers });

const backendCall = (index = 0) =>
	mockFetch.mock.calls[index] as [string, RequestInit];

describe("BFF catch-all route handler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.BACKEND_URL = backendUrl;
		mockCookieGet.mockReturnValue({ name: "access_token", value: "server-token" });
	});

	afterEach(() => {
		delete process.env.BACKEND_URL;
	});

	it("proxies GET reads to the backend with the cookie token", async () => {
		mockFetch.mockResolvedValueOnce(backendResponse({ id: "u1" }));

		const response = await GET(request("auth/me"), routeContext(["auth", "me"]));

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ id: "u1" });

		const [url, init] = backendCall();
		expect(url).toBe(`${backendUrl}/auth/me`);
		expect(init.method).toBe("GET");
		expect((init.headers as Record<string, string>).Authorization).toBe(
			"Bearer server-token",
		);
	});

	it("never forwards the browser cookies to the backend", async () => {
		mockFetch.mockResolvedValueOnce(backendResponse({ ok: true }));

		await GET(
			request("auth/me", { headers: { cookie: "access_token=browser-token" } }),
			routeContext(["auth", "me"]),
		);

		const headers = backendCall()[1].headers as Record<string, string>;
		const keys = Object.keys(headers).map((key) => key.toLowerCase());
		expect(keys).not.toContain("cookie");
		expect(JSON.stringify(headers)).not.toContain("browser-token");
	});

	it("forwards the query string", async () => {
		mockFetch.mockResolvedValueOnce(backendResponse([]));

		await GET(request("queries?limit=10"), routeContext(["queries"]));

		expect(backendCall()[0]).toBe(`${backendUrl}/queries?limit=10`);
	});

	it.each([
		["POST", POST],
		["PUT", PUT],
		["PATCH", PATCH],
		["DELETE", DELETE],
	])("forwards %s json bodies unchanged", async (method, handler) => {
		mockFetch.mockResolvedValueOnce(backendResponse({ ok: true }, 201));

		const response = await handler(
			request("projects", {
				method,
				body: JSON.stringify({ name: "demo" }),
				headers: jsonHeaders,
			}),
			routeContext(["projects"]),
		);

		expect(response.status).toBe(201);
		const [url, init] = backendCall();
		expect(url).toBe(`${backendUrl}/projects`);
		expect(init.method).toBe(method);
		expect(init.body).toBe(JSON.stringify({ name: "demo" }));
		expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
			"application/json",
		);
	});

	it("passes empty bodies through untouched", async () => {
		mockFetch.mockResolvedValueOnce(backendResponse(null, 204, {}));

		const response = await DELETE(
			request("versions/1", { method: "DELETE" }),
			routeContext(["versions", "1"]),
		);

		expect(response.status).toBe(204);
		expect(backendCall()[1].body).toBeUndefined();
	});

	it("rejects non-json bodies before reaching the backend", async () => {
		const response = await POST(
			request("projects", {
				method: "POST",
				body: "name=demo",
				headers: { "content-type": "application/x-www-form-urlencoded" },
			}),
			routeContext(["projects"]),
		);

		expect(response.status).toBe(415);
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("rejects malformed json before reaching the backend", async () => {
		const response = await POST(
			request("projects", {
				method: "POST",
				body: "{not-json",
				headers: jsonHeaders,
			}),
			routeContext(["projects"]),
		);

		expect(response.status).toBe(400);
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("passes the backend error status and body through", async () => {
		mockFetch.mockResolvedValueOnce(
			backendResponse({ detail: "Project not found" }, 404),
		);

		const response = await GET(request("projects/1"), routeContext(["projects", "1"]));

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			detail: "Project not found",
		});
	});

	it("clears the access_token cookie and returns 401 on an expired session", async () => {
		mockFetch.mockResolvedValueOnce(
			backendResponse({ detail: "Not authenticated" }, 401),
		);

		const response = await GET(request("auth/me"), routeContext(["auth", "me"]));

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			detail: "Not authenticated",
		});

		const setCookie = response.headers.getSetCookie().join("; ");
		expect(setCookie).toContain("access_token=");
		expect(setCookie.toLowerCase()).toContain("max-age=0");
		expect(setCookie.toLowerCase()).toContain("httponly");
	});

	it("does not clear the cookie for other error statuses", async () => {
		mockFetch.mockResolvedValueOnce(backendResponse({ detail: "nope" }, 403));

		const response = await GET(request("projects"), routeContext(["projects"]));

		expect(response.status).toBe(403);
		expect(response.headers.getSetCookie()).toEqual([]);
	});
});
