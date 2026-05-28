export interface User {
	id: string;
	username: string;
	email: string;
	full_name?: string;
	avatar?: string;
	profile_picture_url?: string;
	is_active: boolean;
	created_at: string;
}

export interface UserUpdateRequest {
	email?: string;
	full_name?: string;
	profile_picture_url?: string;
}

export interface UserResponse {
	id: string;
	username: string;
	email: string;
	full_name?: string;
	profile_picture_url?: string | null;
	is_active: boolean;
	created_at: string;
}

export interface LoginResult {
	access_token: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	full_name?: string;
}
