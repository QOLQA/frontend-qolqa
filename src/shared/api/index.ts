export { API_PROXY_BASE, resolveApiUrl, clearAuthCookie, fetchWithAuth, api } from "./client";
export type { FetchOptions, ApiRequestOptions } from "./client";
export { AUTH_COOKIE_NAME, createAuthCookieOptions, createExpiredAuthCookieOptions } from "./auth-cookie";
export {
	validatePassword,
	validateUsername,
	validateEmail,
} from "./validators";
export { handleApiError } from "./handleApiError";
