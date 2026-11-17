"use client";

import { useEffect, useRef, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	GraduationCap,
	Lightbulb,
	Minus,
	MousePointerClick,
	PartyPopper,
	Search,
	X,
} from "lucide-react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { cn } from "@fsd/shared/lib/classnames";
import { Button } from "@fsd/shared/ui/button";
import {
	computeCardPosition,
	type CardPosition,
	type Rect,
	type Size,
} from "../lib/placement";
import { TOUR_CHAPTERS } from "../model/tour-steps";
import type { TourStep } from "../model/types";
import { VersionVerdict } from "./VersionVerdict";

const CHAPTER_COUNT = TOUR_CHAPTERS.length;
const ARROW_HALF = 6;

const iconButtonClass =
	"size-8 cursor-pointer rounded-lg text-icon-muted hover:text-icon-intense hover:bg-primary-gray dark:hover:bg-gray";

type TourCardProps = {
	step: TourStep;
	stepIndex: number;
	targetRect: Rect | null;
	isTargetLost: boolean;
	onNext: () => void;
	onBack: () => void;
	onMinimize: () => void;
	onDismiss: () => void;
	onFinish: () => void;
	onRestart: () => void;
};

const useViewport = (): Size => {
	const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
	useEffect(() => {
		const update = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);
	return viewport;
};

/** Small rotated square that points from the card to its target. */
function CardArrow({ position }: { position: CardPosition }) {
	if (position.placement === "center") return null;
	const offset = position.arrowOffset - ARROW_HALF;
	const sideClass = {
		right: "-left-[7px] border-l border-b",
		left: "-right-[7px] border-r border-t",
		bottom: "-top-[7px] border-l border-t",
		top: "-bottom-[7px] border-r border-b",
	}[position.placement];
	const isHorizontal =
		position.placement === "left" || position.placement === "right";

	return (
		<span
			aria-hidden
			className={cn(
				"absolute size-3 rotate-45 bg-terciary-gray dark:bg-cuartenary-gray border-gray dark:border-transparent",
				sideClass,
			)}
			style={isHorizontal ? { top: offset } : { left: offset }}
		/>
	);
}

function ChapterProgress({ chapter }: { chapter: number }) {
	return (
		<div className="flex gap-1" aria-hidden>
			{TOUR_CHAPTERS.map((key, index) => {
				const number = index + 1;
				return (
					<span
						key={key}
						className={cn(
							"h-1 flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-500",
							number < chapter && "bg-blue",
							number === chapter && "bg-blue/50",
							number > chapter && "bg-gray",
						)}
					/>
				);
			})}
		</div>
	);
}

function ChapterList() {
	const { t } = useTranslation();
	return (
		<ol className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
			{TOUR_CHAPTERS.map((key, index) => (
				<li
					key={key}
					className="flex items-center gap-2 rounded-lg border border-gray bg-secondary-gray px-2.5 py-1.5 text-h7 text-secondary-white dark:border-transparent dark:bg-terciary-gray"
				>
					<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-icon-active-bg text-[0.625rem] font-semibold text-blue">
						{index + 1}
					</span>
					<span className="truncate">{t(`tour.chapters.${key}`)}</span>
				</li>
			))}
		</ol>
	);
}

export function TourCard({
	step,
	stepIndex,
	targetRect,
	isTargetLost,
	onNext,
	onBack,
	onMinimize,
	onDismiss,
	onFinish,
	onRestart,
}: TourCardProps) {
	const { t } = useTranslation();
	const cardRef = useRef<HTMLDivElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);
	const [cardSize, setCardSize] = useState<Size>({ width: 380, height: 240 });
	const viewport = useViewport();

	useEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) return;
			const box = entry.target.getBoundingClientRect();
			setCardSize({ width: box.width, height: box.height });
		});
		observer.observe(card);
		return () => observer.disconnect();
	}, []);

	// Move keyboard focus to the primary action on informational steps.
	useEffect(() => {
		if (step.manual || !step.target) nextRef.current?.focus();
	}, [step]);

	const isWelcome = step.id === "welcome";
	const isFinish = step.id === "finish";
	const isIntro = isWelcome || isFinish;
	const isAction = !step.manual && !isIntro;
	const chapter = Math.min(Math.max(step.chapter, 1), CHAPTER_COUNT);
	const chapterKey = TOUR_CHAPTERS[chapter - 1];
	const key = (field: string) => `tour.steps.${step.id}.${field}`;

	const position = computeCardPosition(
		targetRect,
		cardSize,
		viewport,
		step.placement,
	);

	return (
		<div
			ref={cardRef}
			role="dialog"
			aria-modal="false"
			aria-labelledby="tour-card-title"
			aria-describedby="tour-card-body"
			className={cn(
				"fixed z-[9999] max-w-[calc(100vw-24px)] pointer-events-auto font-OpenSans",
				isIntro ? "w-[440px]" : "w-[380px]",
				"rounded-2xl border border-gray bg-terciary-gray text-white shadow-lg",
				"dark:border-transparent dark:bg-cuartenary-gray dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]",
				"motion-safe:transition-[top,left] motion-safe:duration-300 ease-out",
			)}
			style={{ top: position.top, left: position.left }}
			onClick={(event) => event.stopPropagation()}
		>
			<CardArrow position={position} />

			<div
				key={step.id}
				className="max-h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar p-5 motion-safe:animate-tour-pop"
			>
				{/* Header */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<span
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-xl",
								isFinish
									? "bg-green text-[#ffffff]"
									: "bg-icon-active-bg text-blue",
							)}
						>
							{isFinish ? (
								<PartyPopper className="size-5" />
							) : (
								<GraduationCap className="size-5" />
							)}
						</span>
						<div className="flex flex-col">
							<span className="text-h7 uppercase tracking-wider text-lighter-gray">
								{isIntro
									? t("tour.ui.launcher")
									: t("tour.ui.stepOf")
											.replace("{current}", String(chapter))
											.replace("{total}", String(CHAPTER_COUNT))}
							</span>
							{!isIntro && (
								<span className="text-h6 font-medium text-white">
									{t(`tour.chapters.${chapterKey}`)}
								</span>
							)}
						</div>
					</div>
					{!isIntro && (
						<div className="-mr-1 -mt-1 flex items-center">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={onMinimize}
								aria-label={t("tour.ui.minimize")}
								title={t("tour.ui.minimize")}
								className={iconButtonClass}
							>
								<Minus className="size-4" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={onDismiss}
								aria-label={t("tour.ui.close")}
								title={t("tour.ui.close")}
								className={iconButtonClass}
							>
								<X className="size-4" />
							</Button>
						</div>
					)}
				</div>

				{!isIntro && (
					<div className="mt-4">
						<ChapterProgress chapter={chapter} />
					</div>
				)}

				{/* Body */}
				<div className="mt-4" aria-live="polite">
					<h2 id="tour-card-title" className="text-h4 font-semibold text-white">
						{t(key("title"))}
					</h2>
					<p
						id="tour-card-body"
						className="mt-2 text-p text-secondary-white whitespace-pre-line"
					>
						{t(key("body"))}
					</p>

					{isWelcome && <ChapterList />}
					{isFinish && <VersionVerdict />}

					{step.hasHint && (
						<div className="mt-4 flex gap-2.5 rounded-xl border border-gray bg-secondary-gray px-3 py-2.5 dark:border-transparent dark:bg-terciary-gray">
							<Lightbulb className="mt-0.5 size-4 shrink-0 text-blue" />
							<p className="text-h7 text-secondary-white">{t(key("hint"))}</p>
						</div>
					)}

					{isAction && !isTargetLost && (
						<span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue/10 px-3 py-1 text-h7 font-medium text-blue dark:bg-blue/20 dark:text-white">
							<MousePointerClick className="size-3.5 shrink-0" />
							{t("tour.ui.doIt")}
						</span>
					)}
					{isTargetLost && (
						<span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-gray px-3 py-1 text-h7 text-secondary-white dark:bg-gray">
							<Search className="size-3.5 shrink-0" />
							{t("tour.ui.lost")}
						</span>
					)}
				</div>

				<div className="mt-5 h-[2px] w-full bg-gray" />

				{/* Footer */}
				<div className="mt-4 flex items-center justify-between gap-2">
					{isWelcome && (
						<>
							<Button
								type="button"
								variant="ghost"
								onClick={onDismiss}
								className="cursor-pointer text-secondary-white hover:bg-primary-gray dark:hover:bg-gray"
							>
								{t("tour.ui.notNow")}
							</Button>
							<Button
								ref={nextRef}
								type="button"
								variant="success"
								onClick={onNext}
								className="cursor-pointer"
							>
								{t("tour.ui.start")}
								<ArrowRight className="size-4" />
							</Button>
						</>
					)}

					{isFinish && (
						<>
							<Button
								type="button"
								variant="ghost"
								onClick={onRestart}
								className="cursor-pointer text-secondary-white hover:bg-primary-gray dark:hover:bg-gray"
							>
								{t("tour.ui.restart")}
							</Button>
							<Button
								ref={nextRef}
								type="button"
								variant="success"
								onClick={onFinish}
								className="cursor-pointer"
							>
								{t("tour.ui.finish")}
							</Button>
						</>
					)}

					{!isIntro && (
						<>
							<Button
								type="button"
								variant="ghost"
								onClick={onBack}
								disabled={stepIndex <= 1}
								className="cursor-pointer text-secondary-white hover:bg-primary-gray dark:hover:bg-gray"
							>
								<ArrowLeft className="size-4" />
								{t("tour.ui.back")}
							</Button>
							{step.manual && (
								<Button
									ref={nextRef}
									type="button"
									variant="success"
									onClick={onNext}
									className="cursor-pointer"
								>
									{t("tour.ui.next")}
									<ArrowRight className="size-4" />
								</Button>
							)}
							{!step.manual && step.optional && (
								<Button
									ref={nextRef}
									type="button"
									variant="outline"
									onClick={onNext}
									className="cursor-pointer border-gray bg-primary-gray text-white hover:bg-cuartenary-gray hover:text-white dark:border-none dark:bg-gray dark:hover:bg-semilighter-gray"
								>
									{t("tour.ui.skipStep")}
									<ArrowRight className="size-4" />
								</Button>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
