"use client";

import type { ReactNode } from "react";
import { useAuth, AuthContext } from "@fsd/features/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuth();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export { useAuthContext } from "@fsd/features/auth/model/auth-context";
