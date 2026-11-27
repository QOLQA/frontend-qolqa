import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSolutionStore } from "@fsd/entities/solution";
import type { VersionBackend, VersionFrontend } from "@fsd/entities/solution";
import type { TableData } from "@fsd/entities/solution";
import type { Node } from "@xyflow/react";

const {
	mockCreateEmptyVersion,
	mockDuplicateVersion,
	mockRenameVersion,
	mockDeleteVersion,
} = vi.hoisted(() => ({
	mockCreateEmptyVersion: vi.fn(),
	mockDuplicateVersion: vi.fn(),
	mockRenameVersion: vi.fn(),
	mockDeleteVersion: vi.fn(),
}));

vi.mock("../model/actions", () => ({
	createEmptyVersion: mockCreateEmptyVersion,
	duplicateVersion: mockDuplicateVersion,
	renameVersion: mockRenameVersion,
	deleteVersion: mockDeleteVersion,
	saveVersionDiagram: vi.fn(),
	saveSolutionQueriesAndImage: vi.fn(),
}));

import {
	createEmptyVersion,
	deleteVersion,
	duplicateVersion,
	updateVersionDescription,
} from "./versions";

function makeNode(): Node<TableData> {
	return {
		id: "customers",
		type: "table",
		position: { x: 0, y: 0 },
		data: {
			id: "customers",
			label: "Customers",
			columns: [{ id: "name", name: "name", type: "STRING" }],
		},
	};
}

const backendVersion = (
	_id: string,
	description: string,
	submodels: VersionBackend["submodels"] = [],
): VersionBackend => ({ _id, solution_id: "project", description, submodels });

const firstVersion: VersionFrontend = {
	_id: "v1",
	solution_id: "project",
	description: "project v1.0",
	nodes: [makeNode()],
	edges: [],
};

const secondVersion: VersionFrontend = {
	...firstVersion,
	_id: "v2",
	description: "project v2.0",
	nodes: [],
};

const storeState = () => useSolutionStore.getState();

beforeEach(() => {
	vi.clearAllMocks();
	const state = storeState();
	state.setId("project");
	state.setVersions([firstVersion, secondVersion]);
	state.setNodes(structuredClone(firstVersion.nodes));
	state.setEdges([]);
	state.setSelectedVersionId("v1");
});

describe("version mutations through server actions", () => {
	it("creates an empty version through the action and selects it", async () => {
		mockCreateEmptyVersion.mockResolvedValueOnce({
			ok: true,
			data: backendVersion("v3", "project v3.0"),
		});

		await createEmptyVersion("project", "project v3.0");

		expect(mockCreateEmptyVersion).toHaveBeenCalledWith("project", "project v3.0");
		expect(storeState().versions.map((version) => version._id)).toEqual([
			"v1",
			"v2",
			"v3",
		]);
		expect(storeState().selectedVersionId).toBe("v3");
		expect(storeState().nodes).toEqual([]);
	});

	it("duplicates the selected version through the action with its submodels", async () => {
		mockDuplicateVersion.mockResolvedValueOnce({
			ok: true,
			data: backendVersion("v3", "project v1.1"),
		});

		await duplicateVersion("project", "v1");

		expect(mockDuplicateVersion).toHaveBeenCalledTimes(1);
		const [solutionId, description, submodels] = mockDuplicateVersion.mock
			.calls[0] as [string, string, VersionBackend["submodels"]];
		expect(solutionId).toBe("project");
		expect(description).toBe("project v1.1");
		expect(submodels).toHaveLength(1);
		expect(submodels[0].nodes[0].cols[0].name).toBe("name");
		expect(storeState().selectedVersionId).toBe("v3");
	});

	it("renames a version through the action and stores the returned description", async () => {
		mockRenameVersion.mockResolvedValueOnce({
			ok: true,
			data: backendVersion("v1", "embedded orders"),
		});

		await updateVersionDescription("project", "v1", "embedded orders");

		expect(mockRenameVersion).toHaveBeenCalledWith(
			"project",
			"v1",
			"embedded orders",
		);
		expect(
			storeState().versions.find((version) => version._id === "v1")?.description,
		).toBe("embedded orders");
	});

	it("deletes a version through the action and keeps the remaining ones", async () => {
		mockDeleteVersion.mockResolvedValueOnce({ ok: true, data: null });

		await deleteVersion("v1");

		expect(mockDeleteVersion).toHaveBeenCalledWith("v1");
		expect(storeState().versions.map((version) => version._id)).toEqual(["v2"]);
		expect(storeState().selectedVersionId).toBe("v2");
	});

	it("refuses to delete the only version without calling the action", async () => {
		storeState().setVersions([firstVersion]);
		storeState().setSelectedVersionId("v1");

		await expect(deleteVersion("v1")).rejects.toThrow(
			"Cannot delete the only version",
		);
		expect(mockDeleteVersion).not.toHaveBeenCalled();
	});

	it("throws on a failed creation and leaves the store untouched", async () => {
		mockCreateEmptyVersion.mockResolvedValueOnce({
			ok: false,
			status: 500,
			detail: "boom",
		});

		await expect(createEmptyVersion("project", "project v3.0")).rejects.toThrow(
			"boom",
		);
		expect(storeState().versions.map((version) => version._id)).toEqual([
			"v1",
			"v2",
		]);
		expect(storeState().selectedVersionId).toBe("v1");
	});

	it("throws on a failed rename and keeps the previous description", async () => {
		mockRenameVersion.mockResolvedValueOnce({ ok: false, status: 500 });

		await expect(
			updateVersionDescription("project", "v1", "embedded orders"),
		).rejects.toThrow();
		expect(
			storeState().versions.find((version) => version._id === "v1")?.description,
		).toBe("project v1.0");
	});

	it("throws on a failed delete and keeps the version", async () => {
		mockDeleteVersion.mockResolvedValueOnce({ ok: false, status: 404 });

		await expect(deleteVersion("v1")).rejects.toThrow();
		expect(storeState().versions.map((version) => version._id)).toEqual([
			"v1",
			"v2",
		]);
	});
});
