import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSolutionStore } from "@fsd/entities/solution";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@fsd/shared/ui/dropdown-menu";
import { useTourStore } from "../model/tour-store";
import { TourMenuItem } from "./TourMenuItem";

vi.mock("@fsd/shared/i18n/use-translation", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const openMenu = async () => {
	render(
		<DropdownMenu>
			<DropdownMenuTrigger>menu</DropdownMenuTrigger>
			<DropdownMenuContent>
				<TourMenuItem />
			</DropdownMenuContent>
		</DropdownMenu>,
	);
	await userEvent.click(screen.getByText("menu"));
};

afterEach(cleanup);

describe("TourMenuItem", () => {
	it("starts the tutorial for the open project", async () => {
		useSolutionStore.setState({ id: "p1" });
		useTourStore.setState({ status: "completed", projectId: null });
		await openMenu();
		await userEvent.click(screen.getByRole("menuitem", { name: "tour.ui.launcher" }));
		expect(useTourStore.getState()).toMatchObject({ status: "running", projectId: "p1" });
	});

	it("offers to continue a paused tutorial of the same project", async () => {
		useSolutionStore.setState({ id: "p1" });
		useTourStore.setState({ status: "minimized", projectId: "p1", stepIndex: 5 });
		await openMenu();
		await userEvent.click(screen.getByRole("menuitem", { name: "tour.ui.continueTutorial" }));
		expect(useTourStore.getState()).toMatchObject({ status: "running", stepIndex: 5 });
	});
});
