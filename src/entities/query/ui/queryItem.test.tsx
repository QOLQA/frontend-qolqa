import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Query } from "@fsd/entities/solution";
import { QueryItem } from "./queryItem";

vi.mock("@fsd/shared/i18n/use-translation", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const query: Query = {
	_id: "q1",
	full_query: "SELECT * FROM users",
	collections: ["users"],
	highlighted_words: [],
};

describe("QueryItem satisfaction indicator", () => {
	it("shows the handled indicator when isHandled is true", () => {
		render(<QueryItem query={query} isHandled />);

		expect(screen.getByLabelText("other.querySatisfied")).toBeInTheDocument();
		expect(screen.getByTitle("other.querySatisfied")).toBeInTheDocument();
		expect(screen.getByText("other.querySatisfied")).toBeInTheDocument();
		expect(screen.queryByLabelText("other.queryNotSatisfied")).toBeNull();
	});

	it("shows the unhandled indicator when isHandled is false", () => {
		render(<QueryItem query={query} isHandled={false} />);

		expect(screen.getByLabelText("other.queryNotSatisfied")).toBeInTheDocument();
		expect(screen.getByTitle("other.queryNotSatisfied")).toBeInTheDocument();
		expect(screen.getByText("other.queryNotSatisfied")).toBeInTheDocument();
		expect(screen.queryByLabelText("other.querySatisfied")).toBeNull();
	});

	it("renders no satisfaction indicator when isHandled is omitted", () => {
		render(<QueryItem query={query} />);

		expect(screen.queryByLabelText("other.querySatisfied")).toBeNull();
		expect(screen.queryByLabelText("other.queryNotSatisfied")).toBeNull();
	});

	it("still renders the query text and involved collections", () => {
		render(<QueryItem query={query} isHandled />);

		expect(screen.getByText("other.involvedCollections")).toBeInTheDocument();
		// Once in the highlighted query text, once as the collection chip.
		expect(screen.getAllByText("users")).toHaveLength(2);
	});
});
