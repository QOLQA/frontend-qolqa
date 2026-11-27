import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VersionBackend } from "@fsd/entities/solution";

const { mockServerFetchWithAuth } = vi.hoisted(() => ({
	mockServerFetchWithAuth: vi.fn(),
}));

vi.mock("@fsd/shared/api/server", () => ({
	serverFetchWithAuth: mockServerFetchWithAuth,
}));

import {
	createEmptyVersion,
	deleteVersion,
	duplicateVersion,
	renameVersion,
	saveSolutionQueriesAndImage,
	saveVersionDiagram,
} from "./actions";
import { ACTION_NETWORK_ERROR_MESSAGE } from "@fsd/shared/api/action-results";

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

const versionPayload: VersionBackend = {
	_id: "",
	solution_id: "project",
	description: "project v1.0",
	submodels: [{ nodes: [], edges: [] }],
};

const createdVersion: VersionBackend = {
	_id: "v9",
	solution_id: "project",
	description: "project v9.0",
	submodels: [],
};

describe("version-management server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("saveVersionDiagram", () => {
		it("patches the whole diagram to the version url", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse(204));

			await expect(
				saveVersionDiagram("project", "v1", versionPayload),
			).resolves.toEqual({ ok: true, data: null });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/project/versions/v1");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual(versionPayload);
		});

		it("returns the backend detail instead of throwing", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(403, { detail: "Not your solution" }),
			);

			await expect(
				saveVersionDiagram("project", "v1", versionPayload),
			).resolves.toEqual({
				ok: false,
				status: 403,
				detail: "Not your solution",
			});
		});

		it("maps an unreachable backend to a network failure", async () => {
			mockServerFetchWithAuth.mockRejectedValueOnce(new Error("ECONNREFUSED"));

			await expect(
				saveVersionDiagram("project", "v1", versionPayload),
			).resolves.toEqual({
				ok: false,
				status: 0,
				detail: ACTION_NETWORK_ERROR_MESSAGE,
			});
		});

		it("rejects a blank version id without calling the backend", async () => {
			await expect(
				saveVersionDiagram("project", "  ", versionPayload),
			).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "El identificador de la versión es obligatorio",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});

	describe("saveSolutionQueriesAndImage", () => {
		it("patches queries and the uploaded image to the solution url", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse(204));
			const queries = [
				{ _id: "q1", full_query: "SELECT 1", collections: [], highlighted_words: [] },
			];

			await expect(
				saveSolutionQueriesAndImage("project", queries, "https://cdn.test/a.png"),
			).resolves.toEqual({ ok: true, data: null });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/project");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({
				queries,
				src_img: "https://cdn.test/a.png",
			});
		});

		it("returns a typed failure for a blank image without calling the backend", async () => {
			await expect(
				saveSolutionQueriesAndImage("project", [], ""),
			).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "La imagen del diagrama es obligatoria",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});
	});

	describe("createEmptyVersion", () => {
		it("posts an empty submodel list and returns the created version", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, createdVersion),
			);

			await expect(
				createEmptyVersion("project", "project v9.0"),
			).resolves.toEqual({ ok: true, data: createdVersion });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/project/versions");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual({
				submodels: [],
				description: "project v9.0",
				solution_id: "project",
				_id: "",
			});
		});

		it("rejects a created version without an id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, { ...createdVersion, _id: "" }),
			);

			await expect(
				createEmptyVersion("project", "project v9.0"),
			).resolves.toMatchObject({ ok: false, status: 502 });
		});
	});

	describe("duplicateVersion", () => {
		it("posts the current submodels as the copy and returns it", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(201, createdVersion),
			);

			await expect(
				duplicateVersion("project", "project v9.0", versionPayload.submodels),
			).resolves.toEqual({ ok: true, data: createdVersion });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/project/versions");
			expect(init.method).toBe("POST");
			expect(JSON.parse(init.body as string)).toEqual({
				submodels: versionPayload.submodels,
				description: "project v9.0",
				solution_id: "project",
				_id: "",
			});
		});

		it("returns a typed failure when the backend rejects the copy", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(400, { detail: "Invalid submodel" }),
			);

			await expect(
				duplicateVersion("project", "project v9.0", []),
			).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "Invalid submodel",
			});
		});
	});

	describe("deleteVersion", () => {
		it("deletes the version by id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse(204));

			await expect(deleteVersion("v2")).resolves.toEqual({
				ok: true,
				data: null,
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/versions/v2");
			expect(init.method).toBe("DELETE");
		});

		it("surfaces a backend failure so the modal stays open", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(404, { detail: "Version not found" }),
			);

			await expect(deleteVersion("v2")).resolves.toEqual({
				ok: false,
				status: 404,
				detail: "Version not found",
			});
		});
	});

	describe("renameVersion", () => {
		it("patches the description and returns the updated version", async () => {
			const renamed = { ...createdVersion, description: "embedded orders" };
			mockServerFetchWithAuth.mockResolvedValueOnce(jsonResponse(200, renamed));

			await expect(
				renameVersion("project", "v9", "embedded orders"),
			).resolves.toEqual({ ok: true, data: renamed });

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/solutions/project/versions/v9");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({
				description: "embedded orders",
			});
		});

		it("rejects a blank description without calling the backend", async () => {
			await expect(renameVersion("project", "v9", "   ")).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "La descripción de la versión no puede estar vacía",
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});

		it("rejects a response without an id", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(200, { description: "embedded orders" }),
			);

			await expect(
				renameVersion("project", "v9", "embedded orders"),
			).resolves.toMatchObject({ ok: false, status: 502 });
		});
	});
});
