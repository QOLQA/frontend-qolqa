"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowRight, GraduationCap, X } from "lucide-react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { Button } from "@fsd/shared/ui/button";
import { TOUR_CHAPTERS } from "../model/tour-steps";
import { useTourStore } from "../model/tour-store";

const subscribe = () => () => {};

type TourBannerProps = {
	hasProjects: boolean;
	/** Creates the practice project and returns its id. */
	onCreatePracticeProject: (name: string) => Promise<string | null>;
	onOpenProject: (projectId: string) => void;
};

/** Invitation shown on the projects page to new users. */
export function TourBanner({
	hasProjects,
	onCreatePracticeProject,
	onOpenProject,
}: TourBannerProps) {
	const { t } = useTranslation();
	const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
	const status = useTourStore((state) => state.status);
	const [isCreating, setIsCreating] = useState(false);

	const isVisible =
		status === "idle" || (status === "dismissed" && !hasProjects);
	if (!isMounted || !isVisible) return null;

	const handleStart = async () => {
		setIsCreating(true);
		const projectId = await onCreatePracticeProject(
			t("tour.ui.practiceProjectName"),
		);
		setIsCreating(false);
		if (!projectId) return;
		useTourStore.getState().start(projectId);
		onOpenProject(projectId);
	};

	return (
		<section className="relative mb-12 overflow-hidden rounded-2xl border border-gray bg-terciary-gray p-6 text-white shadow-lg dark:border-transparent dark:bg-cuartenary-gray motion-safe:animate-tour-pop">
			<div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
				<div className="flex items-start gap-4">
					<span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-icon-active-bg text-blue">
						<GraduationCap className="size-6" />
					</span>
					<div>
						<h2 className="text-h3 font-semibold text-white">
							{t("tour.ui.bannerTitle")}
						</h2>
						<p className="mt-1 max-w-2xl text-p text-secondary-white">
							{t("tour.ui.bannerBody")}
						</p>
						<ul className="mt-3 flex flex-wrap gap-1.5">
							{TOUR_CHAPTERS.map((key, index) => (
								<li
									key={key}
									className="flex items-center gap-1.5 rounded-full border border-gray bg-secondary-gray px-2.5 py-0.5 text-h7 text-secondary-white dark:border-transparent dark:bg-terciary-gray"
								>
									<span className="font-semibold text-blue">{index + 1}</span>
									{t(`tour.chapters.${key}`)}
								</li>
							))}
						</ul>
					</div>
				</div>
				<Button
					type="button"
					variant="success"
					size="lg"
					onClick={handleStart}
					disabled={isCreating}
					className="shrink-0 cursor-pointer"
				>
					{t("tour.ui.bannerCta")}
					<ArrowRight className="size-4" />
				</Button>
			</div>
			{status === "idle" && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => useTourStore.getState().dismiss()}
					aria-label={t("tour.ui.bannerDismiss")}
					title={t("tour.ui.bannerDismiss")}
					className="absolute right-3 top-3 size-8 cursor-pointer rounded-lg text-icon-muted hover:bg-primary-gray hover:text-icon-intense dark:hover:bg-gray"
				>
					<X className="size-4" />
				</Button>
			)}
		</section>
	);
}
