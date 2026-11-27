"use server";

/**
 * Auth server actions (S3 pattern: the login flow model).
 *
 * Every call hits the backend with the server-only BACKEND_URL, keeps the JWT on
 * the server and stores it in an httpOnly cookie. The browser only receives a
 * typed result object — never the token — and expected auth failures are
 * returned, not thrown.
 */

import { cookies } from "next/headers";
import type { UserResponse } from "@fsd/entities/user";
import {
	AUTH_COOKIE_NAME,
	createAuthCookieOptions,
	createExpiredAuthCookieOptions,
} from "@fsd/shared/api/auth-cookie";
import { getBackendUrl } from "@fsd/shared/api/server";
import {
	failureFromResponse,
	invalidResponseFailure,
	networkFailure,
	readAccessToken,
	type AuthActionResult,
} from "./auth-action-results";

interface LoginInput {
	username: string;
	password: string;
}

interface RegisterInput {
	username: string;
	email: string;
	password: string;
	full_name?: string;
}

const JSON_HEADERS = { "Content-Type": "application/json" };
const FORM_HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };

async function persistAuthCookie(token: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(AUTH_COOKIE_NAME, token, createAuthCookieOptions());
}

async function postToBackend(
	path: string,
	body: BodyInit,
	headers: Record<string, string>,
): Promise<Response | null> {
	try {
		return await fetch(`${getBackendUrl()}${path}`, {
			method: "POST",
			headers,
			body,
			cache: "no-store",
		});
	} catch {
		return null;
	}
}

async function readJson<T>(response: Response): Promise<T | null> {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

function encodeCredentials(username: string, password: string): string {
	const form = new URLSearchParams();
	form.set("username", username);
	form.set("password", password);
	return form.toString();
}

/** Exchanges credentials for a token, without touching the cookie jar yet. */
async function requestToken(
	path: string,
	body: BodyInit,
	headers: Record<string, string>,
): Promise<AuthActionResult<string>> {
	const response = await postToBackend(path, body, headers);
	if (!response) return networkFailure();

	const payload = await readJson<unknown>(response);
	if (!response.ok) return failureFromResponse(response.status, payload);

	const token = readAccessToken(payload);
	return token ? { ok: true, data: token } : invalidResponseFailure();
}

export async function loginAction(
	input: LoginInput,
): Promise<AuthActionResult<null>> {
	const result = await requestToken(
		"/auth/login",
		encodeCredentials(input.username, input.password),
		FORM_HEADERS,
	);

	if (!result.ok) return result;

	await persistAuthCookie(result.data);
	return { ok: true, data: null };
}

export async function googleLoginAction(
	credential: string,
): Promise<AuthActionResult<null>> {
	const result = await requestToken(
		"/auth/google",
		JSON.stringify({ credential }),
		JSON_HEADERS,
	);

	if (!result.ok) return result;

	await persistAuthCookie(result.data);
	return { ok: true, data: null };
}

export async function registerAction(
	input: RegisterInput,
): Promise<AuthActionResult<UserResponse>> {
	const response = await postToBackend(
		"/auth/register",
		JSON.stringify(input),
		JSON_HEADERS,
	);
	if (!response) return networkFailure();

	const payload = await readJson<unknown>(response);
	if (!response.ok) return failureFromResponse(response.status, payload);

	const user = toUserResponse(payload);

	const inlineToken = readAccessToken(payload);
	if (inlineToken) {
		await persistAuthCookie(inlineToken);
		return { ok: true, data: user };
	}

	// The backend registers without a token: sign the new account in server-side.
	const login = await requestToken(
		"/auth/login",
		encodeCredentials(input.username, input.password),
		FORM_HEADERS,
	);
	if (!login.ok) return login;

	await persistAuthCookie(login.data);
	return { ok: true, data: user };
}

/**
 * Map the backend register payload to the explicit UserResponse fields.
 * Never passthrough the raw payload: it can inline the access token, which
 * must never be serialized back to the browser.
 */
const toUserResponse = (payload: unknown): UserResponse => {
	const record =
		typeof payload === "object" && payload !== null
			? (payload as Record<string, unknown>)
			: {};

	return {
		id: String(record.id ?? ""),
		username: String(record.username ?? ""),
		email: String(record.email ?? ""),
		full_name:
			typeof record.full_name === "string" ? record.full_name : undefined,
		profile_picture_url:
			typeof record.profile_picture_url === "string"
				? record.profile_picture_url
				: null,
		is_active: record.is_active === true,
		created_at: String(record.created_at ?? ""),
	};
};

export async function logoutAction(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(AUTH_COOKIE_NAME, "", createExpiredAuthCookieOptions());
}
