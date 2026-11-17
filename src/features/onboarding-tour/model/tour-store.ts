"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { findStepIndex, TOUR_STEPS } from "./tour-steps";
import { readTourSnapshot } from "./tour-snapshot";
import type { TourContext, TourStatus } from "./types";

export type TourState = {
	status: TourStatus;
	stepIndex: number;
	projectId: string | null;
	ctx: TourContext;
	start: (projectId: string) => void;
	goTo: (index: number) => void;
	goToId: (id: string) => void;
	advance: (patch?: Partial<TourContext>) => void;
	patchCtx: (patch: Partial<TourContext>) => void;
	back: () => void;
	minimize: () => void;
	resume: () => void;
	dismiss: () => void;
	complete: () => void;
};

const lastIndex = TOUR_STEPS.length - 1;

const clampIndex = (index: number) => Math.min(Math.max(index, 0), lastIndex);

export const useTourStore = create<TourState>()(
	persist(
		(set, get) => ({
			status: "idle",
			stepIndex: 0,
			projectId: null,
			ctx: {},
			start: (projectId) =>
				set({
					status: "running",
					stepIndex: 0,
					projectId,
					ctx: { baseline: readTourSnapshot() },
				}),
			goTo: (index) =>
				set((state) => ({
					stepIndex: clampIndex(index),
					ctx: { ...state.ctx, baseline: readTourSnapshot() },
				})),
			goToId: (id) => {
				const index = findStepIndex(id);
				if (index >= 0) get().goTo(index);
			},
			advance: (patch) => {
				const { stepIndex } = get();
				if (patch) set((state) => ({ ctx: { ...state.ctx, ...patch } }));
				if (stepIndex >= lastIndex) {
					get().complete();
					return;
				}
				get().goTo(stepIndex + 1);
			},
			patchCtx: (patch) =>
				set((state) => ({ ctx: { ...state.ctx, ...patch } })),
			back: () => get().goTo(get().stepIndex - 1),
			minimize: () => set({ status: "minimized" }),
			resume: () => set({ status: "running" }),
			dismiss: () => set({ status: "dismissed" }),
			complete: () => set({ status: "completed", stepIndex: 0, ctx: {} }),
		}),
		{
			name: "qolqa-tour",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				status: state.status,
				stepIndex: state.stepIndex,
				projectId: state.projectId,
				ctx: state.ctx,
			}),
		},
	),
);
