import { api } from "@fsd/shared/api/client";
import { mapUserResponseToUser } from "../model/mapper";
import type { User, UserResponse, UserUpdateRequest } from "../model/user";

export async function updateUserMe(body: UserUpdateRequest): Promise<User> {
	const response = await api.patch<UserResponse>("/users/me", body);
	return mapUserResponseToUser(response);
}
