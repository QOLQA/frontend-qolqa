"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@fsd/shared/ui/dialog";
import { Skeleton } from "@fsd/shared/ui/skeleton";
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Profile settings</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-4 py-2">
						<div className="flex justify-center">
							<Skeleton className="size-20 rounded-full" />
						</div>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
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
			</DialogContent>
		</Dialog>
	);
}
