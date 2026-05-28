"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@fsd/shared/ui/alert-dialog";
import { Button } from "@fsd/shared/ui/button";

interface DeleteAccountSectionProps {
	deleteAccount: () => Promise<void>;
}

export function DeleteAccountSection({
	deleteAccount,
}: DeleteAccountSectionProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await deleteAccount();
			router.push("/login");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="border-t border-destructive/20 pt-6">
			<p className="mb-3 text-sm font-medium text-destructive">Danger zone</p>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive" disabled={isDeleting}>
						{isDeleting ? "Deleting…" : "Delete account"}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. Your account will be permanently
							deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting…" : "Yes, delete my account"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
