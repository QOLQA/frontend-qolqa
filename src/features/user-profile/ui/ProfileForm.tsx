"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@fsd/shared/ui/form";
import { Input } from "@fsd/shared/ui/input";
import { Button } from "@fsd/shared/ui/button";
import {
	ProfileFormSchema,
	type ProfileFormValues,
} from "@fsd/features/user-profile/model/profile.schema";
import type { User, UserUpdateRequest } from "@fsd/entities/user";

interface ProfileFormProps {
	user: User | null;
	updateProfile: (data: UserUpdateRequest) => Promise<void>;
}

export function ProfileForm({ user, updateProfile }: ProfileFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileFormSchema),
		values: {
			full_name: user?.full_name ?? "",
			email: user?.email ?? "",
			profile_picture_url: user?.profile_picture_url ?? "",
		},
	});

	const onSubmit = async (values: ProfileFormValues) => {
		setIsSubmitting(true);
		try {
			await updateProfile({
				full_name: values.full_name,
				email: values.email,
				profile_picture_url: values.profile_picture_url || undefined,
			});
			toast.success("Profile updated successfully.");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to update profile.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
				<FormField
					control={form.control}
					name="full_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full name</FormLabel>
							<FormControl>
								<Input
									placeholder="Your full name"
									disabled={isSubmitting}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="you@example.com"
									disabled={isSubmitting}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting} className="w-full">
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</form>
		</Form>
	);
}
