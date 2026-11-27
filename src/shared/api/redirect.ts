export const LOGIN_PATH = "/login";

/**
 * Navigation side effect of an expired session.
 * Isolated so the 401 contract stays testable without driving jsdom navigation.
 */
export const redirectToLogin = (): void => {
	if (typeof window === "undefined") return;
	window.location.assign(LOGIN_PATH);
};
