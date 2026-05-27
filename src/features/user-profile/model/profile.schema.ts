import { z } from "zod";

export const ProfileFormSchema = z.object({
	full_name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	email: z.string().email("Invalid email address"),
	profile_picture_url: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
