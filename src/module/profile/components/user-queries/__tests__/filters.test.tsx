import Filters from "@/module/profile/components/user-queries/filters";
import { IFiltersProps } from "@/module/profile/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const defaultProps = {
	searchTerm: "",
	onSearchChange: vi.fn(),
	filters: { subjects: [], status: [], sortBy: "createdAt" as const, sortOrder: "desc" as const },
	onFiltersChange: vi.fn(),
	onSortChange: vi.fn(),
};

function renderComponent(props?: Partial<IFiltersProps>) {
	return render(<Filters {...defaultProps} {...props} />);
}

describe("Filters Component", () => {
	it("should render search input", () => {
		renderComponent();
		expect(screen.getByPlaceholderText("Search by name or email")).toBeInTheDocument();
	});

	it("should render filter dialog", () => {
		renderComponent();
		expect(screen.getByTestId("filter-dialog-trigger")).toBeInTheDocument();
	});

	it("should render sort options", () => {
		renderComponent();
		expect(screen.getByTestId("sort-options-trigger")).toBeInTheDocument();
	});

	it("should call onSearchChange when typing in search input", async () => {
		const user = userEvent.setup();
		renderComponent();

		const searchInput = screen.getByPlaceholderText("Search by name or email");
		await user.type(searchInput, "test");

		expect(defaultProps.onSearchChange).toHaveBeenCalledWith("t");
		expect(defaultProps.onSearchChange).toHaveBeenCalledWith("e");
		expect(defaultProps.onSearchChange).toHaveBeenCalledWith("s");
		expect(defaultProps.onSearchChange).toHaveBeenCalledWith("t");
	});

	it("should display search term value", () => {
		renderComponent({ searchTerm: "test query" });
		expect(screen.getByDisplayValue("test query")).toBeInTheDocument();
	});
});
