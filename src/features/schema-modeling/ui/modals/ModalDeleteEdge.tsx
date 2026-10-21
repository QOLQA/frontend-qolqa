"use client";

import { Modal } from "@fsd/shared/ui/modal";
import { AlertTriangle } from "lucide-react";
import { useTransition } from "react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { useReactFlow } from "@xyflow/react";

interface ModalDeleteEdgeProps {
	isOpen: boolean;
	onClose: () => void;
	edgeId: string;
}

export function ModalDeleteEdge({
	isOpen,
	onClose,
	edgeId,
}: ModalDeleteEdgeProps) {
	const { t } = useTranslation();
	const [isPending, startTransition] = useTransition();
	const { deleteElements } = useReactFlow();

	const handleConfirm = () => {
		startTransition(async () => {
			deleteElements({ edges: [{ id: edgeId }] });
			onClose();
		});
	};

	return (
		<Modal
			title={t("modals.deleteEdge.title")}
			open={isOpen}
			setOpen={onClose}
			onSubmit={handleConfirm}
			type="delete"
		>
			<>
				<div className="my-4 flex items-start gap-4">
					<AlertTriangle className="text-red shrink-0 size-10 mt-0.5 mr-2" />
					<div className="flex-1">
						<p className="text-white text-h5">
							{t("modals.deleteEdge.confirmMessage")}
						</p>
						<p className="text-red text-p mt-2">
							{t("modals.deleteEdge.irreversibleAction")}
						</p>
					</div>
				</div>
				{isPending && (
					<div className="mt-4 text-center text-sm text-gray-400">
						{t("common.loading")}
					</div>
				)}
			</>
		</Modal>
	);
}
