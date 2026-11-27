/**
 * Pure helpers for the BFF proxy route (`app/api/[...path]`).
 * The Next-runtime pieces stay in the route handler; the mapping rules live here.
 */

export const PROXY_JSON_CONTENT_TYPE = "application/json";

const METHODS_WITH_BODY: ReadonlySet<string> = new Set([
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
]);

export const hasRequestBody = (method: string): boolean =>
	METHODS_WITH_BODY.has(method.toUpperCase());

export const isJsonContentType = (value: string | null | undefined): boolean => {
	if (!value) return false;
	const mediaType = value.split(";")[0]?.trim().toLowerCase() ?? "";
	return mediaType === PROXY_JSON_CONTENT_TYPE || mediaType.endsWith("+json");
};

/**
 * Builds the backend path from the catch-all segments.
 * Segments are re-encoded so a crafted value cannot walk out of the proxy prefix.
 */
export const buildBackendPath = (
	segments: readonly string[],
	search = "",
): string => {
	const path =
		segments.map((segment) => `/${encodeURIComponent(segment)}`).join("") || "/";

	if (!search) return path;

	return `${path}${search.startsWith("?") ? search : `?${search}`}`;
};
