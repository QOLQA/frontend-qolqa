import { createContext, useContext } from "react";
import type {
	User,
	UserResponse,
	LoginResult,
	LoginCredentials,
	RegisterData,
} from "@fsd/entities/user";

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (credentials: LoginCredentials) => Promise<LoginResult>;
	register: (data: RegisterData) => Promise<UserResponse>;
	logout: () => void;
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
