export type TourStatus =
	| "idle"
	| "running"
	| "minimized"
	| "completed"
	| "dismissed";

export type TourRoute = "modeling" | "analysis";

export type TourPlacement = "top" | "bottom" | "left" | "right";

/** Live view of the stores the tour reacts to. */
export type TourSnapshot = {
	nodeIds: string[];
	edgeCount: number;
	queryCount: number;
	versionCount: number;
	selectedVersionId: string;
	selectedVersionName: string;
	columnsByNode: Record<string, number>;
	nestedByNode: Record<string, number>;
	labelsByNode: Record<string, string>;
	/** Live canvas equals the saved copy of the selected version. */
	isCanvasSaved: boolean;
};

export type TourContext = {
	firstNodeId?: string;
	secondNodeId?: string;
	firstNodeLabel?: string;
	secondNodeLabel?: string;
	/** Snapshot taken when the current step was entered. */
	baseline?: TourSnapshot;
};

/** `true` advances; an object advances and merges into the tour context. */
export type TourCheckResult = boolean | Partial<TourContext>;

export type TourNodeRef = "first" | "second";

export type TourStep = {
	/** Also the i18n key: `tour.steps.<id>.title` / `.body`. */
	id: string;
	/** 0 = welcome, 1..9 = learning goals, 10 = finish. */
	chapter: number;
	route?: TourRoute;
	/** `[data-tour="..."]` value, or a full selector builder for dynamic targets. */
	target?: string | ((ctx: TourContext) => string);
	/** Highlight every visible match of `target` together instead of only the first one. */
	highlightAll?: boolean;
	placement?: TourPlacement;
	/** Sidebar panel to open when the step starts. */
	panel?: "Database" | "Queries" | "Statistics";
	/** Advance when the user presses on an element matching this selector. */
	advanceOnClick?: string | ((ctx: TourContext) => string);
	/** Advance as soon as an element matching this selector is in the DOM. */
	advanceWhenVisible?: string;
	/** Advance when the store state satisfies this condition. */
	check?: (snapshot: TourSnapshot, ctx: TourContext) => TourCheckResult;
	/** Show a "Next" button (informational step). */
	manual?: boolean;
	/** Show a "Skip this step" button. */
	optional?: boolean;
	/** Jump back here when the target disappears (e.g. the user closed the modal). */
	resetTo?: string;
	/** Node that must still exist; otherwise the tour rewinds to the step that creates it. */
	requiresNode?: TourNodeRef;
	/** Extra hint line (`tour.steps.<id>.hint`). */
	hasHint?: boolean;
};
