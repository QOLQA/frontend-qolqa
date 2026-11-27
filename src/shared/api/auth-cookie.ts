/**
 * Single source of truth for the authentication cookie.
 * Shared by the server actions that set it and the BFF proxy that clears it.
 */

export const AUTH_COOKIE_NAME = "access_token";

/** Aligned with the backend access-token lifetime (30 minutes). */
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 1800;

export interface AuthCookieOptions {
	httpOnly: boolean;
	path: string;
	sameSite: "lax";
	secure: boolean;
	maxAge: number;
}

export const isProductionEnv = (nodeEnv: string | undefined): boolean =>
	nodeEnv === "production";

/**
 * The JWT lives in an httpOnly cookie so browser JavaScript can never read it.
 * SameSite=Lax keeps it on same-origin navigation and Secure is added in production.
 */
export const createAuthCookieOptions = (
	nodeEnv: string | undefined = process.env.NODE_ENV,
): AuthCookieOptions => ({
	httpOnly: true,
	path: "/",
	sameSite: "lax",
	secure: isProductionEnv(nodeEnv),
	maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
});

/** Same flags with an immediate expiry, used to clear the session server-side. */
export const createExpiredAuthCookieOptions = (
	nodeEnv: string | undefined = process.env.NODE_ENV,
): AuthCookieOptions => ({
	...createAuthCookieOptions(nodeEnv),
	maxAge: 0,
});
