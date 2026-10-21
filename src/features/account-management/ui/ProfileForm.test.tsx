import { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./ProfileForm";
import type { User } from "@fsd/entities/user";

const mockUser: User = {
	id: "user-1",
	username: "jdoe",
	email: "jane@example.com",
	full_name: "Jane Doe",
	is_active: true,
	created_at: "2024-01-01T00:00:00Z",
};

describe("ProfileForm", () => {
	let updateProfile: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		updateProfile = vi.fn().mockResolvedValue(undefined);
	});

	it("renders form pre-filled with current user data", () => {
		const ref = createRef<HTMLFormElement>();
		render(<ProfileForm ref={ref} user={mockUser} updateProfile={updateProfile} />);

		expect(
			(screen.getByPlaceholderText("Your full name") as HTMLInputElement).value,
		).toBe("Jane Doe");
		expect(
			(screen.getByPlaceholderText("you@example.com") as HTMLInputElement).value,
		).toBe("jane@example.com");
	});

	it("shows validation error when full_name is empty on submit", async () => {
		const user = userEvent.setup();
		const ref = createRef<HTMLFormElement>();
		render(<ProfileForm ref={ref} user={mockUser} updateProfile={updateProfile} />);

		const nameInput = screen.getByPlaceholderText("Your full name");
		await user.clear(nameInput);
		ref.current?.requestSubmit();

		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});
		expect(updateProfile).not.toHaveBeenCalled();
	});

	it("shows validation error on invalid email", async () => {
		const user = userEvent.setup();
		const ref = createRef<HTMLFormElement>();
		render(<ProfileForm ref={ref} user={mockUser} updateProfile={updateProfile} />);

		const emailInput = screen.getByPlaceholderText("you@example.com");
		await user.clear(emailInput);
		await user.type(emailInput, "not-an-email");
		ref.current?.requestSubmit();

		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});
		expect(updateProfile).not.toHaveBeenCalled();
	});

	it("calls updateProfile with correct data on valid submit", async () => {
		const user = userEvent.setup();
		const ref = createRef<HTMLFormElement>();
		render(<ProfileForm ref={ref} user={mockUser} updateProfile={updateProfile} />);

		const nameInput = screen.getByPlaceholderText("Your full name");
		await user.clear(nameInput);
		await user.type(nameInput, "John Doe");
		ref.current?.requestSubmit();

		await waitFor(() => {
			expect(updateProfile).toHaveBeenCalledWith(
				expect.objectContaining({
					full_name: "John Doe",
					email: "jane@example.com",
				}),
			);
		});
	});
});
