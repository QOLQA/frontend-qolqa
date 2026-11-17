import { describe, expect, it } from "vitest";
import type { VersionFrontend } from "@fsd/entities/solution";
import { generateNextMajorVersion } from "./versions";

const versions = (...descriptions: string[]): VersionFrontend[] =>
	descriptions.map((description, index) => ({
		_id: `v${index}`,
		solution_id: "project",
		description,
		nodes: [],
		edges: [],
	}));

describe("generateNextMajorVersion", () => {
	it("starts at project v1.0", () => {
		expect(generateNextMajorVersion([])).toBe("project v1.0");
	});

	it("adds the project prefix to unprefixed versions", () => {
		expect(generateNextMajorVersion(versions("v1.0", "v1.1"))).toBe("project v2.0");
	});

	it("keeps the base already in use", () => {
		expect(generateNextMajorVersion(versions("shop v1.0", "shop v3.0"))).toBe("shop v4.0");
	});

	it("ignores renamed versions without a version number", () => {
		expect(generateNextMajorVersion(versions("project v1.0", "embedded orders"))).toBe(
			"project v2.0",
		);
	});
});
