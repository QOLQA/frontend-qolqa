export { API_PROXY_BASE, resolveApiUrl, clearAuthCookie, fetchWithAuth, api } from "./client";
export type { FetchOptions, ApiRequestOptions } from "./client";
export { AUTH_COOKIE_NAME, createAuthCookieOptions, createExpiredAuthCookieOptions } from "./auth-cookie";
export {
	validatePassword,
	validateUsername,
	validateEmail,
} from "./validators";
export { handleApiError } from "./handleApiError";
export {
	ACTION_NETWORK_ERROR_MESSAGE,
	ACTION_INVALID_INPUT_STATUS,
	readBackendDetail,
	readFieldErrors,
	failureFromResponse,
	networkFailure,
	invalidResponseFailure,
	invalidInputFailure,
	actionFailureMessage,
} from "./action-results";
export type { ActionFailure, ActionResult, ActionSuccess } from "./action-results";
