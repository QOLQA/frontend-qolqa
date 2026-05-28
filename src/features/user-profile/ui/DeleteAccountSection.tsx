"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@fsd/shared/ui/modal";
import { Button } from "@fsd/shared/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountSectionProps {
	deleteAccount: () => Promise<void>;
}

export function DeleteAccountSection({
	deleteAccount,
}: DeleteAccountSectionProps) {
	const router = useRouter();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await deleteAccount();
			router.push("/login");
		} finally {
			setIsDeleting(false);
			setConfirmOpen(false);
		}
	};

	return (
		<>
			<div className="border-t border-gray pt-6">
				<p className="mb-3 text-p font-medium text-red">Danger zone</p>
				<Button
					variant="outline"
					disabled={isDeleting}
					onClick={() => setConfirmOpen(true)}
					className="cursor-pointer text-h3 text-white !bg-red border-none hover:!bg-red-dark hover:!text-white disabled:opacity-50"
				>
					Delete account
				</Button>
			</div>

			<Modal
				title="Delete account"
				open={confirmOpen}
				setOpen={setConfirmOpen}
				onSubmit={handleConfirm}
				type="delete"
			>
				<div className="my-4 flex items-start gap-4">
					<AlertTriangle className="text-red shrink-0 size-10 mt-0.5 mr-2" />
					<div className="flex-1">
						<p className="text-white text-h5">
							Are you sure you want to delete your account?
						</p>
						<p className="text-red text-p mt-2">
							This action cannot be undone. Your account will be permanently deleted.
						</p>
					</div>
				</div>
			</Modal>
		</>
	);
}
