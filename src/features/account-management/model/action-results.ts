/**
 * Pure result shaping for the account-management server actions.
 *
 * Same contract as the auth actions: expected failures come back as objects,
 * never as thrown errors, and `actionFailureMessage` turns a failure into the
 * string the profile UI already displays.
 */

import { handleApiError } from "@fsd/shared/api/handleApiError";

export interface ActionFailure {
	ok: false;
	/** Backend status, 0 when the backend was unreachable, 422 for local input. */
	status: number;
	detail?: string;
	fieldErrors?: string[];
}

export type ActionSuccess<T> = { ok: true; data: T };

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export const ACTION_NETWORK_ERROR_MESSAGE =
	"Error de conexión. Verificá tu internet";

export const ACTION_INVALID_INPUT_STATUS = 422;

const INVALID_RESPONSE_STATUS = 502;
const INVALID_RESPONSE_MESSAGE = "Respuesta inválida del servidor";

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

export const failureFromResponse = (
	status: number,
	body: unknown,
): ActionFailure => {
	const fieldErrors = readFieldErrors(body);
	if (fieldErrors) return { ok: false, status, fieldErrors };

	const detail = readBackendDetail(body);
	return detail ? { ok: false, status, detail } : { ok: false, status };
};

export const networkFailure = (): ActionFailure => ({
	ok: false,
	status: 0,
	detail: ACTION_NETWORK_ERROR_MESSAGE,
});

/** The backend answered but the payload cannot be used. */
export const invalidResponseFailure = (): ActionFailure => ({
	ok: false,
	status: INVALID_RESPONSE_STATUS,
	detail: INVALID_RESPONSE_MESSAGE,
});

/** Input rejected by the shared Zod schema before reaching the backend. */
export const invalidInputFailure = (fieldErrors: string[]): ActionFailure => ({
	ok: false,
	status: ACTION_INVALID_INPUT_STATUS,
	fieldErrors,
});

/**
 * Message shown to the user for a failed action: field errors win, then the
 * backend detail, then the status mapping shared with every other API error.
 */
export const actionFailureMessage = (failure: ActionFailure): string => {
	if (failure.fieldErrors && failure.fieldErrors.length > 0) {
		return failure.fieldErrors.join(", ");
	}

	if (failure.status === 0) return ACTION_NETWORK_ERROR_MESSAGE;

	if (failure.detail) return failure.detail;

	return handleApiError({ message: undefined }, { status: failure.status });
};
