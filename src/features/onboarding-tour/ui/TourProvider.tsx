"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, Play } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { TOUR_CHAPTERS } from "../model/tour-steps";
import { useTourStore } from "../model/tour-store";
import { tourRoutePath, useTourEngine } from "../model/use-tour-engine";
import { TourCard } from "./TourCard";
import { TourSpotlight } from "./TourSpotlight";

const subscribe = () => () => {};
const MODELING_PATH = /^\/projects\/([^/]+)\/modeling$/;

function TourPill({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full border border-gray bg-terciary-gray py-1.5 pl-1.5 pr-5 text-h6 text-white shadow-lg cursor-pointer transition-colors hover:bg-primary-gray dark:border-transparent dark:bg-cuartenary-gray dark:hover:bg-gray motion-safe:animate-tour-rise"
		>
			<span className="relative flex size-8 items-center justify-center rounded-full bg-icon-active-bg text-blue">
				<GraduationCap className="size-4" />
				<span className="absolute right-0 top-0 size-2 rounded-full bg-blue motion-safe:animate-pulse" />
			</span>
			{label}
			<Play className="size-3.5 text-icon-muted transition-colors group-hover:text-blue" />
		</button>
	);
}

/** True once `value` has stayed true for `delayMs` (avoids flashes during navigation). */
function useSettledFlag(value: boolean, delayMs: number) {
	const [settled, setSettled] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setSettled(value), value ? delayMs : 0);
		return () => clearTimeout(timer);
	}, [value, delayMs]);
	return value && settled;
}

/** Global host for the guided tutorial. Mount once in the root layout. */
export function TourProvider() {
	const { t } = useTranslation();
	const router = useRouter();
	const pathname = usePathname();
	const isMounted = useSyncExternalStore(subscribe, () => true, () => false);
	const status = useTourStore((state) => state.status);
	const projectId = useTourStore((state) => state.projectId);
	const engine = useTourEngine();
	const { step, stepIndex, isActive, targetRect, container } = engine;
	const isOffRoute = useSettledFlag(engine.isOffRoute, 1000);

	// First visit to a project: offer the tutorial.
	useEffect(() => {
		const match = pathname?.match(MODELING_PATH);
		if (status === "idle" && match?.[1]) {
			useTourStore.getState().start(match[1]);
		}
	}, [pathname, status]);

	// Celebrate each completed chapter.
	const previousChapter = useRef(step.chapter);
	useEffect(() => {
		const finished = previousChapter.current;
		previousChapter.current = step.chapter;
		if (!isActive || step.chapter <= finished) return;
		const chapterKey = TOUR_CHAPTERS[finished - 1];
		if (chapterKey) {
			toast.success(
				t("tour.ui.chapterDone").replace(
					"{name}",
					t(`tour.chapters.${chapterKey}`),
				),
			);
		}
	}, [isActive, step.chapter, t]);

	// Esc minimizes the tour when no dialog is open (dialogs handle Esc themselves).
	useEffect(() => {
		if (!isActive) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			if (document.querySelector("dialog[open], [role='menu']")) return;
			useTourStore.getState().minimize();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isActive]);

	if (!isMounted) return null;

	const store = useTourStore.getState();

	if (status === "minimized" && !engine.isOffRoute) {
		return createPortal(
			<TourPill label={t("tour.ui.resume")} onClick={store.resume} />,
			document.body,
		);
	}

	if (isOffRoute && projectId && pathname?.startsWith("/projects")) {
		return createPortal(
			<TourPill
				label={t("tour.ui.continueInProject")}
				onClick={() => {
					store.resume();
					router.push(tourRoutePath(projectId, step.route));
				}}
			/>,
			document.body,
		);
	}

	if (!isActive || !container) return null;

	const insideDialog = container !== document.body;
	const hasTarget = Boolean(step.target);

	return createPortal(
		<>
			{/* Dialogs already focus the user with their backdrop; a ring there would cover their popups. */}
			{!insideDialog && (
				<TourSpotlight
					rect={hasTarget ? targetRect : null}
					dim={!hasTarget || !!targetRect}
				/>
			)}
			<TourCard
				step={step}
				stepIndex={stepIndex}
				targetRect={hasTarget ? targetRect : null}
				isTargetLost={engine.isTargetLost}
				onNext={() => store.advance()}
				onBack={store.back}
				onMinimize={store.minimize}
				onDismiss={store.dismiss}
				onFinish={store.complete}
				onRestart={() => {
					if (!projectId) return;
					store.start(projectId);
					router.push(tourRoutePath(projectId));
				}}
			/>
		</>,
		container,
	);
}
