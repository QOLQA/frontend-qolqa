/**
 * Same-origin API client for browser code.
 *
 * Every request goes through the Next.js BFF proxy (`app/api/[...path]`), which
 * attaches the httpOnly `access_token` cookie server-side. The backend URL and
 * the JWT never reach the browser: there is no localStorage token and no
 * Authorization header here.
 */

import { AUTH_COOKIE_NAME } from "./auth-cookie";
import { redirectToLogin } from "./redirect";

export const API_PROXY_BASE = "/api";

// Error keys — consumers are responsible for i18n translation
export const API_ERROR_SESSION_EXPIRED = "errors.session_expired";
export const API_ERROR_REQUEST_FAILED = "errors.request_failed";

const CLEAR_AUTH_COOKIE = `${AUTH_COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

/**
 * Best-effort client cleanup. The httpOnly cookie is owned and cleared by the
 * server (logout action and the proxy's own 401 handling).
 */
export const clearAuthCookie = (): void => {
	if (typeof document === "undefined") return;
	document.cookie = CLEAR_AUTH_COOKIE;
};

/** Relative endpoints ride the BFF proxy; absolute URLs (e.g. uploads) pass through. */
export const resolveApiUrl = (endpoint: string): string =>
	endpoint.startsWith("http") ? endpoint : `${API_PROXY_BASE}${endpoint}`;

export interface ApiRequestOptions {
	/**
	 * When false, a 401 clears the cookie and throws without navigating to
	 * `/login`. Session probes on public pages use it so anonymous visitors
	 * are not bounced off the landing page.
	 */
	redirectOnUnauthorized?: boolean;
}

export interface FetchOptions extends RequestInit, ApiRequestOptions {
	headers?: Record<string, string>;
}

export const fetchWithAuth = async (
	endpoint: string,
	options: FetchOptions = {},
): Promise<Response> => {
	const {
		redirectOnUnauthorized = true,
		headers: optionHeaders,
		...init
	} = options;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...optionHeaders,
	};

	const response = await fetch(resolveApiUrl(endpoint), {
		...init,
		headers,
	});

	// An expired or missing session: drop the cookie and send the user to /login.
	if (response.status === 401) {
		clearAuthCookie();
		if (redirectOnUnauthorized) {
			redirectToLogin();
		}
		throw new Error(API_ERROR_SESSION_EXPIRED);
	}

	return response;
};

interface ApiErrorBody {
	detail?: unknown;
}

const readErrorDetail = async (response: Response): Promise<string> => {
	const body = (await response
		.json()
		.catch(() => null)) as ApiErrorBody | null;
	const detail = body?.detail;
	return typeof detail === "string" && detail.length > 0
		? detail
		: API_ERROR_REQUEST_FAILED;
};

export const api = {
	async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
		const response = await fetchWithAuth(endpoint, options);
		if (!response.ok) {
			throw new Error(await readErrorDetail(response));
		}
		return response.json();
	},

	async post<T>(endpoint: string, data: unknown): Promise<T> {
		const response = await fetchWithAuth(endpoint, {
			method: "POST",
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(await readErrorDetail(response));
		}
		return response.json();
	},

	async patch<T>(endpoint: string, data: unknown): Promise<T> {
		const response = await fetchWithAuth(endpoint, {
			method: "PATCH",
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(await readErrorDetail(response));
		}
		return response.json();
	},

	async delete(endpoint: string): Promise<void> {
		const response = await fetchWithAuth(endpoint, {
			method: "DELETE",
		});
		if (!response.ok && response.status !== 204) {
			throw new Error(await readErrorDetail(response));
		}
	},
};
