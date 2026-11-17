import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { Modal } from "./modal";

vi.mock("@fsd/shared/i18n/use-translation", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const dialogPrototype = HTMLDialogElement.prototype;
const originalShowModal = Object.getOwnPropertyDescriptor(dialogPrototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, "close");

beforeAll(() => {
	Object.defineProperty(dialogPrototype, "showModal", {
		configurable: true,
		value(this: HTMLDialogElement) { this.setAttribute("open", ""); },
	});
	Object.defineProperty(dialogPrototype, "close", {
		configurable: true,
		value(this: HTMLDialogElement) { this.removeAttribute("open"); },
	});
});

afterEach(cleanup);

afterAll(() => {
	if (originalShowModal) Object.defineProperty(dialogPrototype, "showModal", originalShowModal);
	else Reflect.deleteProperty(dialogPrototype, "showModal");
	if (originalClose) Object.defineProperty(dialogPrototype, "close", originalClose);
	else Reflect.deleteProperty(dialogPrototype, "close");
});

describe("Modal", () => {
	it.each([false, true])("omits the portal during server rendering with open=%s", (open) => {
		expect(renderToString(
			<Modal title="New collection" open={open} setOpen={vi.fn()}>
				Collection name
			</Modal>,
		)).toBe("");
	});

	it("hydrates server markup and opens an initially open modal", async () => {
		const modal = (
			<Modal title="New collection" open setOpen={vi.fn()}>
				Collection name
			</Modal>
		);
		const container = document.createElement("div");
		container.innerHTML = renderToString(modal);
		document.body.appendChild(container);
		const onRecoverableError = vi.fn();
		const root = hydrateRoot(container, modal, { onRecoverableError });
		try {
			await act(async () => {});
			expect(screen.getByRole("dialog")).toHaveTextContent("Collection name");
			expect(screen.getByRole("dialog").parentElement).toBe(document.body);
			expect(onRecoverableError).not.toHaveBeenCalled();
		} finally {
			await act(async () => root.unmount());
			container.remove();
		}
	});

	it("opens and closes while preserving the mounted input", () => {
		const modal = (open: boolean) => (
			<Modal title="New collection" open={open} setOpen={vi.fn()}>
				<input aria-label="Collection name" defaultValue="Customers" />
			</Modal>
		);
		const { rerender } = render(modal(false));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		rerender(modal(true));
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		const input = screen.getByLabelText("Collection name");
		rerender(modal(false));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		rerender(modal(true));
		expect(screen.getByLabelText("Collection name")).toBe(input);
	});
	describe("Enter key", () => {
		const renderWithField = (field: "input" | "textarea") => {
			const onSubmit = vi.fn();
			render(
				<Modal title="New collection" open setOpen={vi.fn()} onSubmit={onSubmit}>
					{field === "input" ? <input aria-label="name" /> : <textarea aria-label="name" />}
				</Modal>,
			);
			return { onSubmit, field: screen.getByLabelText("name") };
		};

		it("submits from a text input", () => {
			const { onSubmit, field } = renderWithField("input");
			fireEvent.keyDown(field, { key: "Enter" });
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		it("keeps Shift+Enter as a new line in textareas", () => {
			const { onSubmit, field } = renderWithField("textarea");
			fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("ignores Enter already handled by the field", () => {
			const onSubmit = vi.fn();
			render(
				<Modal title="New collection" open setOpen={vi.fn()} onSubmit={onSubmit}>
					<input aria-label="name" onKeyDown={(event) => event.preventDefault()} />
				</Modal>,
			);
			fireEvent.keyDown(screen.getByLabelText("name"), { key: "Enter" });
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});
});
