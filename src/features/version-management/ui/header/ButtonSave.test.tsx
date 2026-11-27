import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import {
	useSolutionStore,
	type TableData,
	type VersionFrontend,
} from "@fsd/entities/solution";
import { useQueriesStore } from "@fsd/entities/query/model/state/queriesStore";
import type { Query } from "@fsd/entities/solution";
import { uploadImage } from "@fsd/shared/lib/image";
import { toast } from "sonner";

const { mockToPng } = vi.hoisted(() => ({ mockToPng: vi.fn() }));
const {
	mockSaveVersionDiagram,
	mockSaveSolutionQueriesAndImage,
} = vi.hoisted(() => ({
	mockSaveVersionDiagram: vi.fn(),
	mockSaveSolutionQueriesAndImage: vi.fn(),
}));

vi.mock("html-to-image", () => ({ toPng: mockToPng }));
vi.mock("@fsd/shared/lib/image", () => ({ uploadImage: vi.fn() }));
vi.mock("../../model/actions", () => ({
	saveVersionDiagram: mockSaveVersionDiagram,
	saveSolutionQueriesAndImage: mockSaveSolutionQueriesAndImage,
	createEmptyVersion: vi.fn(),
	duplicateVersion: vi.fn(),
	deleteVersion: vi.fn(),
	renameVersion: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ButtonSave } from "./ButtonSave";

const secureUrl = "https://cdn.test/diagram.png";
const queries: Query[] = [
	{
		_id: "q1",
		full_query: "SELECT * FROM customers",
		collections: ["customers"],
		highlighted_words: ["SELECT"],
	},
];

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

const clickSave = async () => {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "Save changes" }));
};

beforeEach(() => {
	vi.clearAllMocks();
	mockToPng.mockResolvedValue("data:image/png;base64,AAA");
	vi.mocked(uploadImage).mockResolvedValue(secureUrl);
	mockSaveVersionDiagram.mockResolvedValue({ ok: true, data: null });
	mockSaveSolutionQueriesAndImage.mockResolvedValue({ ok: true, data: null });

	const version: VersionFrontend = {
		_id: "v1",
		solution_id: "project",
		description: "project v1.0",
		nodes: [makeNode()],
		edges: [],
	};
	const state = useSolutionStore.getState();
	state.setId("project");
	state.setVersions([version]);
	state.setNodes(structuredClone(version.nodes));
	state.setEdges([]);
	state.setSelectedVersionId("v1");
	useQueriesStore.getState().setQueries(queries);
});

describe("ButtonSave", () => {
	it("uploads the canvas image first and then saves queries with it", async () => {
		render(<ButtonSave />);
		await clickSave();

		await waitFor(() =>
			expect(mockSaveSolutionQueriesAndImage).toHaveBeenCalledWith(
				"project",
				queries,
				secureUrl,
			),
		);

		expect(uploadImage).toHaveBeenCalledWith("data:image/png;base64,AAA", "project");
		const uploadOrder = vi.mocked(uploadImage).mock.invocationCallOrder[0];
		const solutionSaveOrder =
			mockSaveSolutionQueriesAndImage.mock.invocationCallOrder[0];
		expect(uploadOrder).toBeLessThan(solutionSaveOrder);
		expect(toast.success).toHaveBeenCalled();
	});

	it("saves the diagram through the version action", async () => {
		render(<ButtonSave />);
		await clickSave();

		await waitFor(() => expect(mockSaveVersionDiagram).toHaveBeenCalledTimes(1));
		const [solutionId, versionId, diagram] = mockSaveVersionDiagram.mock
			.calls[0] as [string, string, { submodels: unknown[] }];
		expect(solutionId).toBe("project");
		expect(versionId).toBe("v1");
		expect(diagram.submodels).toHaveLength(1);
	});

	it("still saves the diagram when the image upload fails", async () => {
		vi.mocked(uploadImage).mockRejectedValueOnce(new Error("cloudinary down"));
		render(<ButtonSave />);
		await clickSave();

		await waitFor(() => expect(mockSaveVersionDiagram).toHaveBeenCalledTimes(1));
		expect(mockSaveSolutionQueriesAndImage).not.toHaveBeenCalled();
		expect(toast.success).toHaveBeenCalled();
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("reports a failed save and does not claim success", async () => {
		mockSaveVersionDiagram.mockResolvedValueOnce({
			ok: false,
			status: 500,
			detail: "boom",
		});
		render(<ButtonSave />);
		await clickSave();

		await waitFor(() => expect(toast.error).toHaveBeenCalled());
		expect(toast.success).not.toHaveBeenCalled();
	});
});
