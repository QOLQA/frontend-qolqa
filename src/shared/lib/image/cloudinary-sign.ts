/**
 * Pure rules for Cloudinary signed uploads. Server-only: it hashes with the
 * api secret, so nothing in the browser bundle may import it (that is why
 * `lib/image/index.ts` does not re-export it).
 *
 * The browser only names the public id and an optional folder; the timestamp
 * and the overwrite flag belong to the server, and any other param is refused
 * instead of signed blindly.
 */

import { createHash } from "node:crypto";

export const CLOUDINARY_OVERWRITE = "true";

export type CloudinarySignedParams = Record<string, string>;

export type SignedParamsResult =
	| { ok: true; params: CloudinarySignedParams }
	| { ok: false; detail: string };

const MAX_PUBLIC_ID_LENGTH = 128;
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const FOLDER_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const CLOUD_NAME_PATTERN = /\/v1_1\/([A-Za-z0-9_-]+)/;

/** Folders an upload may be signed into; anything else is rejected. */
const ALLOWED_FOLDER_PREFIXES: readonly string[] = ["solutions", "avatars"];

/** The only client-supplied fields the sign route accepts. */
const ALLOWED_REQUEST_KEYS: readonly string[] = ["publicId", "folder"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

/** Cloudinary treats a public id as a path-free name, so no `/`, `.` or spaces. */
const resolvePublicId = (value: unknown): string | null => {
	if (typeof value !== "string" || value.length === 0) return null;
	if (value.length > MAX_PUBLIC_ID_LENGTH) return null;
	return PUBLIC_ID_PATTERN.test(value) ? value : null;
};

/** `undefined` means "not requested"; `null` means "requested but not allowed". */
const resolveFolder = (value: unknown): string | null | undefined => {
	if (value === undefined) return undefined;
	if (typeof value !== "string" || value.length === 0) return null;

	const segments = value.split("/");
	if (segments.some((segment) => !FOLDER_SEGMENT_PATTERN.test(segment))) {
		return null;
	}

	return ALLOWED_FOLDER_PREFIXES.includes(segments[0]) ? value : null;
};

/** Cloudinary's signed-upload spec: sha1 of the sorted params plus the secret. */
export const buildCloudinarySignature = (
	params: CloudinarySignedParams,
	apiSecret: string,
): string => {
	const stringToSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join("&");

	return createHash("sha1").update(stringToSign + apiSecret).digest("hex");
};

/**
 * Turns a client request into the exact params the server signs, or the reason
 * it cannot. `timestampSeconds` is server time, never a client value.
 */
export const resolveSignedParams = (
	input: unknown,
	timestampSeconds: number,
): SignedParamsResult => {
	if (!isRecord(input)) {
		return { ok: false, detail: "Invalid request body" };
	}

	const unsupported = Object.keys(input).find(
		(key) => !ALLOWED_REQUEST_KEYS.includes(key),
	);
	if (unsupported) {
		return { ok: false, detail: `Unsupported parameter: ${unsupported}` };
	}

	const publicId = resolvePublicId(input.publicId);
	if (!publicId) {
		return {
			ok: false,
			detail:
				input.publicId === undefined
					? "public_id is required"
					: "Invalid public_id",
		};
	}

	const folder = resolveFolder(input.folder);
	if (folder === null) {
		return { ok: false, detail: "Invalid folder" };
	}

	return {
		ok: true,
		params: {
			overwrite: CLOUDINARY_OVERWRITE,
			public_id: publicId,
			timestamp: String(timestampSeconds),
			...(folder === undefined ? {} : { folder }),
		},
	};
};

/** The upload URL is public (`NEXT_PUBLIC_*`), and it already carries the cloud name. */
export const resolveCloudName = (uploadUrl: string): string | null =>
	CLOUD_NAME_PATTERN.exec(uploadUrl)?.[1] ?? null;
