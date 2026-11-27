import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockServerFetchWithAuth } = vi.hoisted(() => ({
	mockServerFetchWithAuth: vi.fn(),
}));

vi.mock("@fsd/shared/api/server", () => ({
	serverFetchWithAuth: mockServerFetchWithAuth,
}));

import { createQuery, deleteQuery, updateQuery } from "./actions";
import { ACTION_NETWORK_ERROR_MESSAGE } from "./action-results";

const jsonResponse = (status: number, body: unknown) => ({
	ok: status >= 200 && status < 300,
	status,
	json: () => Promise.resolve(body),
});

const emptyResponse = (status: number) => ({
	ok: true,
	status,
	json: () => Promise.reject(new Error("no body")),
});

const callOf = (index = 0) =>
	mockServerFetchWithAuth.mock.calls[index] as [string, RequestInit];

const query = {
	_id: "q1",
	full_query: "SELECT * FROM customers",
	collections: ["customers"],
	highlighted_words: ["SELECT"],
};

describe("query-management server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createQuery", () => {
		it("posts the new query with its solution and returns the created record", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(jsonResponse(201, query));

			const payload = {
				full_query: query.full_query,
				collections: query.collections,
				highlighted_words: query.highlighted_words,
				solution_id: "project",
			};

			await expect(createQuery(payload)).resolves.toEqual({
				ok: true,
				data: query,
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/queries");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual(payload);
		});

		it("returns the backend detail instead of throwing", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(422, { detail: "Invalid query" }),
			);

			await expect(
				createQuery({
					full_query: "",
					collections: [],
					highlighted_words: [],
					solution_id: "project",
				}),
			).resolves.toEqual({ ok: false, status: 422, detail: "Invalid query" });
		});

		it("rejects a created query without an id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, { ...query, _id: "" }),
			);

			await expect(
				createQuery({
					full_query: query.full_query,
					collections: query.collections,
					highlighted_words: query.highlighted_words,
					solution_id: "project",
				}),
			).resolves.toMatchObject({ ok: false, status: 502 });
		});

		it("rejects a blank solution id without calling the backend", async () => {
			await expect(
				createQuery({
					full_query: query.full_query,
					collections: query.collections,
					highlighted_words: query.highlighted_words,
					solution_id: "  ",
				}),
			).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El identificador del proyecto es obligatorio",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});

	describe("updateQuery", () => {
		it("patches the query by id and returns the stored record", async () => {
			const updated = { ...query, full_query: "SELECT 1" };
			mockServerFetchWithAuth.mockResolvedValueOnce(jsonResponse(200, updated));

			await expect(
				updateQuery("q1", { full_query: "SELECT 1" }),
			).resolves.toEqual({ ok: true, data: updated });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/queries/q1");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({ full_query: "SELECT 1" });
		});

		it("maps an unreachable backend to a network failure", async () => {
			mockServerFetchWithAuth.mockRejectedValueOnce(new Error("ECONNREFUSED"));

			await expect(updateQuery("q1", { full_query: "SELECT 1" })).resolves.toEqual(
				{ ok: false, status: 0, detail: ACTION_NETWORK_ERROR_MESSAGE },
			);
		});

		it("rejects a blank id without calling the backend", async () => {
			await expect(updateQuery("  ", { full_query: "SELECT 1" })).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El identificador de la query es obligatorio",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});

	describe("deleteQuery", () => {
		it("deletes the query by id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse(204));

			await expect(deleteQuery("q1")).resolves.toEqual({
				ok: true,
				data: null,
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/queries/q1");
			expect(init.method).toBe("DELETE");
		});

		it("returns a typed failure so the optimistic delete can roll back", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(404, { detail: "Query not found" }),
			);

			await expect(deleteQuery("q1")).resolves.toEqual({
				ok: false,
				status: 404,
				detail: "Query not found",
			});
		});
	});
});
