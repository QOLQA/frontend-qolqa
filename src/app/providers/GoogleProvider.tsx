"use client";

import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleProviderProps {
	children: ReactNode;
}

export function GoogleProvider({ children }: GoogleProviderProps) {
	const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

	if (!clientId) {
		return <>{children}</>;
	}

	return (
		<GoogleOAuthProvider
			clientId={clientId}
			onScriptLoadError={() => {
				console.warn("Google OAuth script failed to load");
			}}
		>
			{children}
		</GoogleOAuthProvider>
	);
}
