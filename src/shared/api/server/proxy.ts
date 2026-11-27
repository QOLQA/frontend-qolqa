/**
 * Core of the BFF proxy: forwards one browser request to the backend through
 * `serverFetchWithAuth` and returns the backend status and body unchanged.
 */

import { NextResponse } from "next/server";
import {
	AUTH_COOKIE_NAME,
	createExpiredAuthCookieOptions,
} from "../auth-cookie";
import { buildBackendPath } from "../proxy";
import { serverFetchWithAuth } from "./index";

export interface BackendProxyRequest {
	method: string;
	segments: readonly string[];
	search?: string;
	body?: string;
	contentType?: string | null;
}

const UNAUTHORIZED = 401;

export async function proxyToBackend(
	input: BackendProxyRequest,
): Promise<NextResponse> {
	const response = await serverFetchWithAuth(
		buildBackendPath(input.segments, input.search),
		{
			method: input.method,
			...(input.body === undefined ? {} : { body: input.body }),
			...(input.contentType
				? { headers: { "Content-Type": input.contentType } }
				: {}),
		},
	);

	const payload = await response.arrayBuffer();
	const proxied = new NextResponse(
		payload.byteLength === 0 ? null : payload,
		{ status: response.status },
	);

	const contentType = response.headers.get("content-type");
	if (contentType) {
		proxied.headers.set("content-type", contentType);
	}

	// Expired session: drop the cookie so the client contract (redirect to
	// /login) keeps working instead of retrying with a dead token.
	if (response.status === UNAUTHORIZED) {
		proxied.cookies.set(
			AUTH_COOKIE_NAME,
			"",
			createExpiredAuthCookieOptions(),
		);
	}

	return proxied;
}
