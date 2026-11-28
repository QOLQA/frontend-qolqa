import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Query } from "@fsd/entities/solution";
import { ModalNewQuery } from "./modalNewQuery";

const sampleQuery: Query = {
	_id: "q-1",
	full_query: "Find all orders with users",
	collections: ["orders", "users"],
	highlighted_words: [],
};

function renderModal(overrides: Partial<Parameters<typeof ModalNewQuery>[0]> = {}) {
	const props = {
		open: false,
		setOpen: vi.fn(),
		mode: "edit" as const,
		queryEdit: sampleQuery,
		queryText: "stale text",
		setQueryText: vi.fn(),
		...overrides,
	};
	const utils = render(<ModalNewQuery {...props} />);
	return { ...utils, props };
}

describe("ModalNewQuery", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("never calls the parent's setQueryText during render", () => {
		const { props } = renderModal();

		expect(props.setQueryText).not.toHaveBeenCalled();
	});

	it("renders the textarea with the text owned by the parent", () => {
		renderModal({ mode: "create", open: true });

		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});
});
