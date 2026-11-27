import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSolutionStore } from "@fsd/entities/solution";
import { useQueriesStore } from "@fsd/entities/query/model/state/queriesStore";
import { api } from "@fsd/shared/api";
import type { Query } from "@fsd/entities/solution";

const { mockCreateQuery, mockUpdateQuery, mockDeleteQuery } = vi.hoisted(() => ({
	mockCreateQuery: vi.fn(),
	mockUpdateQuery: vi.fn(),
	mockDeleteQuery: vi.fn(),
}));

vi.mock("./actions", () => ({
	createQuery: mockCreateQuery,
	updateQuery: mockUpdateQuery,
	deleteQuery: mockDeleteQuery,
}));

vi.mock("@fsd/shared/api", () => ({
	api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { useQueryOperations } from "./use-query-operations";

const storedQuery: Query = {
	_id: "q1",
	full_query: "SELECT * FROM customers",
	collections: ["customers"],
	highlighted_words: ["SELECT"],
};

const newQueryData = {
	full_query: "SELECT * FROM orders",
	collections: ["orders"],
	highlighted_words: ["SELECT"],
};

const storeQueries = () => useQueriesStore.getState().queries;

const pendingAction = () => {
	let resolve!: (value: unknown) => void;
	const promise = new Promise((innerResolve) => {
		resolve = innerResolve;
	});
	return { promise, resolve };
};

beforeEach(() => {
	vi.clearAllMocks();
	useQueriesStore.getState().setQueries([storedQuery]);
	useSolutionStore.getState().setId("project");
});

describe("useQueryOperations optimistic flows", () => {
	it("inserts the query optimistically, then commits the created record", async () => {
		const pending = pendingAction();
		mockCreateQuery.mockReturnValueOnce(pending.promise);
		const { result } = renderHook(() => useQueryOperations());

		let creation!: Promise<Query>;
		act(() => {
			creation = result.current.createQuery(newQueryData, "temp-1");
		});

		expect(storeQueries().map((query) => query._id)).toEqual(["q1", "temp-1"]);
		expect(mockCreateQuery).toHaveBeenCalledWith({
			...newQueryData,
			solution_id: "project",
		});

		await act(async () => {
			pending.resolve({ ok: true, data: { ...storedQuery, ...newQueryData, _id: "q2" } });
			await creation;
		});

		expect(storeQueries().map((query) => query._id)).toEqual(["q1", "q2"]);
	});

	it("rolls the optimistic insert back when the action fails", async () => {
		mockCreateQuery.mockResolvedValueOnce({ ok: false, status: 0, detail: "offline" });
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await expect(
				result.current.createQuery(newQueryData, "temp-1"),
			).rejects.toThrow("offline");
		});

		expect(storeQueries().map((query) => query._id)).toEqual(["q1"]);
	});

	it("patches the query optimistically and reverts it when the action fails", async () => {
		mockUpdateQuery.mockResolvedValueOnce({ ok: false, status: 500 });
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await expect(
				result.current.updateQuery("q1", { full_query: "SELECT 2" }),
			).rejects.toThrow();
		});

		expect(mockUpdateQuery).toHaveBeenCalledWith("q1", { full_query: "SELECT 2" });
		expect(storeQueries()[0].full_query).toBe(storedQuery.full_query);
	});

	it("commits the backend record after a successful update", async () => {
		const updated = { ...storedQuery, full_query: "SELECT 2" };
		mockUpdateQuery.mockResolvedValueOnce({ ok: true, data: updated });
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await result.current.updateQuery("q1", { full_query: "SELECT 2" });
		});

		expect(storeQueries()[0]).toEqual(updated);
	});

	it("removes the query optimistically and restores it when the action fails", async () => {
		mockDeleteQuery.mockResolvedValueOnce({ ok: false, status: 403 });
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await expect(result.current.deleteQuery("q1")).rejects.toThrow();
		});

		expect(mockDeleteQuery).toHaveBeenCalledWith("q1");
		expect(storeQueries()).toEqual([storedQuery]);
	});

	it("keeps the query removed when the delete succeeds", async () => {
		mockDeleteQuery.mockResolvedValueOnce({ ok: true, data: null });
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await result.current.deleteQuery("q1");
		});

		expect(storeQueries()).toEqual([]);
	});

	it("keeps syncing queries through the client GET proxy", async () => {
		vi.mocked(api.get).mockResolvedValueOnce([storedQuery]);
		const { result } = renderHook(() => useQueryOperations());

		await act(async () => {
			await result.current.syncQueries();
		});

		expect(api.get).toHaveBeenCalledWith("/queries/solution/project");
		expect(storeQueries()).toEqual([storedQuery]);
	});
});
