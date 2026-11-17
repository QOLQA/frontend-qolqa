"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useTourStore } from "../model/tour-store";

const subscribe = () => () => {};

/** Header button that (re)starts the guided tutorial for the current project. */
export function TourLauncher() {
	const { t } = useTranslation();
	const { diagramId } = useParams<{ diagramId?: string }>() ?? {};
	const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
	const status = useTourStore((state) => state.status);
	const projectId = useTourStore((state) => state.projectId);
	const isRunningHere =
		(status === "running" || status === "minimized") && projectId === diagramId;

	const handleClick = () => {
		if (!diagramId) return;
		const store = useTourStore.getState();
		if (isRunningHere) {
			store.resume();
			return;
		}
		store.start(diagramId);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			title={t("tour.ui.launcher")}
			aria-label={t("tour.ui.launcher")}
			className="group relative cursor-pointer"
		>
			<GraduationCap className="size-7 text-icon-muted group-hover:text-icon-intense transition-colors duration-300" />
			{isMounted && status === "idle" && (
				<span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-blue motion-safe:animate-pulse" />
			)}
		</button>
	);
}
