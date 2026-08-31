"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@fsd/shared/ui/modal";
import { Input } from "@fsd/shared/ui/input";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

const schema = z.object({
	name: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;

interface ModalDocumentProps {
	onSubmit: (name: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function ModalDocument({ onSubmit, open, setOpen }: ModalDocumentProps) {
	const { t } = useTranslation();
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit: rhfHandleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	useEffect(() => {
		if (!open) reset();
	}, [open, reset]);

	const handleSubmit = async (): Promise<boolean> => {
		let submitted = false;
		await rhfHandleSubmit((data) => {
			submitted = true;
			startTransition(() => {
				onSubmit(data.name);
				reset();
			});
		})();
		return submitted;
	};

	return (
		<Modal
			title={t("modals.document.createTitle")}
			onSubmit={handleSubmit}
			open={open}
			setOpen={setOpen}
		>
			<div className="my-4 flex flex-col gap-1">
				<div className="flex justify-between items-center gap-4">
					<label htmlFor="document-name" className="text-secondary-white shrink-0">
						{t("modals.document.nameLabel")}
					</label>
					<Input
						type="text"
						id="document-name"
						{...register("name")}
						disabled={isPending}
						aria-describedby={errors.name ? "document-name-error" : undefined}
						className="w-full py-2 px-5 border border-gray rounded-md bg-terciary-gray focus:ring-2 focus:ring-white dark:focus:ring-blue focus:outline-none text-white"
					/>
				</div>
				{errors.name && (
					<p id="document-name-error" className="text-sm text-red-400 text-right">
						{t("modals.document.nameRequired")}
					</p>
				)}
			</div>
		</Modal>
	);
}
