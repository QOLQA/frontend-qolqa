"use client";

import { useState, useEffect } from "react";
import { getUserMe } from "@fsd/entities/user/api/getUserMe";
import { updateUserMe } from "@fsd/entities/user/api/updateUserMe";
import { deleteUserMe } from "@fsd/entities/user/api/deleteUserMe";
import { uploadImage } from "@fsd/shared/lib/image/uploadImage";
import type { User, UserUpdateRequest } from "@fsd/entities/user";

interface UseUserProfileOptions {
	/** The current authenticated user's id — used as public_id for avatar upload. */
	userId?: string;
	/** Called after a successful deleteAccount() — typically clears the auth session. */
	onAccountDeleted: () => void;
}

interface UseUserProfileReturn {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	updateProfile: (data: UserUpdateRequest) => Promise<void>;
	uploadAvatar: (file: File) => Promise<string>;
	deleteAccount: () => Promise<void>;
}

export function useUserProfile({
	userId,
	onAccountDeleted,
}: UseUserProfileOptions): UseUserProfileReturn {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshUser = async () => {
		try {
			const fresh = await getUserMe();
			setUser(fresh);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load profile");
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		setIsLoading(true);
		refreshUser().finally(() => setIsLoading(false));
	}, []); // intentional: load once on mount; refreshUser is a stable local fn

	const updateProfile = async (data: UserUpdateRequest): Promise<void> => {
		setError(null);
		try {
			await updateUserMe(data);
			await refreshUser();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to update profile";
			setError(message);
			throw err;
		}
	};

	const uploadAvatar = async (file: File): Promise<string> => {
		setError(null);
		try {
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result !== "string") {
						reject(new Error("Unexpected FileReader result type"));
						return;
					}
					resolve(reader.result);
				};
				reader.onerror = () => reject(new Error("Failed to read file"));
				reader.readAsDataURL(file);
			});

			const publicId = userId ?? "avatar";
			const secureUrl = await uploadImage(dataUrl, publicId);
			return secureUrl;
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to upload avatar";
			setError(message);
			throw err;
		}
	};

	const deleteAccount = async (): Promise<void> => {
		setError(null);
		try {
			await deleteUserMe();
			onAccountDeleted();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to delete account";
			setError(message);
			throw err;
		}
	};

	return { user, isLoading, error, updateProfile, uploadAvatar, deleteAccount };
}
