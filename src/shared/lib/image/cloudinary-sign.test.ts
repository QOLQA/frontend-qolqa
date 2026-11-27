import { describe, expect, it } from "vitest";
import {
	buildCloudinarySignature,
	resolveCloudName,
	resolveSignedParams,
} from "./cloudinary-sign";

const apiSecret = "test-secret";
const timestamp = 1_700_000_000;

// sha1("overwrite=true&public_id=demo-solution&timestamp=1700000000test-secret")
const expectedDigest = "d2bfbe903f440b1c7b116df67a6f641c2bf06ee7";

const expectRejected = (input: unknown, detail: string) => {
	const result = resolveSignedParams(input, timestamp);
	expect(result).toEqual({ ok: false, detail });
};

describe("buildCloudinarySignature", () => {
	it("hashes the alphabetically sorted params plus the secret with sha1", () => {
		const signature = buildCloudinarySignature(
			{ timestamp: String(timestamp), public_id: "demo-solution", overwrite: "true" },
			apiSecret,
		);

		expect(signature).toBe(expectedDigest);
	});

	it("does not depend on the insertion order of the params", () => {
		const signature = buildCloudinarySignature(
			{ overwrite: "true", public_id: "demo-solution", timestamp: String(timestamp) },
			apiSecret,
		);

		expect(signature).toBe(expectedDigest);
	});

	it("includes a signed folder in the digest", () => {
		const signature = buildCloudinarySignature(
			{
				folder: "solutions",
				overwrite: "true",
				public_id: "demo-solution",
				timestamp: String(timestamp),
			},
			apiSecret,
		);

		// sha1("folder=solutions&overwrite=true&public_id=demo-solution&timestamp=1700000000test-secret")
		expect(signature).toBe("476431a05349cdbaece7a8e007c6d45e072cd19b");
	});

	it("changes the digest when the secret changes", () => {
		const signature = buildCloudinarySignature(
			{ overwrite: "true", public_id: "demo-solution", timestamp: String(timestamp) },
			"other-secret",
		);

		expect(signature).not.toBe(expectedDigest);
		expect(signature).toMatch(/^[0-9a-f]{40}$/);
	});
});

describe("resolveSignedParams", () => {
	it("signs only the server-owned params for a valid request", () => {
		const result = resolveSignedParams(
			{ publicId: "demo-solution" },
			timestamp,
		);

		expect(result).toEqual({
			ok: true,
			params: {
				overwrite: "true",
				public_id: "demo-solution",
				timestamp: String(timestamp),
			},
		});
	});

	it("uses the server timestamp instead of any client value", () => {
		const result = resolveSignedParams({ publicId: "demo-solution" }, 1_234);

		expect(result).toMatchObject({ ok: true });
		if (!result.ok) throw new Error("expected a valid result");
		expect(result.params.timestamp).toBe("1234");
	});

	it("signs an allowed folder", () => {
		const result = resolveSignedParams(
			{ publicId: "demo-solution", folder: "solutions" },
			timestamp,
		);

		expect(result).toEqual({
			ok: true,
			params: {
				folder: "solutions",
				overwrite: "true",
				public_id: "demo-solution",
				timestamp: String(timestamp),
			},
		});
	});

	it("signs a nested folder that starts with an allowed prefix", () => {
		const result = resolveSignedParams(
			{ publicId: "demo-solution", folder: "avatars/2026" },
			timestamp,
		);

		expect(result).toMatchObject({ ok: true });
		if (!result.ok) throw new Error("expected a valid result");
		expect(result.params.folder).toBe("avatars/2026");
	});

	it("rejects a request without a public_id", () => {
		expectRejected({}, "public_id is required");
	});

	it("rejects a public_id that is not a string", () => {
		expectRejected({ publicId: 42 }, "Invalid public_id");
	});

	it.each(["demo/solution", "demo solution", "../escape", ".hidden", "demo.solution", ""])(
		"rejects the unsafe public_id %j",
		(publicId) => {
			expectRejected({ publicId }, "Invalid public_id");
		},
	);

	it("rejects a public_id longer than 128 characters", () => {
		expectRejected({ publicId: "a".repeat(129) }, "Invalid public_id");
	});

	it.each(["screenshots", "Solutions", "solutions/../escape", "solutions/", "/solutions", "solutions//sub", "temp"])(
		"rejects the folder %j",
		(folder) => {
			expectRejected({ publicId: "demo-solution", folder }, "Invalid folder");
		},
	);

	it("rejects a folder that is not a string", () => {
		expectRejected({ publicId: "demo-solution", folder: ["solutions"] }, "Invalid folder");
	});

	it.each(["overwrite", "timestamp", "upload_preset", "transformation"])(
		"refuses to sign the extra param %j",
		(key) => {
			expectRejected(
				{ publicId: "demo-solution", [key]: "false" },
				`Unsupported parameter: ${key}`,
			);
		},
	);

	it.each([
		["null", null],
		["a string", "publicId=demo"],
		["an array", [{ publicId: "demo-solution" }]],
	])("rejects %s as the request body", (_label, input) => {
		expectRejected(input, "Invalid request body");
	});
});

describe("resolveCloudName", () => {
	it.each([
		"https://api.cloudinary.com/v1_1/demo-cloud/image/upload",
		"https://api.cloudinary.com/v1_1/demo-cloud/image/upload/",
		"https://res.cloudinary.com/v1_1/demo-cloud/image/upload",
	])("extracts the cloud name from %j", (url) => {
		expect(resolveCloudName(url)).toBe("demo-cloud");
	});

	it.each(["", "not-a-url", "https://api.cloudinary.com/image/upload"])(
		"returns null when %j has no cloud name",
		(url) => {
			expect(resolveCloudName(url)).toBeNull();
		},
	);
});
