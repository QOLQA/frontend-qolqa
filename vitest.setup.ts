import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom does not implement the modal <dialog> API used by the shared Modal.
if (!HTMLDialogElement.prototype.showModal) {
	HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
		this.setAttribute("open", "");
	};
	HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
		this.removeAttribute("open");
	};
}

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});
