"use server";

/**
 * Projects server actions (backend `solution`) — S3: user-triggered mutations
 * run on the server, like the login flow.
 *
 * Every call reaches the backend with the server-only BACKEND_URL plus the
 * httpOnly session token; the browser only receives a typed result. Expected
 * failures are returned, not thrown, and a successful mutation revalidates the
 * server-rendered projects list.
 */

import { revalidatePath } from "next/cache";
import { serverFetchWithAuth } from "@fsd/shared/api/server";
import {
	failureFromResponse,
	invalidResponseFailure,
	networkFailure,
	type ActionFailure,
	type ActionResult,
} from "./action-results";

/** Server component that re-reads the list after a mutation. */
const PROJECTS_PATH = "/projects";
const SOLUTIONS_ENDPOINT = "/solutions";
const JSON_HEADERS = { "Content-Type": "application/json" };
const BLANK_NAME_MESSAGE = "El nombre del proyecto no puede estar vacío";
const BLANK_ID_MESSAGE = "El identificador del proyecto es obligatorio";
const INVALID_INPUT_STATUS = 400;
const NOT_FOUND = 404;

interface CreatedSolution {
	_id: string;
}

interface RenamedSolution {
	_id: string;
	name: string;
}

const readJson = async <T>(response: Response): Promise<T | null> => {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
};

const readSolutionId = (body: unknown): string | null => {
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

const blankNameFailure = (): ActionFailure => ({
	ok: false,
	status: INVALID_INPUT_STATUS,
	detail: BLANK_NAME_MESSAGE,
});

const blankIdFailure = (): ActionFailure => ({
	ok: false,
	status: INVALID_INPUT_STATUS,
	detail: BLANK_ID_MESSAGE,
});

async function createSolutionOnBackend(
	name: string,
): Promise<ActionResult<CreatedSolution>> {
	const trimmed = name.trim();
	if (!trimmed) return blankNameFailure();

	const response = await sendToBackend(SOLUTIONS_ENDPOINT, {
		method: "POST",
		headers: JSON_HEADERS,
		body: JSON.stringify({ name: trimmed }),
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const createdId = readSolutionId(await readJson(response));
	if (!createdId) return invalidResponseFailure();

	revalidatePath(PROJECTS_PATH);
	return { ok: true, data: { _id: createdId } };
}

/** Creates a project; the page navigates to the returned id. */
export async function createSolution(
	name: string,
): Promise<ActionResult<CreatedSolution>> {
	return createSolutionOnBackend(name);
}

/** Creates the practice project; the tour only needs the new id. */
export async function createPracticeSolution(
	name: string,
): Promise<ActionResult<string>> {
	const result = await createSolutionOnBackend(name);
	return result.ok ? { ok: true, data: result.data._id } : result;
}

/**
 * Deletes a project. A 404 counts as success: the solution is already gone, so
 * the desired state holds (the previous client flow ignored it too).
 */
export async function deleteSolution(
	solutionId: string,
): Promise<ActionResult<null>> {
	const id = solutionId.trim();
	if (!id) return blankIdFailure();

	const response = await sendToBackend(
		`${SOLUTIONS_ENDPOINT}/${encodeURIComponent(id)}`,
		{ method: "DELETE" },
	);
	if (!response) return networkFailure();
	if (!response.ok && response.status !== NOT_FOUND) {
		return failureFromResponse(response.status, await readJson(response));
	}

	revalidatePath(PROJECTS_PATH);
	return { ok: true, data: null };
}

/** Renames a project. */
export async function updateSolution(
	solutionId: string,
	name: string,
): Promise<ActionResult<RenamedSolution>> {
	const id = solutionId.trim();
	if (!id) return blankIdFailure();

	const trimmed = name.trim();
	if (!trimmed) return blankNameFailure();

	const response = await sendToBackend(
		`${SOLUTIONS_ENDPOINT}/${encodeURIComponent(id)}`,
		{
			method: "PATCH",
			headers: JSON_HEADERS,
			body: JSON.stringify({ name: trimmed }),
		},
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	revalidatePath(PROJECTS_PATH);
	return { ok: true, data: { _id: id, name: trimmed } };
}
