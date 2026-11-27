import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockServerFetchWithAuth, mockRevalidatePath } = vi.hoisted(() => ({
	mockServerFetchWithAuth: vi.fn(),
	mockRevalidatePath: vi.fn(),
}));

vi.mock("@fsd/shared/api/server", () => ({
	serverFetchWithAuth: mockServerFetchWithAuth,
}));

vi.mock("next/cache", () => ({
	revalidatePath: mockRevalidatePath,
}));

import {
	createPracticeSolution,
	createSolution,
	deleteSolution,
	updateSolution,
} from "./actions";
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

describe("projects server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createSolution", () => {
		it("posts the name to the backend and returns the new id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, { _id: "sol-new", name: "Atlas" }),
			);

			const result = await createSolution("Atlas");

			expect(result).toEqual({ ok: true, data: { _id: "sol-new" } });
			expect(mockServerFetchWithAuth).toHaveBeenCalledTimes(1);
			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual({ name: "Atlas" });
			expect(mockRevalidatePath).toHaveBeenCalledWith("/projects");
		});

		it("returns a typed failure for a blank name without calling the backend", async () => {
			const result = await createSolution("   ");

			expect(result).toEqual({
				ok: false,
				status: 400,
				detail: "El nombre del proyecto no puede estar vacío",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
			expect(mockRevalidatePath).not.toHaveBeenCalled();
		});

		it("returns the backend detail instead of throwing", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(409, { detail: "Solution already exists" }),
			);

			const result = await createSolution("Atlas");

			expect(result).toEqual({
				ok: false,
				status: 409,
				detail: "Solution already exists",
			});
			expect(mockRevalidatePath).not.toHaveBeenCalled();
		});

		it("maps an unreachable backend to a network failure", async () => {
			mockServerFetchWithAuth.mockRejectedValueOnce(new Error("ECONNREFUSED"));

			const result = await createSolution("Atlas");

			expect(result).toEqual({
				ok: false,
				status: 0,
				detail: ACTION_NETWORK_ERROR_MESSAGE,
			});
		});

		it("rejects a backend payload without an id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, { name: "Atlas" }),
			);

			const result = await createSolution("Atlas");

			expect(result.ok).toBe(false);
			expect(result).toMatchObject({ status: 502 });
			expect(mockRevalidatePath).not.toHaveBeenCalled();
		});
	});

	describe("createPracticeSolution", () => {
		it("returns the new solution id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, { _id: "sol-practice" }),
			);

			await expect(createPracticeSolution("Practice")).resolves.toEqual({
				ok: true,
				data: "sol-practice",
			});
			expect(mockRevalidatePath).toHaveBeenCalledWith("/projects");
		});

		it("propagates the failure result", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(500, { detail: "boom" }),
			);

			await expect(createPracticeSolution("Practice")).resolves.toEqual({
				ok: false,
				status: 500,
				detail: "boom",
			});
		});
	});

	describe("deleteSolution", () => {
		it("sends DELETE to the solution url and revalidates the list", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse(204));

			await expect(deleteSolution("sol-1")).resolves.toEqual({
				ok: true,
				data: null,
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/sol-1");
			expect(init.method).toBe("DELETE");
			expect(mockRevalidatePath).toHaveBeenCalledWith("/projects");
		});

		it("treats a missing solution as already deleted", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(404, { detail: "Solution does not exists" }),
			);

			await expect(deleteSolution("sol-1")).resolves.toEqual({
				ok: true,
				data: null,
			});
			expect(mockRevalidatePath).toHaveBeenCalledWith("/projects");
		});

		it("returns a typed failure without revalidating", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(403, { detail: "Not your solution" }),
			);

			await expect(deleteSolution("sol-1")).resolves.toEqual({
				ok: false,
				status: 403,
				detail: "Not your solution",
			});
			expect(mockRevalidatePath).not.toHaveBeenCalled();
		});

		it("rejects a blank solution id without calling the backend", async () => {
			await expect(deleteSolution("  ")).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El identificador del proyecto es obligatorio",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});

	describe("updateSolution", () => {
		it("patches the new name and revalidates the list", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(200, { _id: "sol-1", name: "Renamed" }),
			);

			await expect(updateSolution("sol-1", "Renamed")).resolves.toEqual({
				ok: true,
				data: { _id: "sol-1", name: "Renamed" },
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/sol-1");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({ name: "Renamed" });
			expect(mockRevalidatePath).toHaveBeenCalledWith("/projects");
		});

		it("returns a typed failure for a blank name without calling the backend", async () => {
			await expect(updateSolution("sol-1", "")).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El nombre del proyecto no puede estar vacío",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
			expect(mockRevalidatePath).not.toHaveBeenCalled();
		});

		it("rejects a blank solution id without calling the backend", async () => {
			await expect(updateSolution("", "Renamed")).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El identificador del proyecto es obligatorio",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});
});
