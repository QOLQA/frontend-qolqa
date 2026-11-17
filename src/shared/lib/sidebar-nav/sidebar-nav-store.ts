"use client";

import { create } from "zustand";

export type SidebarNavRequest = {
	title: string;
	nonce: number;
};

type SidebarNavState = {
	activeTitle: string | null;
	request: SidebarNavRequest | null;
	setActiveTitle: (title: string) => void;
	/** Ask the modeling sidebar to switch to (and open) the panel with this title. */
	requestPanel: (title: string) => void;
};

export const useSidebarNavStore = create<SidebarNavState>()((set) => ({
	activeTitle: null,
	request: null,
	setActiveTitle: (title) => set({ activeTitle: title }),
	requestPanel: (title) =>
		set((state) => ({
			request: { title, nonce: (state.request?.nonce ?? 0) + 1 },
		})),
}));
