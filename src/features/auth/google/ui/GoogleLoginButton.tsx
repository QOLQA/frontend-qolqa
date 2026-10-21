"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "../model/use-google-login";

export function GoogleLoginButton() {
	const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
	const { submit, error } = useGoogleLogin();
	const [gsiError, setGsiError] = useState<string | null>(null);

	if (!clientId) {
		return <p>Login con Google no disponible.</p>;
	}

	return (
		<div>
			<GoogleLogin
				onSuccess={(credentialResponse) => {
					setGsiError(null);
					const credential = credentialResponse.credential;
					if (credential) {
						void submit(credential);
					}
				}}
				onError={() => {
					setGsiError(
						"No se pudo abrir el login de Google. Intentá de nuevo.",
					);
				}}
			/>
			{(error ?? gsiError) && (
				<p className="text-red-500">{error ?? gsiError}</p>
			)}
		</div>
	);
}
