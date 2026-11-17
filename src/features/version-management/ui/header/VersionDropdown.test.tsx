import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { useSolutionStore, type TableData, type VersionFrontend } from "@fsd/entities/solution";
import { api } from "@fsd/shared/api";
import { toast } from "sonner";
import { hasUnsavedCanvasChanges } from "../../lib/canvas-changes";
import { saveCanvas } from "../../lib/save";
import { VersionDropdown } from "./VersionDropdown";

vi.mock("@fsd/shared/api", () => ({ api: { patch: vi.fn(), post: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeNode(): Node<TableData> {
	return {
		id: "customers", type: "table", position: { x: 0, y: 0 },
		data: { id: "customers", label: "Customers", columns: [{ id: "name", name: "name", type: "STRING" }] },
	};
}

function editColumn(name = "full_name") {
	const state = useSolutionStore.getState();
	const node = structuredClone(state.nodes[0]);
	node.data.columns[0].name = name;
	state.editNode(node.id, node);
}

function unloadIsPrevented() {
	const event = new Event("beforeunload", { cancelable: true });
	window.dispatchEvent(event);
	return event.defaultPrevented;
}

async function requestSecondVersion() {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "project v1.0" }));
	await user.click(screen.getByRole("button", { name: "project v2.0" }));
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(api.patch).mockResolvedValue({});
	const version: VersionFrontend = {
		_id: "v1", solution_id: "project", description: "v1.0", nodes: [makeNode()], edges: [],
	};
	const state = useSolutionStore.getState();
	state.setId("project");
	state.setVersions([version, { ...version, _id: "v2", description: "v2.0", nodes: [] }]);
	state.setNodes(structuredClone(version.nodes));
	state.setEdges([]);
	state.setSelectedVersionId("v1");
	state.setIsChangingVersion(false);
});

afterEach(cleanup);

describe("version changes with pending edits", () => {
	it("switches clean versions without saving or showing a dialog", async () => {
		render(<VersionDropdown />);
		await requestSecondVersion();
		expect(useSolutionStore.getState().selectedVersionId).toBe("v2");
		expect(api.patch).not.toHaveBeenCalled();
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});

	it("keeps the current version and its edits when cancelling", async () => {
		editColumn();
		render(<VersionDropdown />);
		await requestSecondVersion();
		const dialog = screen.getByRole("alertdialog");
		expect(within(dialog).getAllByRole("button")).toHaveLength(2);
		expect(api.patch).not.toHaveBeenCalled();
		await userEvent.click(within(dialog).getByRole("button", { name: "Keep editing" }));
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(useSolutionStore.getState().selectedVersionId).toBe("v1");
		expect(useSolutionStore.getState().nodes[0].data.columns[0].name).toBe("full_name");
	});

	it("waits for server confirmation and prevents duplicate submissions", async () => {
		editColumn();
		let resolveSave!: (value: object) => void;
		vi.mocked(api.patch).mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve; }));
		render(<VersionDropdown />);
		await requestSecondVersion();
		await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
		expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
		expect(useSolutionStore.getState().selectedVersionId).toBe("v1");
		expect(unloadIsPrevented()).toBe(true);
		await act(async () => resolveSave({}));
		expect(api.patch).toHaveBeenCalledTimes(1);
		expect(api.patch).toHaveBeenCalledWith("/solutions/project/versions/v1", expect.objectContaining({
			submodels: [expect.objectContaining({ nodes: [expect.objectContaining({
				cols: [expect.objectContaining({ name: "full_name" })],
			})] })],
		}));
		expect(useSolutionStore.getState().selectedVersionId).toBe("v2");
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(unloadIsPrevented()).toBe(false);
	});

	it("keeps the dialog and edits after a failed save and allows retrying", async () => {
		editColumn();
		vi.mocked(api.patch).mockRejectedValueOnce(new Error("offline"));
		render(<VersionDropdown />);
		await requestSecondVersion();
		await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(useSolutionStore.getState().selectedVersionId).toBe("v1");
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(true);
		expect(toast.error).toHaveBeenCalled();
		await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
		expect(useSolutionStore.getState().selectedVersionId).toBe("v2");
	});

	it("does not switch if additional edits arrive while saving", async () => {
		editColumn();
		let resolveSave!: (value: object) => void;
		vi.mocked(api.patch).mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve; }));
		render(<VersionDropdown />);
		await requestSecondVersion();
		await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
		act(() => editColumn("newer_name"));
		await act(async () => resolveSave({}));
		expect(useSolutionStore.getState().selectedVersionId).toBe("v1");
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(unloadIsPrevented()).toBe(true);
	});

	it("also warns before creating a version that would replace the canvas", async () => {
		editColumn();
		render(<VersionDropdown />);
		await userEvent.click(screen.getByRole("button", { name: "project v1.0" }));
		await userEvent.click(screen.getByRole("button", { name: "Add new version" }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(api.post).not.toHaveBeenCalled();
	});

	it("warns on reload only while there are unsaved changes, including after manual save", async () => {
		render(<VersionDropdown />);
		expect(unloadIsPrevented()).toBe(false);
		act(() => editColumn());
		expect(unloadIsPrevented()).toBe(true);
		await act(async () => { await saveCanvas("project", "v1", undefined, false); });
		expect(unloadIsPrevented()).toBe(false);
	});

	it("protects relationship edits and clears the warning when changes are undone", () => {
		const state = useSolutionStore.getState();
		const secondNode = { ...makeNode(), id: "orders" };
		const edge = { id: "relationship", source: "customers", target: "orders", data: { cardinality: "1 ... 1" } };
		state.setVersions(state.versions.map((version) => version._id === "v1"
			? { ...version, nodes: [makeNode(), secondNode], edges: [edge] } : version));
		state.setNodes([makeNode(), secondNode]);
		state.setEdges([edge]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(false);
		state.setEdges([{ ...edge, data: { cardinality: "1 ... n" } }]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(true);
		state.setEdges([edge]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(false);
	});

	it("saves before creating and selecting a new version after confirmation", async () => {
		editColumn();
		vi.mocked(api.post).mockResolvedValueOnce({
			_id: "v3", solution_id: "project", description: "v3.0", submodels: [],
		});
		render(<VersionDropdown />);
		await userEvent.click(screen.getByRole("button", { name: "project v1.0" }));
		await userEvent.click(screen.getByRole("button", { name: "Add new version" }));
		await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
		expect(api.patch).toHaveBeenCalledTimes(1);
		expect(api.post).toHaveBeenCalledTimes(1);
		expect(useSolutionStore.getState().selectedVersionId).toBe("v3");
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});

	it("ignores selection and dimensions, but detects attribute types, positions and nested fields", () => {
		const state = useSolutionStore.getState();
		state.setNodes([{ ...makeNode(), selected: true, measured: { width: 100, height: 100 } }]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(false);
		const node = makeNode();
		node.data.columns[0].type = "INT";
		state.setNodes([node]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(true);
		state.setNodes([{ ...makeNode(), position: { x: 5, y: 0 } }]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(true);
		state.setNodes([{ ...makeNode(), data: { ...makeNode().data, nestedTables: [makeNode().data] } }]);
		expect(hasUnsavedCanvasChanges(useSolutionStore.getState())).toBe(true);
	});

	it("does not prompt when the selected version is clicked again", async () => {
		editColumn();
		render(<VersionDropdown />);
		await userEvent.click(screen.getByRole("button", { name: "project v1.0" }));
		fireEvent.click(within(screen.getByRole("listbox")).getByRole("button", { name: "project v1.0" }));
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(api.patch).not.toHaveBeenCalled();
	});
});
