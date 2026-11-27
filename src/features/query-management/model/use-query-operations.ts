"use client";

import { useCallback } from "react";
import { useSolutionStore } from "@fsd/entities/solution";
import { getQueriesBySolutionRequest } from "@fsd/entities/query/api";
import { useQueriesStore } from "@fsd/entities/query/model/state/queriesStore";
import type { Query } from "@fsd/entities/solution";
import {
	createQuery as createQueryAction,
	deleteQuery as deleteQueryAction,
	updateQuery as updateQueryAction,
} from "./actions";
import type { ActionFailure } from "./action-results";

/**
 * Server actions report expected failures as data; the hook keeps its
 * reject-on-failure contract so callers can roll back and toast.
 */
const actionFailureToError = (
	failure: ActionFailure,
	fallback: string,
): Error => new Error(failure.detail ?? fallback);

/**
 * Hook para manejar operaciones CRUD de queries con optimistic updates
 */
export const useQueryOperations = () => {
	const {
		addQuery: addQueryToStore,
		editQuery: editQueryInStore,
		removeQuery: removeQueryFromStore,
		setQueries,
	} = useQueriesStore();
	const solutionId = useSolutionStore((state) => state.id);

	const createQuery = useCallback(
		async (queryData: Omit<Query, "_id">, tempId: string) => {
			const optimisticQuery: Query = {
				_id: tempId,
				...queryData,
			};
			addQueryToStore(optimisticQuery);

			try {
				const createData: Omit<Query, "_id"> & { solution_id: string } = {
					...queryData,
					solution_id: solutionId,
				};

				const created = await createQueryAction(createData);
				if (!created.ok) {
					throw actionFailureToError(created, "Failed to create query");
				}

				editQueryInStore(tempId, created.data);

				return created.data;
			} catch (error) {
				removeQueryFromStore(tempId);
				console.error("Failed to create query:", error);
				throw error;
			}
		},
		[addQueryToStore, editQueryInStore, removeQueryFromStore, solutionId],
	);

	const updateQuery = useCallback(
		async (queryId: string, updates: Partial<Omit<Query, "_id">>) => {
			const { queries } = useQueriesStore.getState();
			const originalQuery = queries.find((q) => q._id === queryId);

			if (!originalQuery) {
				console.error("Query not found");
				return;
			}

			const updatedQuery: Query = {
				...originalQuery,
				...updates,
			};
			editQueryInStore(queryId, updatedQuery);

			try {
				const updated = await updateQueryAction(queryId, updates);
				if (!updated.ok) {
					throw actionFailureToError(updated, "Failed to update query");
				}

				editQueryInStore(queryId, updated.data);

				return updated.data;
			} catch (error) {
				editQueryInStore(queryId, originalQuery);
				console.error("Failed to update query:", error);
				throw error;
			}
		},
		[editQueryInStore],
	);

	const deleteQuery = useCallback(
		async (queryId: string) => {
			const { queries } = useQueriesStore.getState();
			const queryToDelete = queries.find((q) => q._id === queryId);

			if (!queryToDelete) {
				console.error("Query not found");
				return;
			}

			removeQueryFromStore(queryId);

			try {
				const deleted = await deleteQueryAction(queryId);
				if (!deleted.ok) {
					throw actionFailureToError(deleted, "Failed to delete query");
				}
			} catch (error) {
				addQueryToStore(queryToDelete);
				console.error("Failed to delete query:", error);
				throw error;
			}
		},
		[removeQueryFromStore, addQueryToStore],
	);

	const syncQueries = useCallback(async () => {
		try {
			const queries = await getQueriesBySolutionRequest(solutionId);
			setQueries(queries);
			return queries;
		} catch (error) {
			console.error("Failed to sync queries:", error);
			throw error;
		}
	}, [solutionId, setQueries]);

	return {
		createQuery,
		updateQuery,
		deleteQuery,
		syncQueries,
	};
};
