"use client";

import { Modal } from "@fsd/shared/ui/modal";
import { useUserProfile } from "@fsd/features/user-profile/model/use-user-profile";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";
import { DeleteAccountSection } from "./DeleteAccountSection";

interface UserProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	onProfileUpdated?: () => Promise<void>;
	onAccountDeleted?: () => void;
}

export function UserProfileDialog({
	open,
	onOpenChange,
	userId,
	onProfileUpdated,
	onAccountDeleted,
}: UserProfileDialogProps) {
	const { user, isLoading, updateProfile, uploadAvatar, deleteAccount } =
		useUserProfile({
			userId,
			onAccountDeleted: onAccountDeleted ?? (() => {}),
			onProfileUpdated,
		});

	return (
		<Modal title="Profile settings" open={open} setOpen={onOpenChange} showCloseButton>
			<>
				{isLoading ? (
					<div className="space-y-4 py-2">
						<div className="flex justify-center">
							<div className="size-20 rounded-full bg-gray animate-pulse" />
						</div>
						<div className="h-10 w-full rounded-md bg-gray animate-pulse" />
						<div className="h-10 w-full rounded-md bg-gray animate-pulse" />
					</div>
				) : (
					<div className="space-y-6 py-2">
						<div className="flex justify-center">
							<AvatarUpload
								user={user}
								uploadAvatar={uploadAvatar}
								updateProfile={updateProfile}
							/>
						</div>

						<ProfileForm user={user} updateProfile={updateProfile} />

						<DeleteAccountSection deleteAccount={deleteAccount} />
					</div>
				)}
			</>
		</Modal>
	);
}
