"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@fsd/features/auth";
import type { User, UserResponse, LoginResult, RegisterData, LoginCredentials } from "@fsd/entities/user";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (credentials: LoginCredentials) => Promise<LoginResult>;
	register: (data: RegisterData) => Promise<UserResponse>;
	logout: () => void;
	refreshUser: () => Promise<void>;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuth();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
