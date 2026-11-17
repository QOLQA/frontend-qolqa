"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useSolutionStore, solutionSelector } from "@fsd/entities/solution";
import type { VersionFrontend } from "@fsd/entities/solution";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { toast } from "sonner";
import { saveCanvas } from "../lib";
import { hasUnsavedCanvasChanges } from "../lib/canvas-changes";
import { useUnsavedCanvasWarning } from "./use-unsaved-canvas-warning";
import {
	createEmptyVersion,
	deleteVersion,
	generateNextMajorVersion,
	updateVersionDescription,
} from "../lib/versions";

const MAX_VERSION_DESCRIPTION_LENGTH = 500;

type VersionDestination = { versionId: string } | { create: true };

export interface UseVersionDropdownReturn {
	// Data
	versions: VersionFrontend[];
	selectedVersionId: string;
	selectedVersionDescription: string;

	// Dropdown state
	isOpen: boolean;
	toggle: () => void;
	close: () => void;
	dropdownRef: React.RefObject<HTMLDivElement | null>;

	// Actions
	onVersionChange: (versionId: string) => Promise<void>;
	onAddEmptyVersion: () => Promise<void>;
	unsavedChangesDialogOpen: boolean;
	isSavingBeforeChange: boolean;
	cancelVersionChange: () => void;
	saveAndContinue: () => Promise<void>;

	// Delete modal state
	deleteModalOpen: boolean;
	versionToDelete: VersionFrontend | null;
	openDeleteModal: (version: VersionFrontend) => void;
	closeDeleteModal: () => void;
	confirmDelete: () => Promise<void>;

	// Guards
	canDelete: boolean;

	// Inline rename
	editingVersionId: string | null;
	draftDescription: string;
	isRenamingVersion: boolean;
	startEditVersion: (version: VersionFrontend) => void;
	cancelEditVersion: () => void;
	commitEditVersion: () => Promise<void>;
	onDraftDescriptionChange: (value: string) => void;
}

export function useVersionDropdown(): UseVersionDropdownReturn {
	const { t } = useTranslation();
	useUnsavedCanvasWarning();
	const [pendingDestination, setPendingDestination] = useState<VersionDestination | null>(null);
	const [isSavingBeforeChange, setIsSavingBeforeChange] = useState(false);
	const savingBeforeChangeRef = useRef(false);
	const {
		versions,
		selectedVersionId,
		setSelectedVersionId,
		setNodes,
		setEdges,
	} = useSolutionStore(useShallow(solutionSelector));

	const solutionId = useSolutionStore((state) => state.id);
	const setIsChangingVersion = useSolutionStore(
		(state) => state.setIsChangingVersion
	);

	// Dropdown open/close state
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [versionToDelete, setVersionToDelete] =
		useState<VersionFrontend | null>(null);

	const [editingVersionId, setEditingVersionId] = useState<string | null>(
		null,
	);
	const [draftDescription, setDraftDescription] = useState("");
	const [isRenamingVersion, setIsRenamingVersion] = useState(false);

	const cancelEditVersion = useCallback(() => {
		setEditingVersionId(null);
		setDraftDescription("");
	}, []);

	const startEditVersion = useCallback((version: VersionFrontend) => {
		setEditingVersionId(version._id);
		setDraftDescription(version.description);
	}, []);

	const onDraftDescriptionChange = useCallback((value: string) => {
		setDraftDescription(value);
	}, []);

	const commitEditVersion = useCallback(async () => {
		if (!editingVersionId || isRenamingVersion) return;

		const trimmed = draftDescription.trim();
		if (!trimmed) {
			toast.error(t("toasts.versionNameEmpty"));
			return;
		}
		if (trimmed.length > MAX_VERSION_DESCRIPTION_LENGTH) {
			toast.error(t("toasts.versionNameTooLong"));
			return;
		}

		const current = useSolutionStore
			.getState()
			.versions.find((v) => v._id === editingVersionId);
		if (current?.description === trimmed) {
			cancelEditVersion();
			return;
		}

		setIsRenamingVersion(true);
		try {
			await updateVersionDescription(solutionId, editingVersionId, trimmed);
			toast.success(t("toasts.versionRenamed"));
			cancelEditVersion();
		} catch (error) {
			console.error("Error renaming version:", error);
			toast.error(t("toasts.errorRenamingVersion"));
		} finally {
			setIsRenamingVersion(false);
		}
	}, [
		editingVersionId,
		draftDescription,
		isRenamingVersion,
		solutionId,
		t,
		cancelEditVersion,
	]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				cancelEditVersion();
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [cancelEditVersion]);

	// Escape: cancel rename first, then close dropdown
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;

			if (editingVersionId) {
				event.preventDefault();
				cancelEditVersion();
				return;
			}

			setIsOpen(false);
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [editingVersionId, cancelEditVersion]);

	const toggle = useCallback(() => {
		setIsOpen((prev) => {
			if (prev) {
				cancelEditVersion();
			}
			return !prev;
		});
	}, [cancelEditVersion]);

	const close = useCallback(() => {
		cancelEditVersion();
		setIsOpen(false);
	}, [cancelEditVersion]);

	const selectedVersion = versions.find((v) => v._id === selectedVersionId);
	const selectedVersionDescription = selectedVersion?.description ?? "";

	const continueToVersion = async (destination: VersionDestination) => {
		const state = useSolutionStore.getState();
		if ("create" in destination) {
			const description = generateNextMajorVersion(state.versions);
			await createEmptyVersion(state.id, description);
			toast.success(t("toasts.versionCreated"));
			return;
		}
		const version = state.versions.find((item) => item._id === destination.versionId);
		if (!version) throw new Error("Version not found");
		setIsChangingVersion(true);
		setNodes(version.nodes);
		setEdges(version.edges);
		setSelectedVersionId(version._id);
		setTimeout(() => setIsChangingVersion(false), 100);
	};

	const requestVersionChange = async (destination: VersionDestination) => {
		if (savingBeforeChangeRef.current) return;
		cancelEditVersion();
		setIsOpen(false);
		const state = useSolutionStore.getState();
		if ("versionId" in destination && destination.versionId === state.selectedVersionId) return;
		if (hasUnsavedCanvasChanges(state)) {
			setPendingDestination(destination);
			return;
		}
		try {
			await continueToVersion(destination);
		} catch {
			toast.error(t("errors.somethingWentWrong"));
		}
	};

	const onVersionChange = (versionId: string) => requestVersionChange({ versionId });
	const onAddEmptyVersion = () => requestVersionChange({ create: true });

	const cancelVersionChange = () => {
		if (!savingBeforeChangeRef.current) setPendingDestination(null);
	};

	const saveAndContinue = async () => {
		if (!pendingDestination || savingBeforeChangeRef.current) return;
		savingBeforeChangeRef.current = true;
		setIsSavingBeforeChange(true);
		try {
			const state = useSolutionStore.getState();
			await saveCanvas(state.id, state.selectedVersionId, undefined, false);
			if (hasUnsavedCanvasChanges(useSolutionStore.getState())) return;
			await continueToVersion(pendingDestination);
			setPendingDestination(null);
		} catch {
			toast.error(t("toasts.errorSavingCanvas"));
		} finally {
			savingBeforeChangeRef.current = false;
			setIsSavingBeforeChange(false);
		}
	};

	const openDeleteModal = useCallback((version: VersionFrontend) => {
		cancelEditVersion();
		setVersionToDelete(version);
		setDeleteModalOpen(true);
		setIsOpen(false); // Close dropdown when opening modal
	}, [cancelEditVersion]);

	const closeDeleteModal = useCallback(() => {
		setDeleteModalOpen(false);
		setVersionToDelete(null);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!versionToDelete) return;

		try {
			await deleteVersion(versionToDelete._id);
			toast.success("Version deleted successfully.");
		} catch (error) {
			console.error("Error deleting version:", error);
			toast.error("Error deleting version.");
			throw error; // re-throw so modal stays open on error
		}

		setDeleteModalOpen(false);
		setVersionToDelete(null);
	}, [versionToDelete]);

	const canDelete = versions.length > 1;

	return {
		versions,
		selectedVersionId,
		selectedVersionDescription,
		isOpen,
		toggle,
		close,
		dropdownRef,
		onVersionChange,
		onAddEmptyVersion,
		unsavedChangesDialogOpen: pendingDestination !== null,
		isSavingBeforeChange,
		cancelVersionChange,
		saveAndContinue,
		deleteModalOpen,
		versionToDelete,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		canDelete,
		editingVersionId,
		draftDescription,
		isRenamingVersion,
		startEditVersion,
		cancelEditVersion,
		commitEditVersion,
		onDraftDescriptionChange,
	};
}
