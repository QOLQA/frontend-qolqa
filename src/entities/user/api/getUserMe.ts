import { api } from "@fsd/shared/api/client";
import { mapUserResponseToUser } from "../model/mapper";
import type { User, UserResponse } from "../model/user";

export async function getUserMe(): Promise<User> {
	const response = await api.get<UserResponse>("/auth/me");
	return mapUserResponseToUser(response);
}
