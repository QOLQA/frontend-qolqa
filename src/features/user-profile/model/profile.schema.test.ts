import { describe, expect, it } from "vitest";
import { ProfileFormSchema } from "./profile.schema";

describe("ProfileFormSchema", () => {
	it("valid full data passes", () => {
		const result = ProfileFormSchema.safeParse({
			full_name: "John Doe",
			email: "john@example.com",
			profile_picture_url: "https://example.com/avatar.jpg",
		});

		expect(result.success).toBe(true);
	});

	it("empty full_name fails", () => {
		const result = ProfileFormSchema.safeParse({
			full_name: "",
			email: "john@example.com",
		});

		expect(result.success).toBe(false);
	});

	it("invalid email fails", () => {
		const result = ProfileFormSchema.safeParse({
			full_name: "John Doe",
			email: "not-an-email",
		});

		expect(result.success).toBe(false);
	});

	it("optional profile_picture_url passes when absent", () => {
		const result = ProfileFormSchema.safeParse({
			full_name: "John Doe",
			email: "john@example.com",
		});

		expect(result.success).toBe(true);
	});

	it("invalid URL for profile_picture_url fails when present", () => {
		const result = ProfileFormSchema.safeParse({
			full_name: "John Doe",
			email: "john@example.com",
			profile_picture_url: "not-a-url",
		});

		expect(result.success).toBe(false);
	});
});
