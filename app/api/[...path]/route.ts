/**
 * Thin BFF proxy: every browser call to `/api/*` is forwarded server-side to
 * BACKEND_URL with the httpOnly cookie turned into a bearer token.
 *
 * The browser never learns the backend URL and never sees the JWT.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasRequestBody, isJsonContentType } from "@fsd/shared/api/proxy";
import { proxyToBackend } from "@fsd/shared/api/server/proxy";

interface RouteContext {
	params: Promise<{ path: string[] }>;
}

const UNSUPPORTED_MEDIA_TYPE = 415;
const BAD_REQUEST = 400;

async function handle(
	request: NextRequest,
	context: RouteContext,
): Promise<NextResponse> {
	const { path } = await context.params;
	const contentType = request.headers.get("content-type");

	let body: string | undefined;

	if (hasRequestBody(request.method)) {
		const rawBody = await request.text();

		if (rawBody.length > 0) {
			if (!isJsonContentType(contentType)) {
				return NextResponse.json(
					{ detail: "Unsupported media type" },
					{ status: UNSUPPORTED_MEDIA_TYPE },
				);
			}

			try {
				JSON.parse(rawBody);
			} catch {
				return NextResponse.json(
					{ detail: "Invalid JSON body" },
					{ status: BAD_REQUEST },
				);
			}

			body = rawBody;
		}
	}

	return proxyToBackend({
		method: request.method,
		segments: path,
		search: request.nextUrl.search,
		body,
		contentType: body === undefined ? null : contentType,
	});
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
