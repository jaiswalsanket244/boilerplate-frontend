import { FilterDialog } from "@/module/profile/components/user-queries/filter-dialog";
import { FilterDialogProps, USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const defaultProps = {
	filters: {
		subjects: [],
		status: [],
		dateFrom: undefined,
		dateTo: undefined,
	},
	onFiltersChange: vi.fn(),
	searchTerm: "",
	onSearchChange: vi.fn(),
};

function renderComponent(props?: Partial<FilterDialogProps>) {
	return render(<FilterDialog {...defaultProps} {...props} />);
}

describe("FilterDialog Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
	});

	it("should render filter button", () => {
		renderComponent();
		// The button contains FaFilter icon
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("should open dialog when button is clicked", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		// Check for dialog content
		expect(screen.getByText("Filter By")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Search by name or email")).toBeInTheDocument();
	});

	it("should render subject filter options", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		// Check for all subject options
		Object.values(USER_QUERY_SUBJECT).forEach((subject) => {
			expect(screen.getByText(subject)).toBeInTheDocument();
		});
	});

	it("should handle subject selection", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		// Click on a subject checkbox
		const generalCheckbox = screen.getByLabelText(USER_QUERY_SUBJECT.GENERAL);
		await user.click(generalCheckbox);

		expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
			expect.objectContaining({
				subjects: [USER_QUERY_SUBJECT.GENERAL],
			})
		);
	});

	it("should render status filter options", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		// Expand Status section
		const statusSection = screen.getByText("Status");
		await user.click(statusSection);

		// Check for all status options
		Object.values(USER_QUERY_STATUS).forEach((status) => {
			expect(screen.getAllByText(status).length).toBeGreaterThan(0);
		});
	});

	it("should handle status selection", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		// Expand Status section
		const statusSection = screen.getByText("Status");
		await user.click(statusSection);

		// Click on a status checkbox
		const pendingCheckbox = screen.getByTestId(`status-${USER_QUERY_STATUS.PENDING}`);
		await user.click(pendingCheckbox);

		expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
			expect.objectContaining({
				status: [USER_QUERY_STATUS.PENDING],
			})
		);
	});

	it("should handle search input", async () => {
		renderComponent();

		await user.click(screen.getByRole("button"));

		const searchInput = screen.getByPlaceholderText("Search by name or email");
		await user.type(searchInput, "test");

		expect(defaultProps.onSearchChange).toHaveBeenCalled();
	});

	it("should show selected filters", async () => {
		renderComponent({
			filters: {
				subjects: [USER_QUERY_SUBJECT.GENERAL],
				status: [USER_QUERY_STATUS.PENDING],
				dateFrom: undefined,
				dateTo: undefined,
			},
		});
		await user.click(screen.getByRole("button"));

		// Verify selected subject is checked
		const generalCheckbox = screen.getByLabelText(USER_QUERY_SUBJECT.GENERAL);
		expect(generalCheckbox).toBeChecked();
	});
});
