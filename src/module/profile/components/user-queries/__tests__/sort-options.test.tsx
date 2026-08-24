import SortOptions from "@/module/profile/components/user-queries/sort-options";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
const defaultProps = {
	onSortChange: vi.fn(),
	sortBy: "createdAt" as const,
	sortOrder: "desc" as const,
};

function renderComponent() {
	return render(<SortOptions {...defaultProps} />);
}

describe("SortOptions Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		user = userEvent.setup();
	});

	it("should render sort button", () => {
		renderComponent();

		expect(screen.getByTestId("sort-options-trigger")).toBeInTheDocument();
	});

	it("should open popover when button is clicked", async () => {
		renderComponent();

		await user.click(screen.getByTestId("sort-options-trigger"));

		// Check for sort options
		expect(screen.getByText("Date Newest to Oldest")).toBeInTheDocument();
		expect(screen.getByText("Date Oldest to Newest")).toBeInTheDocument();
	});

	it("should call onSortChange when option is selected", async () => {
		renderComponent();

		// Open popover
		await user.click(screen.getByTestId("sort-options-trigger"));

		// Click on "Date Oldest to Newest"
		await user.click(screen.getByText("Date Oldest to Newest"));

		expect(defaultProps.onSortChange).toHaveBeenCalledWith("createdAt", "asc");
	});

	it("should show check mark for selected option", async () => {
		renderComponent();

		await user.click(screen.getByTestId("sort-options-trigger"));

		expect(screen.getByText("Date Newest to Oldest")).toBeInTheDocument();
		expect(screen.getByTestId("check-icon")).toBeInTheDocument();
	});
});
