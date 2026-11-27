"use server";

/**
 * Version server actions (backend `solutions` / `versions`) — S3: user-triggered
 * mutations run on the server, like the login flow.
 *
 * The editor stays client-driven (Zustand stores own the canvas, optimistic
 * updates and autosave), so these actions are transport only: they reach the
 * backend with the server-only BACKEND_URL plus the httpOnly session token and
 * return the data the stores transform. Expected failures are returned, not
 * thrown. No `revalidatePath` here: the editor page hydrates from server data on
 * `router.refresh`, and the client stores are the source of truth for the canvas.
 */

import { serverFetchWithAuth } from "@fsd/shared/api/server";
import type { Query, Submodel, VersionBackend } from "@fsd/entities/solution";
import {
	failureFromResponse,
	invalidResponseFailure,
	networkFailure,
	type ActionResult,
} from "@fsd/shared/api/action-results";

const SOLUTIONS_ENDPOINT = "/solutions";
const VERSIONS_ENDPOINT = "/versions";
const JSON_HEADERS = { "Content-Type": "application/json" };
const MISSING_SOLUTION_ID = "El identificador del proyecto es obligatorio";
const MISSING_VERSION_ID = "El identificador de la versión es obligatorio";
const MISSING_IMAGE = "La imagen del diagrama es obligatoria";
const MISSING_DESCRIPTION = "La descripción de la versión no puede estar vacía";
const INVALID_INPUT_STATUS = 400;

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

const readVersionId = (body: unknown): string | null => {
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

const versionUrl = (solutionId: string, versionId: string) =>
	`${SOLUTIONS_ENDPOINT}/${encodeURIComponent(solutionId)}/versions/${encodeURIComponent(versionId)}`;

/** Saves the whole diagram (nodes + edges grouped in submodels) of a version. */
export async function saveVersionDiagram(
	solutionId: string,
	versionId: string,
	diagram: VersionBackend,
): Promise<ActionResult<null>> {
	const solution = solutionId.trim();
	if (!solution) return invalidInputFailure(MISSING_SOLUTION_ID);

	const version = versionId.trim();
	if (!version) return invalidInputFailure(MISSING_VERSION_ID);

	const response = await sendToBackend(versionUrl(solution, version), {
		method: "PATCH",
		headers: JSON_HEADERS,
		body: JSON.stringify(diagram),
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	return { ok: true, data: null };
}

/** Saves the solution queries together with the uploaded diagram image. */
export async function saveSolutionQueriesAndImage(
	solutionId: string,
	queries: Query[],
	srcImg: string,
): Promise<ActionResult<null>> {
	const solution = solutionId.trim();
	if (!solution) return invalidInputFailure(MISSING_SOLUTION_ID);

	const image = srcImg.trim();
	if (!image) return invalidInputFailure(MISSING_IMAGE);

	const response = await sendToBackend(
		`${SOLUTIONS_ENDPOINT}/${encodeURIComponent(solution)}`,
		{
			method: "PATCH",
			headers: JSON_HEADERS,
			body: JSON.stringify({ queries, src_img: image }),
		},
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	return { ok: true, data: null };
}

const createVersionOnBackend = async (
	solutionId: string,
	description: string,
	submodels: Submodel[],
): Promise<ActionResult<VersionBackend>> => {
	const solution = solutionId.trim();
	if (!solution) return invalidInputFailure(MISSING_SOLUTION_ID);

	const trimmed = description.trim();
	if (!trimmed) return invalidInputFailure(MISSING_DESCRIPTION);

	const payload: VersionBackend = {
		submodels,
		description: trimmed,
		solution_id: solution,
		_id: "",
	};

	const response = await sendToBackend(
		`${SOLUTIONS_ENDPOINT}/${encodeURIComponent(solution)}/versions`,
		{ method: "POST", headers: JSON_HEADERS, body: JSON.stringify(payload) },
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const created = await readJson<VersionBackend>(response);
	if (!created || !readVersionId(created)) return invalidResponseFailure();

	return { ok: true, data: created };
};

/** Creates an empty version (no submodels) for the solution. */
export async function createEmptyVersion(
	solutionId: string,
	description: string,
): Promise<ActionResult<VersionBackend>> {
	return createVersionOnBackend(solutionId, description, []);
}

/** Creates a copy of the current version by replaying its submodels. */
export async function duplicateVersion(
	solutionId: string,
	description: string,
	submodels: Submodel[],
): Promise<ActionResult<VersionBackend>> {
	return createVersionOnBackend(solutionId, description, submodels);
}

/** Deletes a version by id. */
export async function deleteVersion(
	versionId: string,
): Promise<ActionResult<null>> {
	const version = versionId.trim();
	if (!version) return invalidInputFailure(MISSING_VERSION_ID);

	const response = await sendToBackend(
		`${VERSIONS_ENDPOINT}/${encodeURIComponent(version)}`,
		{ method: "DELETE" },
	);
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	return { ok: true, data: null };
}

/** Renames a version; the backend returns the stored version. */
export async function renameVersion(
	solutionId: string,
	versionId: string,
	description: string,
): Promise<ActionResult<VersionBackend>> {
	const solution = solutionId.trim();
	if (!solution) return invalidInputFailure(MISSING_SOLUTION_ID);

	const version = versionId.trim();
	if (!version) return invalidInputFailure(MISSING_VERSION_ID);

	const trimmed = description.trim();
	if (!trimmed) return invalidInputFailure(MISSING_DESCRIPTION);

	const response = await sendToBackend(versionUrl(solution, version), {
		method: "PATCH",
		headers: JSON_HEADERS,
		body: JSON.stringify({ description: trimmed }),
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const updated = await readJson<VersionBackend>(response);
	if (!updated || !readVersionId(updated)) return invalidResponseFailure();

	return { ok: true, data: updated };
}
