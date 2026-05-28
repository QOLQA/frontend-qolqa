"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@fsd/shared/ui/button";
import {
	ProfileFormSchema,
	type ProfileFormValues,
} from "@fsd/features/user-profile/model/profile.schema";
import type { User, UserUpdateRequest } from "@fsd/entities/user";
import { cn } from "@fsd/shared/lib/classnames";

interface ProfileFormProps {
	user: User | null;
	updateProfile: (data: UserUpdateRequest) => Promise<void>;
}

export function ProfileForm({ user, updateProfile }: ProfileFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileFormSchema),
		values: {
			full_name: user?.full_name ?? "",
			email: user?.email ?? "",
			profile_picture_url: user?.profile_picture_url ?? "",
		},
	});

	const onSubmit = async (values: ProfileFormValues) => {
		setIsSubmitting(true);
		setSuccessMessage(null);
		setErrorMessage(null);
		try {
			await updateProfile({
				full_name: values.full_name,
				email: values.email,
				profile_picture_url: values.profile_picture_url || undefined,
			});
			setSuccessMessage("Profile updated successfully.");
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : "Failed to update profile.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			{/* Full name */}
			<div className="flex flex-col gap-1">
				<label htmlFor="full_name" className="text-secondary-white text-p">
					Full name
				</label>
				<input
					id="full_name"
					type="text"
					placeholder="Your full name"
					disabled={isSubmitting}
					{...register("full_name")}
					className={cn(
						"w-full py-2 px-5 border rounded-md bg-terciary-gray text-white focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
						errors.full_name ? "border-red" : "border-gray",
					)}
				/>
				{errors.full_name && (
					<p className="text-xs text-red" role="alert">
						{errors.full_name.message}
					</p>
				)}
			</div>

			{/* Email */}
			<div className="flex flex-col gap-1">
				<label htmlFor="email" className="text-secondary-white text-p">
					Email
				</label>
				<input
					id="email"
					type="email"
					placeholder="you@example.com"
					disabled={isSubmitting}
					{...register("email")}
					className={cn(
						"w-full py-2 px-5 border rounded-md bg-terciary-gray text-white focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
						errors.email ? "border-red" : "border-gray",
					)}
				/>
				{errors.email && (
					<p className="text-xs text-red" role="alert">
						{errors.email.message}
					</p>
				)}
			</div>

			{/* Feedback */}
			{successMessage && (
				<p className="text-xs text-green" role="status">
					{successMessage}
				</p>
			)}
			{errorMessage && (
				<p className="text-xs text-red" role="alert">
					{errorMessage}
				</p>
			)}

			<Button
				type="submit"
				variant="outline"
				disabled={isSubmitting}
				className="w-full cursor-pointer text-h3 text-white !bg-green border-none hover:!bg-green-dark hover:!text-white disabled:opacity-50"
			>
				{isSubmitting ? "Saving…" : "Save changes"}
			</Button>
		</form>
	);
}
