import { describe, expect, it } from "vitest";
import { mapUserResponseToUser } from "./mapper";
import type { UserResponse } from "./user";

const baseResponse: UserResponse = {
	id: "user-1",
	username: "testuser",
	email: "test@example.com",
	full_name: "Test User",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

describe("mapUserResponseToUser", () => {
	it("maps profile_picture_url to avatar when present", () => {
		const response: UserResponse = {
			...baseResponse,
			profile_picture_url: "https://example.com/avatar.jpg",
		};

		const user = mapUserResponseToUser(response);

		expect(user.avatar).toBe("https://example.com/avatar.jpg");
		expect(user.profile_picture_url).toBe("https://example.com/avatar.jpg");
	});

	it("sets avatar to undefined when profile_picture_url is null", () => {
		const response: UserResponse = {
			...baseResponse,
			profile_picture_url: null,
		};

		const user = mapUserResponseToUser(response);

		expect(user.avatar).toBeUndefined();
	});

	it("sets avatar to undefined when profile_picture_url is absent", () => {
		const response: UserResponse = { ...baseResponse };

		const user = mapUserResponseToUser(response);

		expect(user.avatar).toBeUndefined();
	});

	it("preserves all other User fields", () => {
		const response: UserResponse = {
			...baseResponse,
			profile_picture_url: "https://example.com/pic.png",
		};

		const user = mapUserResponseToUser(response);

		expect(user.id).toBe("user-1");
		expect(user.username).toBe("testuser");
		expect(user.email).toBe("test@example.com");
		expect(user.full_name).toBe("Test User");
		expect(user.is_active).toBe(true);
		expect(user.created_at).toBe("2024-01-01T00:00:00Z");
	});
});
