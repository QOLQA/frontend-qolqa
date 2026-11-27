import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockServerFetchWithAuth } = vi.hoisted(() => ({
	mockServerFetchWithAuth: vi.fn(),
}));

vi.mock("@fsd/shared/api/server", () => ({
	serverFetchWithAuth: mockServerFetchWithAuth,
}));

import { deleteUserAccount, updateUserProfile } from "./actions";
import { ACTION_NETWORK_ERROR_MESSAGE } from "./action-results";

const userResponse = {
	id: "user-1",
	username: "jdoe",
	email: "jane@example.com",
	full_name: "Jane Doe",
	profile_picture_url: "https://cdn.example.com/avatar.png",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

const jsonResponse = (status: number, body: unknown) => ({
	ok: status >= 200 && status < 300,
	status,
	json: () => Promise.resolve(body),
});

const emptyResponse = () => ({
	ok: true,
	status: 204,
	json: () => Promise.reject(new Error("no body")),
});

const callOf = (index = 0) =>
	mockServerFetchWithAuth.mock.calls[index] as [string, RequestInit];

describe("account management server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("updateUserProfile", () => {
		it("patches /users/me and returns the mapped user", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(200, userResponse),
			);

			const result = await updateUserProfile({
				full_name: "Jane Doe",
				email: "jane@example.com",
			});

			expect(result).toEqual({
				ok: true,
				data: {
					id: "user-1",
					username: "jdoe",
					email: "jane@example.com",
					full_name: "Jane Doe",
					is_active: true,
					created_at: "2024-01-01T00:00:00Z",
					profile_picture_url: "https://cdn.example.com/avatar.png",
					avatar: "https://cdn.example.com/avatar.png",
				},
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/users/me");
			expect(init.method).toBe("PATCH");
			expect(JSON.parse(init.body as string)).toEqual({
				full_name: "Jane Doe",
				email: "jane@example.com",
			});
		});

		it("accepts an avatar-only update and drops the empty url", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(200, userResponse),
			);

			await updateUserProfile({
				profile_picture_url: "https://cdn.example.com/avatar.png",
			});
			expect(JSON.parse(callOf()[1].body as string)).toEqual({
				profile_picture_url: "https://cdn.example.com/avatar.png",
			});

			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(200, userResponse),
			);
			await updateUserProfile({
				full_name: "Jane Doe",
				email: "jane@example.com",
				profile_picture_url: "",
			});
			expect(JSON.parse(callOf(1)[1].body as string)).toEqual({
				full_name: "Jane Doe",
				email: "jane@example.com",
			});
		});

		it("rejects invalid input with field errors and no backend call", async () => {
			const result = await updateUserProfile({
				full_name: "Jane Doe",
				email: "not-an-email",
			});

			expect(result).toEqual({
				ok: false,
				status: 422,
				fieldErrors: ["Invalid email address"],
			});
			expect(mockServerFetchWithAuth).not.toHaveBeenCalled();
		});

		it("returns the backend detail instead of throwing", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(400, { detail: "Email already registered" }),
			);

			await expect(
				updateUserProfile({ email: "taken@example.com" }),
			).resolves.toEqual({
				ok: false,
				status: 400,
				detail: "Email already registered",
			});
		});

		it("maps an unreachable backend to a network failure", async () => {
			mockServerFetchWithAuth.mockRejectedValueOnce(new Error("ECONNREFUSED"));

			await expect(
				updateUserProfile({ email: "jane@example.com" }),
			).resolves.toEqual({
				ok: false,
				status: 0,
				detail: ACTION_NETWORK_ERROR_MESSAGE,
			});
		});
	});

	describe("deleteUserAccount", () => {
		it("deletes /users/me through the server", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(emptyResponse());

			await expect(deleteUserAccount()).resolves.toEqual({
				ok: true,
				data: null,
			});

			const [endpoint, init] = callOf();
			expect(endpoint).toBe("/users/me");
			expect(init.method).toBe("DELETE");
		});

		it("returns a typed failure instead of throwing", async () => {
			mockServerFetchWithAuth.mockResolvedValueOnce(
				jsonResponse(500, { detail: "boom" }),
			);

			await expect(deleteUserAccount()).resolves.toEqual({
				ok: false,
				status: 500,
				detail: "boom",
			});
		});
	});
});
