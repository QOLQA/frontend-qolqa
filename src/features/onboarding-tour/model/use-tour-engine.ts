"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useSidebarNavStore } from "@fsd/shared/lib/sidebar-nav";
import { unionRect, type Rect } from "../lib/placement";
import { nodeCreationStep, resolveSelector, TOUR_STEPS } from "./tour-steps";
import { readTourSnapshot, relinkNodesByLabel } from "./tour-snapshot";
import { useTourStore } from "./tour-store";
import type { TourRoute, TourStep } from "./types";

const LOGIC_INTERVAL_MS = 200;
const RESET_GRACE_MS = 1200;
const PANEL_RETRY_MS = 600;
const LOST_NOTICE_MS = 2500;

export const tourRoutePath = (projectId: string, route: TourRoute = "modeling") =>
	`/projects/${projectId}/${route}`;

const sameRect = (a: Rect | null, b: Rect | null) =>
	a === b ||
	(!!a &&
		!!b &&
		Math.round(a.top) === Math.round(b.top) &&
		Math.round(a.left) === Math.round(b.left) &&
		Math.round(a.width) === Math.round(b.width) &&
		Math.round(a.height) === Math.round(b.height));

const isVisible = (element: Element) => {
	const rect = element.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
};

/** Prefer matches inside the top-most open dialog, then any visible match. */
const findTarget = (selector: string): Element | null => {
	const dialogs = document.querySelectorAll("dialog[open]");
	const topDialog = dialogs[dialogs.length - 1];
	if (topDialog) {
		const inDialog = topDialog.querySelector(selector);
		if (inDialog && isVisible(inDialog)) return inDialog;
	}
	return (
		Array.from(document.querySelectorAll(selector)).find(isVisible) ?? null
	);
};

const toRect = (element: Element): Rect => {
	const { top, left, width, height } = element.getBoundingClientRect();
	return { top, left, width, height };
};

const findTargetRect = (selector: string, highlightAll: boolean): Rect | null => {
	if (!highlightAll) {
		const element = findTarget(selector);
		return element ? toRect(element) : null;
	}
	const elements = Array.from(document.querySelectorAll(selector)).filter(isVisible);
	return unionRect(elements.map(toRect));
};

export type TourEngineState = {
	step: TourStep;
	stepIndex: number;
	isActive: boolean;
	/** The tour is running but the user is on another page. */
	isOffRoute: boolean;
	targetRect: Rect | null;
	/** Element the overlay must be portaled into (top-most open dialog or body). */
	container: Element | null;
	isTargetLost: boolean;
};

export function useTourEngine(): TourEngineState {
	const pathname = usePathname();
	const { status, stepIndex, projectId, ctx } = useTourStore(
		useShallow((state) => ({
			status: state.status,
			stepIndex: state.stepIndex,
			projectId: state.projectId,
			ctx: state.ctx,
		})),
	);
	const step = TOUR_STEPS[stepIndex] ?? (TOUR_STEPS[0] as TourStep);
	const isOnTourProject =
		!!projectId && pathname === tourRoutePath(projectId, step.route);
	const isActive = status === "running" && isOnTourProject;
	const isOffRoute =
		(status === "running" || status === "minimized") && !isOnTourProject;

	const [targetRect, setTargetRect] = useState<Rect | null>(null);
	const [container, setContainer] = useState<Element | null>(null);
	const [isTargetLost, setIsTargetLost] = useState(false);

	const targetSelector = resolveSelector(step.target, ctx);
	const clickSelector = resolveSelector(step.advanceOnClick, ctx);
	const highlightAll = !!step.highlightAll;

	// Open the sidebar panel a step needs.
	useEffect(() => {
		if (isActive && step.panel) {
			useSidebarNavStore.getState().requestPanel(step.panel);
		}
	}, [isActive, step]);

	// Advance on press of the highlighted element.
	useEffect(() => {
		if (!isActive || !clickSelector) return;
		let handled = false;
		const onPress = (event: Event) => {
			if (handled) return;
			const target = event.target;
			if (target instanceof Element && target.closest(clickSelector)) {
				handled = true;
				useTourStore.getState().advance();
			}
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") onPress(event);
		};
		document.addEventListener("pointerdown", onPress, true);
		document.addEventListener("keydown", onKey, true);
		return () => {
			document.removeEventListener("pointerdown", onPress, true);
			document.removeEventListener("keydown", onKey, true);
		};
	}, [isActive, clickSelector, stepIndex]);

	// Track the target position and evaluate the step's completion rules.
	const lastLogicAt = useRef(0);
	const missingSince = useRef<number | null>(null);
	const panelRetried = useRef(false);

	useEffect(() => {
		missingSince.current = null;
		panelRetried.current = false;
		setIsTargetLost(false);
		if (!isActive) {
			setTargetRect(null);
			setContainer(null);
			return;
		}

		let frame = 0;
		let rect: Rect | null = null;
		let host: Element | null = null;

		const runLogic = (now: number, found: boolean) => {
			const store = useTourStore.getState();
			const current = TOUR_STEPS[store.stepIndex];
			if (!current || store.status !== "running") return;

			const relinked = relinkNodesByLabel(readTourSnapshot(), store.ctx);
			if (relinked) {
				store.patchCtx(relinked);
				return;
			}

			if (current.requiresNode) {
				const nodeId =
					current.requiresNode === "first"
						? store.ctx.firstNodeId
						: store.ctx.secondNodeId;
				const snapshot = readTourSnapshot();
				if (!nodeId || !snapshot.nodeIds.includes(nodeId)) {
					store.goToId(nodeCreationStep(current.requiresNode));
					return;
				}
			}

			if (current.check) {
				const result = current.check(readTourSnapshot(), store.ctx);
				if (result) {
					store.advance(typeof result === "object" ? result : undefined);
					return;
				}
			}

			if (
				current.advanceWhenVisible &&
				findTarget(current.advanceWhenVisible)
			) {
				store.advance();
				return;
			}

			if (found || !targetSelector) {
				missingSince.current = null;
				setIsTargetLost(false);
				return;
			}

			missingSince.current ??= now;
			const missingFor = now - missingSince.current;

			if (current.panel && !panelRetried.current && missingFor > PANEL_RETRY_MS) {
				panelRetried.current = true;
				useSidebarNavStore.getState().requestPanel(current.panel);
			}
			if (current.resetTo && missingFor > RESET_GRACE_MS) {
				store.goToId(current.resetTo);
				return;
			}
			setIsTargetLost(missingFor > LOST_NOTICE_MS);
		};

		const tick = (now: number) => {
			const nextRect = targetSelector
				? findTargetRect(targetSelector, highlightAll)
				: null;
			if (!sameRect(rect, nextRect)) {
				rect = nextRect;
				setTargetRect(nextRect);
			}

			const dialogs = document.querySelectorAll("dialog[open]");
			const nextHost = dialogs[dialogs.length - 1] ?? document.body;
			if (nextHost !== host) {
				host = nextHost;
				setContainer(nextHost);
			}

			if (now - lastLogicAt.current >= LOGIC_INTERVAL_MS) {
				lastLogicAt.current = now;
				runLogic(now, !!nextRect);
			}
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [isActive, stepIndex, targetSelector, highlightAll]);

	return {
		step,
		stepIndex,
		isActive,
		isOffRoute,
		targetRect,
		container,
		isTargetLost,
	};
}
