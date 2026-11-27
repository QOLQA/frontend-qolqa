import { describe, it, expect } from "vitest";
import { buildBackendPath, hasRequestBody, isJsonContentType } from "./proxy";

describe("buildBackendPath", () => {
	it("joins catch-all segments into a backend path", () => {
		expect(buildBackendPath(["auth", "me"])).toBe("/auth/me");
	});

	it("keeps a single segment path", () => {
		expect(buildBackendPath(["projects"])).toBe("/projects");
	});

	it("falls back to the backend root for an empty catch-all", () => {
		expect(buildBackendPath([])).toBe("/");
	});

	it("forwards the query string with its leading question mark", () => {
		expect(buildBackendPath(["queries", "1"], "?limit=10")).toBe(
			"/queries/1?limit=10",
		);
	});

	it("adds the question mark when the search string has none", () => {
		expect(buildBackendPath(["queries"], "limit=10")).toBe("/queries?limit=10");
	});

	it("ignores an empty search string", () => {
		expect(buildBackendPath(["queries"], "")).toBe("/queries");
	});

	it("percent-encodes segments so they cannot escape the path", () => {
		expect(buildBackendPath(["a b", "c?d"])).toBe("/a%20b/c%3Fd");
	});
});

describe("hasRequestBody", () => {
	it("accepts the body-bearing methods", () => {
		expect(hasRequestBody("POST")).toBe(true);
		expect(hasRequestBody("PUT")).toBe(true);
		expect(hasRequestBody("PATCH")).toBe(true);
		expect(hasRequestBody("DELETE")).toBe(true);
	});

	it("rejects body-less methods", () => {
		expect(hasRequestBody("GET")).toBe(false);
		expect(hasRequestBody("HEAD")).toBe(false);
	});

	it("is case insensitive", () => {
		expect(hasRequestBody("post")).toBe(true);
	});
});

describe("isJsonContentType", () => {
	it("accepts application/json with and without parameters", () => {
		expect(isJsonContentType("application/json")).toBe(true);
		expect(isJsonContentType("application/json; charset=utf-8")).toBe(true);
		expect(isJsonContentType("APPLICATION/JSON")).toBe(true);
	});

	it("accepts structured json suffixes", () => {
		expect(isJsonContentType("application/vnd.api+json")).toBe(true);
	});

	it("rejects non-json bodies", () => {
		expect(isJsonContentType("text/plain")).toBe(false);
		expect(isJsonContentType("application/x-www-form-urlencoded")).toBe(false);
		expect(isJsonContentType("multipart/form-data; boundary=x")).toBe(false);
		expect(isJsonContentType(null)).toBe(false);
		expect(isJsonContentType(undefined)).toBe(false);
	});
});
