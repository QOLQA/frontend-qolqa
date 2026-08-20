"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@fsd/shared/ui/modal";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

const schema = z.object({
	name: z.string().trim().min(4),
});
type FormValues = z.infer<typeof schema>;

interface AddProjectModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSubmit: (name: string) => Promise<void>;
}

export function AddProjectModal({ open, setOpen, onSubmit }: AddProjectModalProps) {
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
			startTransition(async () => {
				await onSubmit(data.name);
				reset();
			});
		})();
		return submitted;
	};

	return (
		<Modal
			title={t("modals.addProject.title")}
			open={open}
			setOpen={setOpen}
			onSubmit={handleSubmit}
			type="create"
		>
			<>
				<div className="my-13 flex flex-col gap-1">
					<div className="flex justify-between items-center gap-4">
						<label htmlFor="project-name" className="text-secondary-white shrink-0">
							{t("modals.addProject.nameLabel")}
						</label>
						<input
							type="text"
							id="project-name"
							{...register("name")}
							disabled={isPending}
							aria-describedby={errors.name ? "project-name-error" : undefined}
							className="w-full py-2 px-5 border border-gray rounded-md bg-terciary-gray focus:ring-2 focus:ring-white dark:focus:ring-blue focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
					{errors.name?.type === "too_small" && (
						<p id="project-name-error" className="text-sm text-red-400 text-right">
							{t("modals.addProject.nameTooShort")}
						</p>
					)}
				</div>
				{isPending && (
					<div className="mt-4 text-center text-sm text-gray-400">
						{t("modals.addProject.creating")}
					</div>
				)}
			</>
		</Modal>
	);
}
