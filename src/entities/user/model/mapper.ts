import type { User, UserResponse } from "./user";

export function mapUserResponseToUser(response: UserResponse): User {
	return {
		id: response.id,
		username: response.username,
		email: response.email,
		full_name: response.full_name,
		is_active: response.is_active,
		created_at: response.created_at,
		profile_picture_url: response.profile_picture_url ?? undefined,
		avatar: response.profile_picture_url ?? undefined,
	};
}
