import { findNodeIdByLabel } from "./tour-snapshot";
import type { TourContext, TourSnapshot, TourStep } from "./types";

export const tourSelector = (anchor: string) => `[data-tour="${anchor}"]`;

const nodeSelector = (id: string | undefined) =>
	`.react-flow__node[data-id="${id ?? "__missing__"}"]`;

const firstNode = (ctx: TourContext) => nodeSelector(ctx.firstNodeId);
const secondNode = (ctx: TourContext) => nodeSelector(ctx.secondNodeId);
const firstNodeMenu = (ctx: TourContext) =>
	`${firstNode(ctx)} ${tourSelector("node-more-btn")}`;

const secondNodeMenu = (ctx: TourContext) =>
	`${secondNode(ctx)} ${tourSelector("node-more-btn")}`;

const isSecondNodeDeleted = (snapshot: TourSnapshot, ctx: TourContext) =>
	!findNodeIdByLabel(snapshot, ctx.secondNodeLabel) &&
	!snapshot.nodeIds.includes(ctx.secondNodeId ?? "");

const findNewNode = (snapshot: TourSnapshot, ctx: TourContext) => {
	const before = new Set(ctx.baseline?.nodeIds ?? []);
	return snapshot.nodeIds.find((id) => !before.has(id));
};

const grew = (now: number, before: number | undefined) => now > (before ?? 0);

export const TOUR_STEPS: TourStep[] = [
	{ id: "welcome", chapter: 0 },

	// 1 · First collection
	{
		id: "collectionOpen",
		chapter: 1,
		target: "new-collection-btn",
		placement: "left",
		panel: "Database",
		advanceOnClick: tourSelector("new-collection-btn"),
	},
	{
		id: "collectionFill",
		chapter: 1,
		target: "modal-add-collection",
		placement: "right",
		resetTo: "collectionOpen",
		hasHint: true,
		check: (snapshot, ctx) => {
			const id = findNewNode(snapshot, ctx);
			return id
				? { firstNodeId: id, firstNodeLabel: snapshot.labelsByNode[id] }
				: false;
		},
	},
	{
		id: "collectionCreated",
		chapter: 1,
		target: firstNode,
		placement: "right",
		requiresNode: "first",
		manual: true,
	},

	// 2 · Attributes
	{
		id: "attributesMenu",
		chapter: 2,
		target: firstNodeMenu,
		placement: "right",
		requiresNode: "first",
		advanceOnClick: firstNodeMenu,
	},
	{
		id: "attributesOption",
		chapter: 2,
		target: "menu-add-attributes",
		placement: "right",
		requiresNode: "first",
		resetTo: "attributesMenu",
		advanceOnClick: tourSelector("menu-add-attributes"),
	},
	{
		id: "attributesFill",
		chapter: 2,
		target: "modal-attributes",
		placement: "right",
		requiresNode: "first",
		resetTo: "attributesMenu",
		hasHint: true,
		check: (snapshot, ctx) => {
			const id = ctx.firstNodeId ?? "";
			return grew(
				snapshot.columnsByNode[id] ?? 0,
				ctx.baseline?.columnsByNode[id],
			);
		},
	},

	// 3 · Nested collection (embedded document)
	{
		id: "nestedMenu",
		chapter: 3,
		target: firstNodeMenu,
		placement: "right",
		requiresNode: "first",
		advanceOnClick: firstNodeMenu,
	},
	{
		id: "nestedOption",
		chapter: 3,
		target: "menu-add-documents",
		placement: "right",
		requiresNode: "first",
		resetTo: "nestedMenu",
		advanceOnClick: tourSelector("menu-add-documents"),
	},
	{
		id: "nestedFill",
		chapter: 3,
		target: "modal-document",
		placement: "right",
		requiresNode: "first",
		resetTo: "nestedMenu",
		hasHint: true,
		check: (snapshot, ctx) => {
			const id = ctx.firstNodeId ?? "";
			return grew(
				snapshot.nestedByNode[id] ?? 0,
				ctx.baseline?.nestedByNode[id],
			);
		},
	},
	{
		id: "nestedCardinality",
		chapter: 3,
		// Includes the options menu once opened, so the card is placed beside it.
		target: (ctx) =>
			`${firstNode(ctx)} ${tourSelector("nested-cardinality")}, ${tourSelector("nested-cardinality-menu")}`,
		highlightAll: true,
		placement: "right",
		requiresNode: "first",
		manual: true,
	},

	// 4 · Another collection
	{
		id: "secondOpen",
		chapter: 4,
		target: "new-collection-btn",
		placement: "left",
		panel: "Database",
		advanceOnClick: tourSelector("new-collection-btn"),
	},
	{
		id: "secondFill",
		chapter: 4,
		target: "modal-add-collection",
		placement: "right",
		resetTo: "secondOpen",
		hasHint: true,
		check: (snapshot, ctx) => {
			const id = findNewNode(snapshot, ctx);
			return id
				? { secondNodeId: id, secondNodeLabel: snapshot.labelsByNode[id] }
				: false;
		},
	},
	{
		id: "connect",
		chapter: 4,
		target: (ctx) => `${firstNode(ctx)}, ${secondNode(ctx)}`,
		highlightAll: true,
		placement: "bottom",
		requiresNode: "second",
		optional: true,
		check: (snapshot, ctx) =>
			grew(snapshot.edgeCount, ctx.baseline?.edgeCount),
	},

	// 5 · Query
	{
		id: "queriesOpen",
		chapter: 5,
		target: "sidebar-queries",
		placement: "right",
		advanceOnClick: tourSelector("sidebar-queries"),
	},
	{
		id: "queryAdd",
		chapter: 5,
		target: "add-query-btn",
		placement: "right",
		panel: "Queries",
		advanceOnClick: tourSelector("add-query-btn"),
	},
	{
		id: "queryText",
		chapter: 5,
		target: "modal-new-query",
		placement: "right",
		resetTo: "queryAdd",
		hasHint: true,
		advanceWhenVisible: tourSelector("modal-select-docs"),
	},
	{
		id: "queryDocs",
		chapter: 5,
		target: "modal-select-docs",
		placement: "right",
		resetTo: "queryAdd",
		check: (snapshot, ctx) =>
			grew(snapshot.queryCount, ctx.baseline?.queryCount),
	},

	// 6 · Metrics
	{
		id: "metricsOpen",
		chapter: 6,
		target: "sidebar-statistics",
		placement: "right",
		advanceOnClick: tourSelector("sidebar-statistics"),
	},
	{
		id: "metricsQueries",
		chapter: 6,
		target: "metrics-queries",
		placement: "right",
		panel: "Statistics",
		manual: true,
	},
	{
		id: "metricsScores",
		chapter: 6,
		// The wrapper stretches to the panel height; highlight only its charts.
		target: `${tourSelector("metrics-scores")} > *`,
		highlightAll: true,
		placement: "right",
		panel: "Statistics",
		manual: true,
	},

	// 7 · Version
	{
		id: "versionDuplicate",
		chapter: 7,
		target: "version-duplicate",
		placement: "bottom",
		check: (snapshot, ctx) =>
			grew(snapshot.versionCount, ctx.baseline?.versionCount) ||
			(Boolean(ctx.baseline?.selectedVersionId) &&
				snapshot.selectedVersionId !== ctx.baseline?.selectedVersionId),
	},
	{
		id: "versionRenameOpen",
		chapter: 7,
		target: "version-dropdown",
		placement: "right",
		advanceOnClick: tourSelector("version-dropdown"),
	},
	{
		id: "versionRenameEdit",
		chapter: 7,
		target: "version-rename-btn",
		placement: "right",
		resetTo: "versionRenameOpen",
		advanceOnClick: tourSelector("version-rename-btn"),
	},
	{
		id: "versionRenameFill",
		chapter: 7,
		target: "version-rename-input",
		placement: "right",
		resetTo: "versionRenameOpen",
		hasHint: true,
		check: (snapshot, ctx) =>
			snapshot.selectedVersionName !== ctx.baseline?.selectedVersionName,
	},

	// 8 · Experiment in the copy: embed the second collection inside the first
	{
		id: "embedMenu",
		chapter: 8,
		target: firstNodeMenu,
		placement: "right",
		panel: "Database",
		requiresNode: "first",
		advanceOnClick: firstNodeMenu,
	},
	{
		id: "embedOption",
		chapter: 8,
		target: "menu-add-documents",
		placement: "right",
		requiresNode: "first",
		resetTo: "embedMenu",
		advanceOnClick: tourSelector("menu-add-documents"),
	},
	{
		id: "embedFill",
		chapter: 8,
		target: "modal-document",
		placement: "right",
		requiresNode: "first",
		resetTo: "embedMenu",
		hasHint: true,
		check: (snapshot, ctx) => {
			const id = ctx.firstNodeId ?? "";
			return grew(
				snapshot.nestedByNode[id] ?? 0,
				ctx.baseline?.nestedByNode[id],
			);
		},
	},
	{
		id: "embedDeleteMenu",
		chapter: 8,
		target: secondNodeMenu,
		placement: "left",
		advanceOnClick: secondNodeMenu,
		check: isSecondNodeDeleted,
	},
	{
		id: "embedDeleteOption",
		chapter: 8,
		target: "menu-delete",
		placement: "right",
		resetTo: "embedDeleteMenu",
		check: isSecondNodeDeleted,
	},
	{
		id: "embedSave",
		chapter: 8,
		target: "save-btn",
		placement: "bottom",
		check: (snapshot) => snapshot.isCanvasSaved,
	},

	// 9 · Comparison
	{
		id: "compareOpen",
		chapter: 9,
		target: "sidebar-title-action",
		placement: "bottom",
		panel: "Statistics",
		advanceOnClick: tourSelector("sidebar-title-action"),
	},
	{
		id: "analysisCharts",
		chapter: 9,
		route: "analysis",
		target: "analysis-charts",
		placement: "bottom",
		manual: true,
	},
	{
		id: "analysisTable",
		chapter: 9,
		route: "analysis",
		target: "analysis-table",
		placement: "top",
		manual: true,
		advanceOnClick: tourSelector("analysis-row-select"),
	},

	{ id: "finish", chapter: 10, route: "analysis" },
];

export const TOUR_CHAPTERS = [
	"collection",
	"attributes",
	"nested",
	"another",
	"query",
	"metrics",
	"version",
	"experiment",
	"compare",
] as const;

export const resolveSelector = (
	value: string | ((ctx: TourContext) => string) | undefined,
	ctx: TourContext,
): string | null => {
	if (!value) return null;
	if (typeof value === "function") return value(ctx);
	return value.startsWith("[") || value.startsWith(".")
		? value
		: tourSelector(value);
};

export const findStepIndex = (id: string) =>
	TOUR_STEPS.findIndex((step) => step.id === id);

/** Step that (re)creates the node a step depends on. */
export const nodeCreationStep = (ref: "first" | "second") =>
	ref === "first" ? "collectionOpen" : "secondOpen";
