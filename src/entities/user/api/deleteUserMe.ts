import { api } from "@fsd/shared/api/client";

export async function deleteUserMe(): Promise<void> {
	await api.delete("/users/me");
}
