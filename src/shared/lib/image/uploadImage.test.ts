import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_SESSION_EXPIRED } from "../../api/client";

const { mockRedirectToLogin } = vi.hoisted(() => ({
	mockRedirectToLogin: vi.fn(),
}));

vi.mock("../../api/redirect", () => ({
	LOGIN_PATH: "/login",
	redirectToLogin: mockRedirectToLogin,
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const uploadUrl = "https://api.cloudinary.com/v1_1/demo-cloud/image/upload";
const dataUrl = "data:image/png;base64,AAA";
const solutionId = "demo-solution";
const secureUrl = "https://res.cloudinary.com/demo-cloud/image/upload/demo-solution.png";

const imageResponse = () => ({
	ok: true,
	status: 200,
	blob: () => Promise.resolve(new Blob(["png"], { type: "image/png" })),
});

const jsonResponse = (body: unknown, status = 200, statusText = "OK") => ({
	ok: status >= 200 && status < 300,
	status,
	statusText,
	json: () => Promise.resolve(body),
	text: () => Promise.resolve(JSON.stringify(body)),
});

const signedPayload = {
	signature: "sig-digest",
	timestamp: "1700000000",
	api_key: "public-key",
	cloud_name: "demo-cloud",
	params: {
		overwrite: "true",
		public_id: solutionId,
		timestamp: "1700000000",
	},
};

const uploadResponse = (body: unknown, status = 200) => ({
	...jsonResponse(body, status, "Bad Request"),
	text: () => Promise.resolve("rejected"),
});

const callOf = (index: number) =>
	mockFetch.mock.calls[index] as [string, RequestInit | undefined];

const loadUploadImage = async () => {
	const { uploadImage } = await import("./uploadImage");
	return uploadImage;
};

describe("uploadImage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		process.env.NEXT_PUBLIC_CLOUDINARY_URL = uploadUrl;
		process.env.CLOUDINARY_API_SECRET = "server-secret";
	});

	afterEach(() => {
		delete process.env.NEXT_PUBLIC_CLOUDINARY_URL;
		delete process.env.CLOUDINARY_API_SECRET;
	});

	it("asks the server for a signature and uploads straight to Cloudinary", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ secure_url: secureUrl }));

		const uploadImage = await loadUploadImage();
		await expect(uploadImage(dataUrl, solutionId)).resolves.toBe(secureUrl);

		expect(mockFetch).toHaveBeenCalledTimes(3);
		expect(callOf(1)[0]).toBe("/api/cloudinary/sign");
		expect(callOf(1)[1]?.method).toBe("POST");
		expect(JSON.parse(String(callOf(1)[1]?.body))).toEqual({
			publicId: solutionId,
		});
		expect(callOf(1)[1]?.credentials).toBe("same-origin");

		expect(callOf(2)[0]).toBe(uploadUrl);
		expect(callOf(2)[1]?.method).toBe("POST");
	});

	it("sends the signed params back to Cloudinary untouched", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ secure_url: secureUrl }));

		const uploadImage = await loadUploadImage();
		await uploadImage(dataUrl, solutionId);

		const formData = callOf(2)[1]?.body as FormData;
		expect(formData.get("public_id")).toBe(solutionId);
		expect(formData.get("overwrite")).toBe("true");
		expect(formData.get("timestamp")).toBe("1700000000");
		expect(formData.get("api_key")).toBe("public-key");
		expect(formData.get("signature")).toBe("sig-digest");
		expect((formData.get("file") as File).name).toBe(`${solutionId}.png`);
	});

	it("never puts the api secret in a request body", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ secure_url: secureUrl }));

		const uploadImage = await loadUploadImage();
		await uploadImage(dataUrl, solutionId);

		const formData = callOf(2)[1]?.body as FormData;
		expect([...formData.keys()]).not.toContain("api_secret");
		expect(JSON.stringify([...formData.entries()])).not.toContain("server-secret");
		expect(String(callOf(1)[1]?.body)).not.toContain("server-secret");
	});

	it("still fetches an http image url before uploading it", async () => {
		const imageUrl = "https://example.test/canvas.png";
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ secure_url: secureUrl }));

		const uploadImage = await loadUploadImage();
		await expect(uploadImage(imageUrl, solutionId)).resolves.toBe(secureUrl);

		expect(callOf(0)[0]).toBe(imageUrl);
	});

	it("fails with the session error and uploads nothing when the session is gone", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse({ detail: "Unauthorized" }, 401));

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			API_ERROR_SESSION_EXPIRED,
		);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("reports a failed signature request", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(
				jsonResponse({ detail: "Cloudinary is not configured" }, 500, "Internal Server Error"),
			);

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			"Cloudinary signature request failed: 500 Internal Server Error",
		);
	});

	it("rejects a malformed signature response", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse({ signature: "only" }));

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			"Cloudinary signature response is invalid",
		);
	});

	it("reports a failed Cloudinary upload", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ error: "nope" }, 400));

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			"Cloudinary upload failed: 400 Bad Request",
		);
	});

	it("rejects a Cloudinary response without a secure url", async () => {
		mockFetch
			.mockResolvedValueOnce(imageResponse())
			.mockResolvedValueOnce(jsonResponse(signedPayload))
			.mockResolvedValueOnce(uploadResponse({ public_id: solutionId }));

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			"Cloudinary response missing secure_url",
		);
	});

	it("fails fast when the upload url is not configured", async () => {
		delete process.env.NEXT_PUBLIC_CLOUDINARY_URL;

		const uploadImage = await loadUploadImage();

		await expect(uploadImage(dataUrl, solutionId)).rejects.toThrow(
			"Cloudinary configuration is missing. Image upload is disabled.",
		);
		expect(mockFetch).not.toHaveBeenCalled();
	});
});
