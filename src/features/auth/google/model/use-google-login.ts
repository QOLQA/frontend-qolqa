"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@fsd/features/auth/model/auth-context";

export function useGoogleLogin() {
	const { googleLogin } = useAuthContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);

	const submit = useCallback(
		async (credential: string): Promise<void> => {
			if (!credential) return;

			setError(null);

			try {
				await googleLogin(credential);
				// Forzar refresh del router para invalidar cache y re-evaluar autenticación
				// (mismo patrón que useLoginFlow.handleSuccess)
				router.refresh();
				const rawRedirect = searchParams?.get("redirect");
			const target =
				rawRedirect?.startsWith("/") && !rawRedirect.startsWith("//")
					? rawRedirect
					: "/projects";
			router.push(target);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Error al iniciar sesión con Google",
				);
			}
		},
		[googleLogin, router, searchParams],
	);

	return { submit, error };
}
