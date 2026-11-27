import { describe, expect, it, vi } from "vitest";

const { mockServerFetchWithAuth } = vi.hoisted(() => ({
	mockServerFetchWithAuth: vi.fn(),
}));

vi.mock("@fsd/shared/api/server", () => ({
	serverFetchWithAuth: mockServerFetchWithAuth,
}));

import { getSolutionRequest, getSolutionsRequest } from "./solution";

const okResponse = (data: unknown) => ({
	ok: true,
	status: 200,
	json: () => Promise.resolve(data),
});

const errorResponse = (status: number) => ({
	ok: false,
	status,
	json: () => Promise.resolve({ detail: "error" }),
});

describe("solution server fetchers", () => {
	it("getSolutionRequest reads the solution through serverFetchWithAuth", async () => {
		mockServerFetchWithAuth.mockResolvedValueOnce(
			okResponse({ _id: "solution-1", versions: [] }),
		);

		await expect(getSolutionRequest("solution-1")).resolves.toEqual({
			_id: "solution-1",
			versions: [],
		});
		expect(mockServerFetchWithAuth).toHaveBeenCalledWith("/solutions/solution-1");
	});

	it("getSolutionRequest keeps the UNAUTHORIZED/FORBIDDEN codes getDiagramData maps", async () => {
		mockServerFetchWithAuth.mockResolvedValueOnce(errorResponse(401));
		await expect(getSolutionRequest("solution-1")).rejects.toThrow("UNAUTHORIZED");

		mockServerFetchWithAuth.mockResolvedValueOnce(errorResponse(403));
		await expect(getSolutionRequest("solution-1")).rejects.toThrow("FORBIDDEN");

		mockServerFetchWithAuth.mockResolvedValueOnce(errorResponse(500));
		await expect(getSolutionRequest("solution-1")).rejects.toThrow(
			"Failed to fetch solution",
		);
	});

	it("getSolutionsRequest reads the solution list and keeps the UNAUTHORIZED code", async () => {
		mockServerFetchWithAuth.mockResolvedValueOnce(
			okResponse([{ _id: "solution-1" }]),
		);

		await expect(getSolutionsRequest()).resolves.toEqual([{ _id: "solution-1" }]);
		expect(mockServerFetchWithAuth).toHaveBeenCalledWith("/solutions");

		mockServerFetchWithAuth.mockResolvedValueOnce(errorResponse(401));
		await expect(getSolutionsRequest()).rejects.toThrow("UNAUTHORIZED");

		mockServerFetchWithAuth.mockResolvedValueOnce(errorResponse(500));
		await expect(getSolutionsRequest()).rejects.toThrow(
			"Failed to fetch solutions",
		);
	});
});
