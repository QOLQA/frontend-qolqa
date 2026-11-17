"use client";

import { useEffect } from "react";
import { useSolutionStore } from "@fsd/entities/solution";
import { hasUnsavedCanvasChanges } from "../lib/canvas-changes";

export function useUnsavedCanvasWarning() {
	const hasUnsavedChanges = useSolutionStore(hasUnsavedCanvasChanges);

	useEffect(() => {
		if (!hasUnsavedChanges) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!hasUnsavedCanvasChanges(useSolutionStore.getState())) return;
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);
}
