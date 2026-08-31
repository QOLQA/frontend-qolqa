import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvatarUpload } from "./AvatarUpload";
import type { User } from "@fsd/entities/user";

const mockUser: User = {
	id: "user-1",
	username: "jdoe",
	email: "jane@example.com",
	full_name: "Jane Doe",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

describe("AvatarUpload", () => {
	let uploadAvatar: ReturnType<typeof vi.fn>;
	let updateProfile: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		uploadAvatar = vi.fn().mockResolvedValue("https://example.com/avatar.jpg");
		updateProfile = vi.fn().mockResolvedValue(undefined);
	});

	it("renders upload button with avatar", () => {
		render(
			<AvatarUpload
				user={mockUser}
				uploadAvatar={uploadAvatar}
				updateProfile={updateProfile}
			/>,
		);

		expect(
			screen.getByRole("button", { name: /upload profile picture/i }),
		).toBeInTheDocument();
	});

	it("uses theme-aware foreground color for overlays instead of hardcoded black", () => {
		const { container } = render(
			<AvatarUpload
				user={mockUser}
				uploadAvatar={uploadAvatar}
				updateProfile={updateProfile}
			/>,
		);

		// The overlays should use bg-foreground (theme-aware), not bg-black
		const overlays = container.querySelectorAll(".absolute.inset-0");
		expect(overlays.length).toBeGreaterThanOrEqual(1);

		for (const overlay of overlays) {
			expect(overlay.className).not.toContain("bg-black");
			expect(overlay.className).toContain("bg-foreground");
		}
	});

	it("shows edit label on hover overlay", () => {
		render(
			<AvatarUpload
				user={mockUser}
				uploadAvatar={uploadAvatar}
				updateProfile={updateProfile}
			/>,
		);

		expect(screen.getByText("Edit")).toBeInTheDocument();
	});

	it("does not use hardcoded hex color classes", () => {
		const { container } = render(
			<AvatarUpload
				user={mockUser}
				uploadAvatar={uploadAvatar}
				updateProfile={updateProfile}
			/>,
		);

		// Scan all elements for hardcoded hex in class names
		const allElements = container.querySelectorAll("*");
		for (const el of allElements) {
			const cls = el.getAttribute("className") || "";
			expect(cls).not.toMatch(/bg-\[#[0-9a-fA-F]+\]/);
			expect(cls).not.toMatch(/text-\[#[0-9a-fA-F]+\]/);
			expect(cls).not.toMatch(/border-\[#[0-9a-fA-F]+\]/);
		}
	});
});
