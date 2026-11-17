"use client";

import { GraduationCap } from "lucide-react";
import { useSolutionStore } from "@fsd/entities/solution";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { DropdownMenuItem } from "@fsd/shared/ui/dropdown-menu";
import { useTourStore } from "../model/tour-store";

/** Menu entry that starts the guided tutorial for the open project, or resumes it. */
export function TourMenuItem() {
	const { t } = useTranslation();
	const currentProjectId = useSolutionStore((state) => state.id);
	const status = useTourStore((state) => state.status);
	const projectId = useTourStore((state) => state.projectId);
	const isRunningHere =
		(status === "running" || status === "minimized") && projectId === currentProjectId;

	const handleSelect = () => {
		const store = useTourStore.getState();
		if (isRunningHere) store.resume();
		else store.start(currentProjectId);
	};

	return (
		<DropdownMenuItem
			className="cursor-pointer"
			disabled={!currentProjectId}
			onSelect={handleSelect}
		>
			<GraduationCap />
			{t(isRunningHere ? "tour.ui.continueTutorial" : "tour.ui.launcher")}
		</DropdownMenuItem>
	);
}
