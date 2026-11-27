import { describe, it, expect } from "vitest";
import {
	AUTH_NETWORK_ERROR_MESSAGE,
	authFailureMessage,
	failureFromResponse,
	googleErrorMessage,
	readAccessToken,
	readBackendDetail,
	readFieldErrors,
} from "./auth-action-results";

const t = (path: string) => `t:${path}`;

describe("failureFromResponse", () => {
	it("keeps a string detail from the backend", () => {
		expect(failureFromResponse(401, { detail: "Bad credentials" })).toEqual({
			ok: false,
			status: 401,
			detail: "Bad credentials",
		});
	});

	it("collects pydantic-style field errors", () => {
		expect(
			failureFromResponse(422, {
				detail: [{ msg: "field required" }, { msg: "invalid email" }],
			}),
		).toEqual({
			ok: false,
			status: 422,
			fieldErrors: ["field required", "invalid email"],
		});
	});

	it("drops details it cannot understand", () => {
		expect(failureFromResponse(500, null)).toEqual({ ok: false, status: 500 });
		expect(failureFromResponse(500, { detail: 42 })).toEqual({
			ok: false,
			status: 500,
		});
		expect(failureFromResponse(500, { detail: [] })).toEqual({
			ok: false,
			status: 500,
		});
	});
});

describe("readBackendDetail", () => {
	it("returns string details only", () => {
		expect(readBackendDetail({ detail: "boom" })).toBe("boom");
		expect(readBackendDetail({ detail: { nested: true } })).toBeUndefined();
		expect(readBackendDetail("plain")).toBeUndefined();
		expect(readBackendDetail(undefined)).toBeUndefined();
	});
});

describe("readFieldErrors", () => {
	it("returns message strings from a detail array", () => {
		expect(readFieldErrors({ detail: [{ msg: "a" }, { msg: "b" }] })).toEqual([
			"a",
			"b",
		]);
	});

	it("returns undefined when there is nothing usable", () => {
		expect(readFieldErrors({ detail: [] })).toBeUndefined();
		expect(readFieldErrors({ detail: "nope" })).toBeUndefined();
		expect(readFieldErrors(null)).toBeUndefined();
	});
});

describe("readAccessToken", () => {
	it("extracts a non-empty access token", () => {
		expect(readAccessToken({ access_token: "abc" })).toBe("abc");
	});

	it("returns null for missing or malformed tokens", () => {
		expect(readAccessToken({})).toBeNull();
		expect(readAccessToken({ access_token: "" })).toBeNull();
		expect(readAccessToken({ access_token: 123 })).toBeNull();
		expect(readAccessToken(null)).toBeNull();
		expect(readAccessToken("token")).toBeNull();
	});
});

describe("googleErrorMessage", () => {
	it("maps the known google statuses to Spanish messages", () => {
		expect(googleErrorMessage(401)).toBe(
			"Token de Google inválido. Intentá de nuevo.",
		);
		expect(googleErrorMessage(403)).toBe(
			"Esta cuenta usa login con contraseña. Usá el formulario de email/password.",
		);
		expect(googleErrorMessage(429)).toBe(
			"Demasiados intentos. Esperá un momento.",
		);
		expect(googleErrorMessage(503)).toBe(
			"Login con Google no disponible temporalmente.",
		);
	});

	it("falls back to the generic google error", () => {
		expect(googleErrorMessage(500)).toBe("Error al iniciar sesión con Google");
	});
});

describe("authFailureMessage", () => {
	it("joins field errors", () => {
		expect(
			authFailureMessage(
				{ ok: false, status: 422, fieldErrors: ["a", "b"] },
				t,
			),
		).toBe("a, b");
	});

	it("reports connection problems for network failures", () => {
		expect(authFailureMessage({ ok: false, status: 0 }, t)).toBe(
			AUTH_NETWORK_ERROR_MESSAGE,
		);
	});

	it("maps statuses through the shared api error translator", () => {
		expect(authFailureMessage({ ok: false, status: 401 }, t)).toBe(
			"t:apiErrors.sessionExpired",
		);
		expect(authFailureMessage({ ok: false, status: 422 }, t)).toBe(
			"t:apiErrors.invalidData",
		);
	});

	it("prefers a backend detail message over the status mapping", () => {
		expect(
			authFailureMessage(
				{ ok: false, status: 401, detail: "Incorrect password" },
				t,
			),
		).toBe("Incorrect password");
	});
});
