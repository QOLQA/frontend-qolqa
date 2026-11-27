/**
 * Pure result shaping for the query-management server actions.
 *
 * Actions never throw for expected failures: they return these objects so the
 * optimistic store flow can roll back. Mirrors the projects/auth action contract
 * (`pages/projects/model`, `features/auth/model`); the helpers are duplicated
 * deliberately because `@fsd/shared/api` is outside the T4b edit surface.
 */

export interface ActionFailure {
	ok: false;
	/** Backend status, or 0 when the backend was unreachable. */
	status: number;
	detail?: string;
	fieldErrors?: string[];
}

export type ActionSuccess<T> = { ok: true; data: T };

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export const ACTION_NETWORK_ERROR_MESSAGE =
	"Error de conexión. Verificá tu internet";

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
