import { describe, it, expect } from "vitest";
import { handleApiError } from "./handleApiError";

const responseWithStatus = (status: number): Response =>
	({ status }) as Response;

const STATUS_MESSAGES: ReadonlyArray<[number, string]> = [
	[401, "Session expired or invalid credentials"],
	[403, "You don't have permission to perform this action"],
	[404, "Resource not found"],
	[409, "Resource already exists"],
	[422, "Invalid input data"],
	[429, "Too many requests. Please try again later"],
	[500, "Internal server error"],
	[502, "Internal server error"],
	[503, "Internal server error"],
];

describe("handleApiError — status mapping without a translator", () => {
	it.each(STATUS_MESSAGES)(
		"maps status %i to the English dictionary message",
		(status, expected) => {
			expect(
				handleApiError(new Error("ignored"), responseWithStatus(status)),
			).toBe(expected);
		},
	);

	it("falls back to the error message for unmapped statuses", () => {
		expect(
			handleApiError(new Error("boom"), responseWithStatus(400)),
		).toBe("boom");
	});

	it("falls back to the unknown-error message when the error has no message", () => {
		expect(
			handleApiError(new Error(""), responseWithStatus(400)),
		).toBe("An unknown error occurred");
	});
});

describe("handleApiError — custom translator", () => {
	it("uses the provided translator instead of the dictionary", () => {
		const t = () => "TRANSLATED";
		expect(
			handleApiError(new Error("ignored"), responseWithStatus(401), t),
		).toBe("TRANSLATED");
		expect(
			handleApiError(new Error("ignored"), responseWithStatus(500), t),
		).toBe("TRANSLATED");
	});

	it("still prefers the error message for unmapped statuses", () => {
		const t = () => "TRANSLATED";
		expect(
			handleApiError(new Error("boom"), responseWithStatus(400), t),
		).toBe("boom");
	});
});

describe("handleApiError — network errors without a response", () => {
	it("reports a connection error for fetch TypeErrors", () => {
		const error = new TypeError("Failed to fetch something");
		expect(handleApiError(error)).toBe(
			"Error de conexión. Verifica tu internet",
		);
	});

	it("returns the error message for other errors", () => {
		expect(handleApiError(new Error("boom"))).toBe("boom");
	});

	it("returns the unknown-error message for non-Error values", () => {
		expect(handleApiError("not an error")).toBe("Error desconocido");
	});
});
