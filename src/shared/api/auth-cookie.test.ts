import { describe, it, expect } from "vitest";
import {
	ACCESS_TOKEN_MAX_AGE_SECONDS,
	AUTH_COOKIE_NAME,
	createAuthCookieOptions,
	createExpiredAuthCookieOptions,
	isProductionEnv,
} from "./auth-cookie";

describe("auth cookie constants", () => {
	it("uses the access_token cookie name", () => {
		expect(AUTH_COOKIE_NAME).toBe("access_token");
	});

	it("aligns the max age with the backend token lifetime (1800s)", () => {
		expect(ACCESS_TOKEN_MAX_AGE_SECONDS).toBe(1800);
	});
});

describe("createAuthCookieOptions", () => {
	it("builds httpOnly, same-site lax, root-scoped options", () => {
		const options = createAuthCookieOptions("development");

		expect(options).toEqual({
			httpOnly: true,
			path: "/",
			sameSite: "lax",
			secure: false,
			maxAge: 1800,
		});
	});

	it("adds Secure only in production", () => {
		expect(createAuthCookieOptions("production").secure).toBe(true);
		expect(createAuthCookieOptions("test").secure).toBe(false);
		expect(createAuthCookieOptions(undefined).secure).toBe(false);
	});

	it("keeps httpOnly in production", () => {
		expect(createAuthCookieOptions("production").httpOnly).toBe(true);
	});
});

describe("createExpiredAuthCookieOptions", () => {
	it("expires the cookie immediately with the same flags", () => {
		const options = createExpiredAuthCookieOptions("production");

		expect(options).toEqual({
			httpOnly: true,
			path: "/",
			sameSite: "lax",
			secure: true,
			maxAge: 0,
		});
	});
});

describe("isProductionEnv", () => {
	it("is true only for the production node env", () => {
		expect(isProductionEnv("production")).toBe(true);
		expect(isProductionEnv("development")).toBe(false);
		expect(isProductionEnv("test")).toBe(false);
		expect(isProductionEnv(undefined)).toBe(false);
	});
});
