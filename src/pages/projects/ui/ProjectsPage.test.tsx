import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const {
	mockCreateSolution,
	mockCreatePracticeSolution,
	mockDeleteSolution,
	mockUpdateSolution,
	mockPush,
	mockRefresh,
	mockSetSolutionId,
	mockLogout,
	mockApiPost,
	mockApiPatch,
	mockApiDelete,
} = vi.hoisted(() => ({
	mockCreateSolution: vi.fn(),
	mockCreatePracticeSolution: vi.fn(),
	mockDeleteSolution: vi.fn(),
	mockUpdateSolution: vi.fn(),
	mockPush: vi.fn(),
	mockRefresh: vi.fn(),
	mockSetSolutionId: vi.fn(),
	mockLogout: vi.fn(),
	mockApiPost: vi.fn(),
	mockApiPatch: vi.fn(),
	mockApiDelete: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@fsd/pages/projects/model/actions", () => ({
	createSolution: mockCreateSolution,
	createPracticeSolution: mockCreatePracticeSolution,
	deleteSolution: mockDeleteSolution,
	updateSolution: mockUpdateSolution,
}));

vi.mock("@fsd/shared/api", () => ({
	api: { post: mockApiPost, patch: mockApiPatch, delete: mockApiDelete },
}));

vi.mock("@fsd/features/auth", () => ({
	useAuthContext: () => ({ user: null, logout: mockLogout }),
}));

vi.mock("@fsd/shared/i18n/use-translation", () => ({
	useTranslation: () => ({ t: (path: string) => path }),
}));

vi.mock("@fsd/shared/ui/logo", () => ({
	Logo: () => <div data-testid="logo" />,
}));

vi.mock("@fsd/entities/solution", () => ({
	SolutionCard: ({
		_id,
		onRequestDelete,
		onRequestEdit,
		onOpen,
	}: {
		_id: string;
		onRequestDelete: (id: string) => void;
		onRequestEdit: (id: string) => void;
		onOpen: (id: string) => void;
	}) => (
		<li>
			<button type="button" onClick={() => onOpen(_id)}>
				{`open-${_id}`}
			</button>
			<button type="button" onClick={() => onRequestDelete(_id)}>
				{`request-delete-${_id}`}
			</button>
			<button type="button" onClick={() => onRequestEdit(_id)}>
				{`request-edit-${_id}`}
			</button>
		</li>
	),
}));

vi.mock("@fsd/features/project-management", () => ({
	useProjectsStore: {
		getState: () => ({
			solutionId: "sol-1",
			solutionDataToEdit: { _id: "sol-1", name: "Renamed" },
			setSolutionId: mockSetSolutionId,
			setSolutionDataToEdit: vi.fn(),
		}),
	},
	AddProjectModal: ({ onSubmit }: { onSubmit: (name: string) => unknown }) => (
		<button type="button" onClick={() => void onSubmit("Atlas")}>
			submit-add
		</button>
	),
	EditProjectModal: ({ onSubmit }: { onSubmit: () => unknown }) => (
		<button type="button" onClick={() => void onSubmit()}>
			submit-edit
		</button>
	),
	DeleteProjectModal: ({ onConfirm }: { onConfirm: () => unknown }) => (
		<button type="button" onClick={() => void onConfirm()}>
			submit-delete
		</button>
	),
}));

vi.mock("@fsd/features/onboarding-tour", () => ({
	TourBanner: ({
		onCreatePracticeProject,
	}: {
		onCreatePracticeProject: (name: string) => Promise<string | null>;
	}) => (
		<button
			type="button"
			onClick={() => {
				void onCreatePracticeProject("Practice").then((id) => {
					practiceProjectId = id;
				});
			}}
		>
			start-practice
		</button>
	),
}));

let practiceProjectId: string | null | undefined;

import { ProjectsPage } from "./ProjectsPage";

const initialSolutions = [{ _id: "sol-1", name: "Atlas" }];

const renderPage = () =>
	render(<ProjectsPage initialSolutions={initialSolutions} />);

const openAddModal = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.click(screen.getByRole("button", { name: /other\.newProject/ }));
};

describe("ProjectsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		practiceProjectId = undefined;
	});

	it("creates a project through the server action and opens it", async () => {
		mockCreateSolution.mockResolvedValueOnce({
			ok: true,
			data: { _id: "sol-new" },
		});
		const user = userEvent.setup();
		renderPage();

		await openAddModal(user);
		await user.click(screen.getByRole("button", { name: "submit-add" }));

		await waitFor(() => {
			expect(mockCreateSolution).toHaveBeenCalledWith("Atlas");
		});
		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith("/projects/sol-new/modeling");
		});
		expect(mockApiPost).not.toHaveBeenCalled();
	});

	it("stays on the projects page when creation fails", async () => {
		mockCreateSolution.mockResolvedValueOnce({
			ok: false,
			status: 500,
			detail: "boom",
		});
		const user = userEvent.setup();
		renderPage();

		await openAddModal(user);
		await user.click(screen.getByRole("button", { name: "submit-add" }));

		await waitFor(() => {
			expect(mockCreateSolution).toHaveBeenCalledTimes(1);
		});
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("opens a project when its card is opened", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole("button", { name: "open-sol-1" }));

		expect(mockPush).toHaveBeenCalledWith("/projects/sol-1/modeling");
	});

	it("deletes a project through the server action and resyncs the list", async () => {
		mockDeleteSolution.mockResolvedValueOnce({ ok: true, data: null });
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: "request-delete-sol-1" }),
		);
		await user.click(screen.getByRole("button", { name: "submit-delete" }));

		await waitFor(() => {
			expect(mockDeleteSolution).toHaveBeenCalledWith("sol-1");
		});
		expect(mockSetSolutionId).toHaveBeenCalledWith("sol-1");
		await waitFor(() => {
			expect(mockRefresh).toHaveBeenCalled();
		});
		expect(mockApiDelete).not.toHaveBeenCalled();
	});

	it("renames a project through the server action and resyncs the list", async () => {
		mockUpdateSolution.mockResolvedValueOnce({
			ok: true,
			data: { _id: "sol-1", name: "Renamed" },
		});
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: "request-edit-sol-1" }),
		);
		await user.click(screen.getByRole("button", { name: "submit-edit" }));

		await waitFor(() => {
			expect(mockUpdateSolution).toHaveBeenCalledWith("sol-1", "Renamed");
		});
		await waitFor(() => {
			expect(mockRefresh).toHaveBeenCalled();
		});
		expect(mockApiPatch).not.toHaveBeenCalled();
	});

	it("returns the practice project id from the create action", async () => {
		mockCreatePracticeSolution.mockResolvedValueOnce({
			ok: true,
			data: "sol-practice",
		});
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole("button", { name: "start-practice" }));

		await waitFor(() => {
			expect(practiceProjectId).toBe("sol-practice");
		});
		expect(mockCreatePracticeSolution).toHaveBeenCalledWith("Practice");
	});

	it("returns null for the practice project when the action fails", async () => {
		mockCreatePracticeSolution.mockResolvedValueOnce({
			ok: false,
			status: 500,
			detail: "boom",
		});
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole("button", { name: "start-practice" }));

		await waitFor(() => {
			expect(practiceProjectId).toBeNull();
		});
	});
});
