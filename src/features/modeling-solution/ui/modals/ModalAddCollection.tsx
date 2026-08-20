"use client";

import { type KeyboardEvent, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@fsd/shared/ui/modal";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

const schema = z.object({
	name: z.string().trim().min(4),
});
type FormValues = z.infer<typeof schema>;

interface ModalAddCollectionProps {
	onSubmit: (name: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function ModalAddCollection({ onSubmit, open, setOpen }: ModalAddCollectionProps) {
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

	const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !isPending) {
			e.preventDefault();
			const isValid = await handleSubmit();
			if (isValid) setOpen(false);
		}
	};

	return (
		<Modal
			title={t("modals.createCollection.title")}
			onSubmit={handleSubmit}
			open={open}
			setOpen={setOpen}
		>
			<>
				<div className="flex flex-col gap-1">
					<div className="flex justify-between items-center gap-4">
						<label htmlFor="collection-name" className="text-secondary-white shrink-0">
							{t("modals.createCollection.nameLabel")}
						</label>
						<input
							type="text"
							id="collection-name"
							{...register("name")}
							onKeyDown={handleKeyDown}
							disabled={isPending}
							aria-describedby={errors.name ? "collection-name-error" : undefined}
							className="w-full py-2 px-5 border border-gray rounded-md bg-terciary-gray focus:ring-2 focus:ring-white dark:focus:ring-blue focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
					{errors.name?.type === "too_small" && (
						<p id="collection-name-error" className="text-sm text-red-400 text-right">
							{t("modals.createCollection.nameTooShort")}
						</p>
					)}
				</div>
				{isPending && (
					<div className="mt-4 text-center text-sm text-gray-400">
						{t("modals.createCollection.creating")}
					</div>
				)}
			</>
		</Modal>
	);
}
