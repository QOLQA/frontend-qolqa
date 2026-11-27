import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

import { POST } from "./route";

const apiSecret = "server-secret";
const apiKey = "public-key";
const uploadUrl = "https://api.cloudinary.com/v1_1/demo-cloud/image/upload";
const jsonHeaders = { "content-type": "application/json" };

const signRequest = (body: unknown) =>
	new NextRequest("http://localhost:3000/api/cloudinary/sign", {
		method: "POST",
		body: typeof body === "string" ? body : JSON.stringify(body),
		headers: jsonHeaders,
	});

const signedIn = () =>
	mockCookieGet.mockReturnValue({ name: "access_token", value: "session-token" });

describe("POST /api/cloudinary/sign", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date(1_700_000_000 * 1000));
		process.env.CLOUDINARY_API_SECRET = apiSecret;
		process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY = apiKey;
		process.env.NEXT_PUBLIC_CLOUDINARY_URL = uploadUrl;
		signedIn();
	});

	afterEach(() => {
		vi.useRealTimers();
		delete process.env.CLOUDINARY_API_SECRET;
		delete process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
		delete process.env.NEXT_PUBLIC_CLOUDINARY_URL;
	});

	it("returns 401 without a session cookie", async () => {
		mockCookieGet.mockReturnValue(undefined);

		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({ detail: "Unauthorized" });
	});

	it("returns 401 when the session cookie is empty", async () => {
		mockCookieGet.mockReturnValue({ name: "access_token", value: "" });

		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(401);
	});

	it("signs the validated params with the server secret", async () => {
		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			// sha1("overwrite=true&public_id=demo-solution&timestamp=1700000000" + "server-secret")
			signature: "38e82c16fe0a87b09c2e7ca83b0c8d9950cbcd8b",
			timestamp: "1700000000",
			api_key: apiKey,
			cloud_name: "demo-cloud",
			params: {
				overwrite: "true",
				public_id: "demo-solution",
				timestamp: "1700000000",
			},
		});
	});

	it("never echoes the api secret", async () => {
		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(await response.text()).not.toContain(apiSecret);
	});

	it("rejects a request without a public_id", async () => {
		const response = await POST(signRequest({}));

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			detail: "public_id is required",
		});
	});

	it("rejects a folder outside the allowed prefixes", async () => {
		const response = await POST(
			signRequest({ publicId: "demo-solution", folder: "screenshots" }),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({ detail: "Invalid folder" });
	});

	it("rejects an extra param instead of signing it", async () => {
		const response = await POST(
			signRequest({ publicId: "demo-solution", upload_preset: "solutions-service" }),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			detail: "Unsupported parameter: upload_preset",
		});
	});

	it("rejects a malformed json body", async () => {
		const response = await POST(signRequest("{not-json"));

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			detail: "Invalid JSON body",
		});
	});

	it("returns 500 without leaking config when the secret is missing", async () => {
		delete process.env.CLOUDINARY_API_SECRET;

		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			detail: "Cloudinary is not configured",
		});
	});

	it("returns 500 when the api key is missing", async () => {
		delete process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(500);
	});

	it("returns 500 when the upload url has no cloud name", async () => {
		process.env.NEXT_PUBLIC_CLOUDINARY_URL = "";

		const response = await POST(signRequest({ publicId: "demo-solution" }));

		expect(response.status).toBe(500);
	});
});
