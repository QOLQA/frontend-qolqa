/**
 * Cloudinary signed-upload endpoint (S1 / T8).
 *
 * The api secret never reaches the browser: the client asks this route for a
 * signature of server-validated params and then uploads the bytes straight to
 * Cloudinary, so no image data passes through the Next.js server.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@fsd/shared/api/auth-cookie";
import {
	buildCloudinarySignature,
	resolveCloudName,
	resolveSignedParams,
} from "@fsd/shared/lib/image/cloudinary-sign";

/** Server-only: the whole point of this route. */
const API_SECRET_ENV = "CLOUDINARY_API_SECRET";
/** Public: the value Cloudinary expects next to the signature. */
const API_KEY_ENV = "NEXT_PUBLIC_CLOUDINARY_API_KEY";
/** Public: the upload endpoint, which also names the cloud. */
const UPLOAD_URL_ENV = "NEXT_PUBLIC_CLOUDINARY_URL";

const OK = 200;
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;

const json = (body: unknown, status: number): NextResponse =>
	NextResponse.json(body, { status });

const hasSession = async (): Promise<boolean> => {
	const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
	return typeof token === "string" && token.length > 0;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
	if (!(await hasSession())) {
		return json({ detail: "Unauthorized" }, UNAUTHORIZED);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ detail: "Invalid JSON body" }, BAD_REQUEST);
	}

	const resolved = resolveSignedParams(
		payload,
		Math.floor(Date.now() / 1000),
	);
	if (!resolved.ok) {
		return json({ detail: resolved.detail }, BAD_REQUEST);
	}

	const apiSecret = process.env[API_SECRET_ENV];
	const apiKey = process.env[API_KEY_ENV];
	const cloudName = resolveCloudName(process.env[UPLOAD_URL_ENV] ?? "");

	if (!apiSecret || !apiKey || !cloudName) {
		return json({ detail: "Cloudinary is not configured" }, SERVER_ERROR);
	}

	return json(
		{
			signature: buildCloudinarySignature(resolved.params, apiSecret),
			timestamp: resolved.params.timestamp,
			api_key: apiKey,
			cloud_name: cloudName,
			params: resolved.params,
		},
		OK,
	);
}
