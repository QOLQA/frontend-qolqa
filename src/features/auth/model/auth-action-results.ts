/**
 * Pure result shaping for the auth server actions.
 * Actions never throw for expected auth failures; they return these objects and
 * the client maps them to a message (this module keeps that mapping testable).
 */

import { handleApiError } from "@fsd/shared/api/handleApiError";

export type AuthActionSuccess<T> = { ok: true; data: T };

export type AuthActionFailure = {
	ok: false;
	/** Backend status, or 0 when the backend was unreachable. */
	status: number;
	detail?: string;
	fieldErrors?: string[];
};

export type AuthActionResult<T> = AuthActionSuccess<T> | AuthActionFailure;

export const AUTH_NETWORK_ERROR_MESSAGE =
	"Error de conexión. Verificá tu internet";
export const AUTH_INVALID_RESPONSE_MESSAGE =
	"Respuesta de autenticación inválida";
export const AUTH_GOOGLE_ERROR_MESSAGE = "Error al iniciar sesión con Google";
export const AUTH_INVALID_CREDENTIAL_MESSAGE = "Credencial de Google vacía";

const GOOGLE_STATUS_MESSAGES: Readonly<Record<number, string>> = {
	401: "Token de Google inválido. Intentá de nuevo.",
	403: "Esta cuenta usa login con contraseña. Usá el formulario de email/password.",
	429: "Demasiados intentos. Esperá un momento.",
	503: "Login con Google no disponible temporalmente.",
};

export const googleErrorMessage = (status: number): string =>
	GOOGLE_STATUS_MESSAGES[status] ?? AUTH_GOOGLE_ERROR_MESSAGE;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const readBackendDetail = (body: unknown): string | undefined => {
	if (!isRecord(body)) return undefined;
	const detail = body.detail;
	return typeof detail === "string" && detail.length > 0 ? detail : undefined;
};

export const readFieldErrors = (body: unknown): string[] | undefined => {
	if (!isRecord(body) || !Array.isArray(body.detail)) return undefined;

	const messages = body.detail
		.filter(isRecord)
		.map((entry) => entry.msg)
		.filter((msg): msg is string => typeof msg === "string");

	return messages.length > 0 ? messages : undefined;
};

export const readAccessToken = (body: unknown): string | null => {
	if (!isRecord(body)) return null;
	const token = body.access_token;
	return typeof token === "string" && token.length > 0 ? token : null;
};

export const failureFromResponse = (
	status: number,
	body: unknown,
): AuthActionFailure => {
	const fieldErrors = readFieldErrors(body);
	if (fieldErrors) return { ok: false, status, fieldErrors };

	const detail = readBackendDetail(body);
	return detail ? { ok: false, status, detail } : { ok: false, status };
};

export const networkFailure = (): AuthActionFailure => ({
	ok: false,
	status: 0,
	detail: AUTH_NETWORK_ERROR_MESSAGE,
});

/** The backend accepted the request but handed back no usable token. */
export const invalidResponseFailure = (): AuthActionFailure => ({
	ok: false,
	status: 502,
	detail: AUTH_INVALID_RESPONSE_MESSAGE,
});

/**
 * Message shown to the user for a failed action. Backend details win, then the
 * status mapping shared with every other API error, then the network fallback.
 */
export const authFailureMessage = (
	failure: AuthActionFailure,
	t: (path: string) => string,
): string => {
	if (failure.fieldErrors && failure.fieldErrors.length > 0) {
		return failure.fieldErrors.join(", ");
	}

	if (failure.status === 0) return AUTH_NETWORK_ERROR_MESSAGE;

	if (failure.detail) return failure.detail;

	return handleApiError(
		{ message: undefined },
		{ status: failure.status },
		t,
	);
};
