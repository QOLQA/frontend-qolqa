"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@fsd/shared/ui/button";
import { Input } from "@fsd/shared/ui/input";
import { Modal } from "@fsd/shared/ui/modal";
import {
	Select,
	SelectValue,
	SelectItem,
	SelectGroup,
	SelectContent,
	SelectLabel,
	SelectTrigger,
} from "@fsd/shared/ui/select";
import { Trash } from "lucide-react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

type TableAttribute = {
	id: string;
	name: string;
	type: string;
	ableToEdit: boolean;
};

interface ModalAttributesProps {
	onSubmit: (newAttributes: TableAttribute[], typeModal: "create" | "update") => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	type?: "create" | "update";
	attributesToUpdate?: TableAttribute[];
}

const types = [
	{ value: "string", label: "string" },
	{ value: "integer", label: "integer" },
	{ value: "double", label: "double" },
	{ value: "boolean", label: "boolean" },
	{ value: "date", label: "date" },
	{ value: "array", label: "array[]" },
];

const tableAttributeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	ableToEdit: z.boolean(),
});

const attributesSchema = z.object({
	attributes: z.array(tableAttributeSchema),
});

type AttributesFormValues = z.infer<typeof attributesSchema>;

export function ModalAttributes({
	onSubmit,
	open,
	setOpen,
	type = "create",
	attributesToUpdate,
}: ModalAttributesProps) {
	const { t } = useTranslation();
	const { register, control, handleSubmit, reset, watch, setValue } =
		useForm<AttributesFormValues>({
			resolver: zodResolver(attributesSchema),
			defaultValues: {
				attributes:
					type === "update" && attributesToUpdate
						? attributesToUpdate
						: [{ id: "", name: "", type: types[0].value, ableToEdit: true }],
			},
		});

	const { fields, append, remove } = useFieldArray({ control, name: "attributes" });
	const watchedAttributes = watch("attributes");

	useEffect(() => {
		if (type === "update" && attributesToUpdate) {
			reset({ attributes: attributesToUpdate });
		} else if (type === "create") {
			reset({
				attributes: [{ id: "", name: "", type: types[0].value, ableToEdit: true }],
			});
		}
	}, [type, attributesToUpdate, reset]);

	const modalTitle =
		type === "create" ? t("modals.attributes.addTitle") : t("modals.attributes.editTitle");

	const onFormSubmit = (data: AttributesFormValues) => {
		onSubmit(data.attributes, type);
		setOpen(false);
	};

	return (
		<Modal
			title={modalTitle}
			onSubmit={handleSubmit(onFormSubmit)}
			open={open}
			setOpen={setOpen}
			type={type}
		>
			<div className="flex flex-col gap-2">
				{fields.map((field, index) => {
					if (!field.ableToEdit) return null;
					return (
						<div key={field.id} className="flex items-center gap-6 mb-2">
							<Input
								placeholder={t("modals.attributes.namePlaceholder")}
								{...register(`attributes.${index}.name`)}
								className="w-1/2"
							/>

							<Select
								value={watchedAttributes?.[index]?.type ?? types[0].value}
								onValueChange={(value) =>
									setValue(`attributes.${index}.type`, value)
								}
							>
								<SelectTrigger className="w-1/2">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Type</SelectLabel>
										{types.map((typeOption) => (
											<SelectItem key={typeOption.value} value={typeOption.value}>
												{typeOption.label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>

							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => remove(index)}
								className="group cursor-pointer"
							>
								<Trash className="text-gray-400 group-hover:text-red-500 transition-colors size-4" />
							</Button>
						</div>
					);
				})}
				{type === "create" && (
					<div className="flex justify-center w-full border-dashed border-2 border-gray rounded-lg p-3">
						<Button
							type="button"
							className="cursor-pointer py-[2px] hover:bg-gray bg-transparent rounded-lg text-secondary-white border border-gray"
							onClick={() =>
								append({ id: "", name: "", type: types[0].value, ableToEdit: true })
							}
						>
							{t("other.newAttribute")}
						</Button>
					</div>
				)}
			</div>
		</Modal>
	);
}
