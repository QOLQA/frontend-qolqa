"use client";

import { useRef, useState } from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@fsd/shared/ui/avatar";
import { cn } from "@fsd/shared/lib/classnames";
import { getInitials } from "@fsd/shared/lib/initials";
import type { User, UserUpdateRequest } from "@fsd/entities/user";

interface AvatarUploadProps {
	user: User | null;
	uploadAvatar: (file: File) => Promise<string>;
	updateProfile: (data: UserUpdateRequest) => Promise<void>;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function AvatarUpload({
	user,
	uploadAvatar,
	updateProfile,
}: AvatarUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const processFile = async (file: File) => {
		setUploadError(null);

		if (!ACCEPTED_TYPES.includes(file.type)) {
			setUploadError("Only JPEG, PNG, and WebP images are allowed.");
			return;
		}
		if (file.size > MAX_SIZE_BYTES) {
			setUploadError("Image must be smaller than 5 MB.");
			return;
		}

		setIsUploading(true);
		try {
			const url = await uploadAvatar(file);
			await updateProfile({ profile_picture_url: url });
		} catch {
			setUploadError("Upload failed. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
		// Reset so the same file can be re-selected
		e.target.value = "";
	};

	const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	};

	const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => setIsDragging(false);

	const avatarSrc = user?.profile_picture_url ?? user?.avatar;

	return (
		<div className="flex flex-col items-center gap-2">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				disabled={isUploading}
				aria-label="Upload profile picture"
				className={cn(
					"relative cursor-pointer rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					isUploading && "cursor-not-allowed opacity-60",
					isDragging && "ring-2 ring-ring",
				)}
			>
				<Avatar className="size-28">
					<AvatarImage src={avatarSrc} alt={user?.full_name ?? user?.username} />
					<AvatarFallback className="text-lg">{getInitials(user?.full_name ?? user?.username ?? "")}</AvatarFallback>
				</Avatar>

				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
						<div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
					</div>
				)}

				{!isUploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100">
						<span className="text-xs font-medium text-white">Edit</span>
					</div>
				)}
			</button>

			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				className="hidden"
				onChange={handleInputChange}
				aria-hidden="true"
				tabIndex={-1}
			/>

			{uploadError && (
				<p className="text-xs text-destructive" role="alert">
					{uploadError}
				</p>
			)}
		</div>
	);
}
