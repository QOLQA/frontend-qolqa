import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const {
	mockGetUserMe,
	mockUpdateUserProfile,
	mockDeleteUserAccount,
	mockOnAccountDeleted,
	mockOnProfileUpdated,
} = vi.hoisted(() => ({
	mockGetUserMe: vi.fn(),
	mockUpdateUserProfile: vi.fn(),
	mockDeleteUserAccount: vi.fn(),
	mockOnAccountDeleted: vi.fn(),
	mockOnProfileUpdated: vi.fn(),
}));

vi.mock("@fsd/entities/user/api/getUserMe", () => ({
	getUserMe: mockGetUserMe,
}));

vi.mock("./actions", () => ({
	updateUserProfile: mockUpdateUserProfile,
	deleteUserAccount: mockDeleteUserAccount,
}));

import { useUserProfile } from "./use-user-profile";
import type { User } from "@fsd/entities/user";

const currentUser: User = {
	id: "user-1",
	username: "jdoe",
	email: "jane@example.com",
	full_name: "Jane Doe",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

const updatedUser: User = {
	...currentUser,
	email: "janet@example.com",
};

const renderProfile = () =>
	renderHook(() =>
		useUserProfile({
			userId: "user-1",
			onAccountDeleted: mockOnAccountDeleted,
			onProfileUpdated: mockOnProfileUpdated,
		}),
	);

const renderReadyProfile = async () => {
	const rendered = renderProfile();
	await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
	return rendered;
};

describe("useUserProfile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUserMe.mockResolvedValue(currentUser);
		mockOnProfileUpdated.mockResolvedValue(undefined);
	});

	it("loads the current profile on mount", async () => {
		const { result } = await renderReadyProfile();

		expect(mockGetUserMe).toHaveBeenCalledTimes(1);
		expect(result.current.user).toEqual(currentUser);
	});

	it("updates the profile through the server action and refreshes the consumer", async () => {
		mockUpdateUserProfile.mockResolvedValueOnce({
			ok: true,
			data: updatedUser,
		});
		const { result } = await renderReadyProfile();

		await act(async () => {
			await result.current.updateProfile({ email: "janet@example.com" });
		});

		expect(mockUpdateUserProfile).toHaveBeenCalledWith({
			email: "janet@example.com",
		});
		expect(mockOnProfileUpdated).toHaveBeenCalledTimes(1);
		expect(result.current.user?.email).toBe("janet@example.com");
		expect(result.current.error).toBeNull();
	});

	it("surfaces the action failure detail and rethrows for the form", async () => {
		mockUpdateUserProfile.mockResolvedValueOnce({
			ok: false,
			status: 400,
			detail: "Email already registered",
		});
		const { result } = await renderReadyProfile();

		await act(async () => {
			await expect(
				result.current.updateProfile({ email: "taken@example.com" }),
			).rejects.toThrow("Email already registered");
		});

		expect(result.current.error).toBe("Email already registered");
		expect(mockOnProfileUpdated).not.toHaveBeenCalled();
	});

	it("deletes the account through the server action then clears the session", async () => {
		mockDeleteUserAccount.mockResolvedValueOnce({ ok: true, data: null });
		const { result } = await renderReadyProfile();

		await act(async () => {
			await result.current.deleteAccount();
		});

		expect(mockDeleteUserAccount).toHaveBeenCalledTimes(1);
		expect(mockOnAccountDeleted).toHaveBeenCalledTimes(1);
	});

	it("keeps the session when the delete action fails", async () => {
		mockDeleteUserAccount.mockResolvedValueOnce({
			ok: false,
			status: 500,
			detail: "boom",
		});
		const { result } = await renderReadyProfile();

		await act(async () => {
			await expect(result.current.deleteAccount()).rejects.toThrow("boom");
		});

		expect(mockOnAccountDeleted).not.toHaveBeenCalled();
		expect(result.current.error).toBe("boom");
	});
});
