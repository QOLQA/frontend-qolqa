"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ProfileFormSchema,
	type ProfileFormValues,
} from "@fsd/features/user-profile/model/profile.schema";
import type { User, UserUpdateRequest } from "@fsd/entities/user";
import { Input } from "@fsd/shared/ui/input";
import { Label } from "@fsd/shared/ui/label";
import { cn } from "@fsd/shared/lib/classnames";

interface ProfileFormProps {
	ref?: React.Ref<HTMLFormElement>;
	user: User | null;
	updateProfile: (data: UserUpdateRequest) => Promise<void>;
}

export function ProfileForm({ ref, user, updateProfile }: ProfileFormProps) {
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
		}
	};

	return (
		<form ref={ref} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			{/* Full name */}
			<div className="flex flex-col gap-1">
				<Label htmlFor="full_name">Full name</Label>
				<Input
					id="full_name"
					type="text"
					placeholder="Your full name"
					{...register("full_name")}
					className={cn(errors.full_name && "border-red")}
				/>
				{errors.full_name && (
					<p className="text-xs text-red" role="alert">
						{errors.full_name.message}
					</p>
				)}
			</div>

			{/* Email */}
			<div className="flex flex-col gap-1">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					{...register("email")}
					className={cn(errors.email && "border-red")}
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
		</form>
	);
}
