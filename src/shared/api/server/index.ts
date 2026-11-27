/**
 * Utilidades de API para server-side
 * Next.js server components, server actions y route handlers
 */

import { cookies } from "next/headers";

/**
 * URL interna del backend. Solo se resuelve en el servidor: el navegador nunca
 * conoce esta dirección porque todo pasa por el proxy `/api/*`.
 *
 * En Docker/Dockploy: nombre del contenedor (ej. http://fastapi:8000)
 * En desarrollo sin Docker: localhost
 */
export function getBackendUrl(): string {
	return process.env.BACKEND_URL || "http://localhost:8000";
}

/**
 * Obtiene el token de autenticación de las cookies
 */
export async function getServerAuthToken(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get("access_token")?.value || null;
}

/**
 * Verifica si el usuario está autenticado (optimista)
 * Solo verifica la existencia del token, no su validez
 */
export async function isAuthenticated(): Promise<boolean> {
	const cookieStore = await cookies();
	return cookieStore.has("access_token");
}

/**
 * Fetch con autenticación para server-side.
 * Construye sus propios headers a partir del token en la cookie httpOnly: nunca
 * reenvía las cookies del navegador al backend.
 */
export async function serverFetchWithAuth(
	endpoint: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = await getServerAuthToken();

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const url = endpoint.startsWith("http") ? endpoint : `${getBackendUrl()}${endpoint}`;

	return fetch(url, {
		...options,
		headers,
		cache: "no-store", // Siempre obtener datos frescos para datos autenticados
	});
}
