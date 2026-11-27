import { createContext, useContext } from "react";
import type {
	User,
	UserResponse,
	LoginCredentials,
	RegisterData,
} from "@fsd/entities/user";

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	/** Signs in through the server action; resolves once the cookie is set. */
	login: (credentials: LoginCredentials) => Promise<void>;
	googleLogin: (credential: string) => Promise<void>;
	register: (data: RegisterData) => Promise<UserResponse>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
