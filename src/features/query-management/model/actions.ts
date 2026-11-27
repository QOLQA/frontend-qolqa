"use server";

/**
 * Query server actions (backend `queries`) — S3: user-triggered mutations run on
 * the server, like the login flow.
 *
 * The queries panel keeps its optimistic store flow (insert → action → commit or
 * rollback), so these actions are transport only: they reach the backend with the
 * server-only BACKEND_URL plus the httpOnly session token and return the stored
 * record. Expected failures are returned, not thrown; reads stay client-side
 * through the `/api` proxy (`getQueriesBySolutionRequest`).
 */

import { serverFetchWithAuth } from "@fsd/shared/api/server";
import type { Query } from "@fsd/entities/solution";
import {
	failureFromResponse,
	invalidResponseFailure,
	networkFailure,
	type ActionResult,
} from "@fsd/shared/api/action-results";

const QUERIES_ENDPOINT = "/queries";
const JSON_HEADERS = { "Content-Type": "application/json" };
const MISSING_QUERY_ID = "El identificador de la query es obligatorio";
const MISSING_SOLUTION_ID = "El identificador del proyecto es obligatorio";
const INVALID_INPUT_STATUS = 400;

export type CreateQueryPayload = Omit<Query, "_id"> & { solution_id: string };
export type UpdateQueryPayload = Partial<Omit<Query, "_id">>;

const readJson = async <T>(response: Response): Promise<T | null> => {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
};

const invalidInputFailure = (detail: string): ActionResult<never> => ({
	ok: false,
	status: INVALID_INPUT_STATUS,
	detail,
});

const readQueryId = (body: unknown): string | null => {
	if (typeof body !== "object" || body === null) return null;
	const id = (body as { _id?: unknown })._id;
	return typeof id === "string" && id.length > 0 ? id : null;
};

/** `serverFetchWithAuth` throws when the backend is unreachable; report it as data. */
const sendToBackend = async (
	endpoint: string,
	init: RequestInit,
): Promise<Response | null> => {
	try {
		return await serverFetchWithAuth(endpoint, init);
	} catch {
		return null;
	}
};

/** Creates a query inside a solution and returns the stored record. */
export async function createQuery(
	payload: CreateQueryPayload,
): Promise<ActionResult<Query>> {
	const solutionId = payload.solution_id.trim();
	if (!solutionId) return invalidInputFailure(MISSING_SOLUTION_ID);

	const response = await sendToBackend(QUERIES_ENDPOINT, {
		method: "POST",
		headers: JSON_HEADERS,
		body: JSON.stringify({ ...payload, solution_id: solutionId }),
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const created = await readJson<Query>(response);
	if (!created || !readQueryId(created)) return invalidResponseFailure();

	return { ok: true, data: created };
}

/** Patches a query and returns the stored record. */
export async function updateQuery(
	queryId: string,
	payload: UpdateQueryPayload,
): Promise<ActionResult<Query>> {
	const id = queryId.trim();
	if (!id) return invalidInputFailure(MISSING_QUERY_ID);

	const response = await sendToBackend(
		`${QUERIES_ENDPOINT}/${encodeURIComponent(id)}`,
		{ method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(payload) },
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const updated = await readJson<Query>(response);
	if (!updated || !readQueryId(updated)) return invalidResponseFailure();

	return { ok: true, data: updated };
}

/** Deletes a query by id. */
export async function deleteQuery(
	queryId: string,
): Promise<ActionResult<null>> {
	const id = queryId.trim();
	if (!id) return invalidInputFailure(MISSING_QUERY_ID);

	const response = await sendToBackend(
		`${QUERIES_ENDPOINT}/${encodeURIComponent(id)}`,
		{ method: "DELETE" },
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	return { ok: true, data: null };
}
