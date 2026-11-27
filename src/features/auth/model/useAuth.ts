"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, clearAuthCookie } from "@fsd/shared/api";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import type {
	User,
	UserResponse,
	LoginCredentials,
	RegisterData,
} from "@fsd/entities/user";
import {
	googleLoginAction,
	loginAction,
	logoutAction,
	registerAction,
} from "./auth-actions";
import {
	AUTH_GOOGLE_ERROR_MESSAGE,
	AUTH_INVALID_CREDENTIAL_MESSAGE,
	AUTH_NETWORK_ERROR_MESSAGE,
	authFailureMessage,
	googleErrorMessage,
} from "./auth-action-results";

const AUTH_ME_ENDPOINT = "/auth/me";
const LOGIN_ROUTE = "/login";

export const useAuth = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// React Compiler cannot optimize: async function used as dep in useEffect below
	const checkAuth = useCallback(async () => {
		try {
			// The httpOnly cookie travels on this same-origin call; the proxy turns
			// it into the backend bearer token for us.
			const userData = await api.get<User>(AUTH_ME_ENDPOINT, {
				redirectOnUnauthorized: false,
			});
			setUser(userData);
		} catch {
			// No usable session (or the backend is down): stay signed out without
			// bouncing anonymous visitors off public pages.
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = useCallback(
		async (credentials: LoginCredentials): Promise<void> => {
			setError(null);
			setLoading(true);

			try {
				const result = await loginAction(credentials);
				if (!result.ok) throw new Error(authFailureMessage(result, t));

				await checkAuth();
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al iniciar sesión";
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[checkAuth, t],
	);

	// React Compiler cannot optimize: async callback exposed through AuthContext (stable ref for consumers)
	const googleLogin = useCallback(
		async (credential: string): Promise<void> => {
			if (!credential) {
				throw new Error(AUTH_INVALID_CREDENTIAL_MESSAGE);
			}

			setError(null);
			setLoading(true);

			try {
				const result = await googleLoginAction(credential);

				if (!result.ok) {
					throw new Error(
						result.status === 0
							? AUTH_NETWORK_ERROR_MESSAGE
							: googleErrorMessage(result.status),
					);
				}

				await checkAuth();
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : AUTH_GOOGLE_ERROR_MESSAGE;
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[checkAuth],
	);

	// React Compiler cannot optimize: depends on login (stable ref needed to avoid stale closure)
	const register = useCallback(
		async (data: RegisterData): Promise<UserResponse> => {
			setError(null);
			setLoading(true);

			try {
				const result = await registerAction(data);
				if (!result.ok) throw new Error(authFailureMessage(result, t));

				await checkAuth();
				return result.data;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al registrar";
				setError(errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[checkAuth, t],
	);

	// React Compiler cannot optimize: closure over setUser/setError state setters
	const logout = useCallback(async (): Promise<void> => {
		try {
			// Clear the httpOnly cookie server-side first: navigating while it is
			// still valid would bounce back from /login through the proxy.
			await logoutAction();
		} catch {
			// The local cleanup below still signs the user out of this tab.
		} finally {
			clearAuthCookie();
			setUser(null);
			setError(null);
			router.push(LOGIN_ROUTE);
			router.refresh();
		}
	}, [router]);

	// React Compiler cannot optimize: async function passed as stable ref to AuthContext consumers
	const refreshUser = useCallback(async (): Promise<void> => {
		try {
			const userData = await api.get<User>(AUTH_ME_ENDPOINT, {
				redirectOnUnauthorized: false,
			});
			setUser(userData);
		} catch {
			// Refresh is best-effort — user stays as-is if the request fails
		}
	}, []);

	return {
		user,
		loading,
		error,
		login,
		googleLogin,
		register,
		logout,
		isAuthenticated: !!user,
		checkAuth,
		refreshUser,
	};
};
