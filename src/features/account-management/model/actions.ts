"use server";

/**
 * Account-management server actions — S3: profile mutations run on the server
 * with the httpOnly session, never from the browser.
 *
 * Inputs are validated with the same Zod schema the profile form uses, and
 * expected failures come back as typed results instead of thrown errors.
 */

import { serverFetchWithAuth } from "@fsd/shared/api/server";
import type { User, UserResponse, UserUpdateRequest } from "@fsd/entities/user";
import { mapUserResponseToUser } from "@fsd/entities/user/model/mapper";
import { ProfileFormSchema } from "./profile.schema";
import {
	failureFromResponse,
	invalidInputFailure,
	invalidResponseFailure,
	networkFailure,
	type ActionResult,
} from "@fsd/shared/api/action-results";

const USERS_ME_ENDPOINT = "/users/me";
const JSON_HEADERS = { "Content-Type": "application/json" };

/** Every profile field is optional: the avatar flow only sends the new url. */
const ProfileUpdateSchema = ProfileFormSchema.partial();

const readJson = async <T>(response: Response): Promise<T | null> => {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
};

const isUserResponse = (body: unknown): body is UserResponse =>
	typeof body === "object" &&
	body !== null &&
	typeof (body as { id?: unknown }).id === "string";

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

export async function updateUserProfile(
	input: UserUpdateRequest,
): Promise<ActionResult<User>> {
	const parsed = ProfileUpdateSchema.safeParse(input);
	if (!parsed.success) {
		return invalidInputFailure(
			parsed.error.issues.map((issue) => issue.message),
		);
	}

	const body: UserUpdateRequest = { ...parsed.data };
	// The form sends "" to clear the picture; the backend expects it omitted.
	if (body.profile_picture_url === "") delete body.profile_picture_url;

	const response = await sendToBackend(USERS_ME_ENDPOINT, {
		method: "PATCH",
		headers: JSON_HEADERS,
		body: JSON.stringify(body),
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	const payload = await readJson<unknown>(response);
	if (!isUserResponse(payload)) return invalidResponseFailure();

	return { ok: true, data: mapUserResponseToUser(payload) };
}

export async function deleteUserAccount(): Promise<ActionResult<null>> {
	const response = await sendToBackend(USERS_ME_ENDPOINT, {
		method: "DELETE",
	});
	if (!response) return networkFailure();
	if (!response.ok) {
		return failureFromResponse(response.status, await readJson(response));
	}

	return { ok: true, data: null };
}
