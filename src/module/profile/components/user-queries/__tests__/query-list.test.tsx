import type { FilterState, IQueryListProps, IUserQuery } from "@/module/profile/types";
import { USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserQueriesList } from "@/module/profile/components/user-queries/query-list";
import userEvent from "@testing-library/user-event";

const mockQueries: IUserQuery[] = [
	{
		_id: "query-1",
		name: { first: "John", last: "Doe" },
		email: "john@example.com",
		subject: USER_QUERY_SUBJECT.BILLING,
		message: "I am having trouble processing my payment",
		status: USER_QUERY_STATUS.PENDING,
		createdAt: "2024-11-15T10:30:00.000Z",
		userName: "John Doe",
	},
	{
		_id: "query-2",
		name: { first: "Jane", last: "Smith" },
		email: "jane@example.com",
		subject: USER_QUERY_SUBJECT.TECHNICAL,
		message: "Cannot log into my account",
		status: USER_QUERY_STATUS.IN_PROGRESS,
		createdAt: "2024-11-14T09:20:00.000Z",
		userName: "Jane Smith",
	},
	{
		_id: "query-3",
		name: { first: "Bob", last: "Johnson" },
		email: "bob@example.com",
		subject: USER_QUERY_SUBJECT.FEATURE,
		message: "Would like to request a new feature for the dashboard",
		status: USER_QUERY_STATUS.RESOLVED,
		createdAt: "2024-11-13T14:45:00.000Z",
		userName: "Bob Johnson",
	},
];

const mockFilters: FilterState = {
	subjects: [],
	dateFrom: "",
	dateTo: "",
	status: [],
	sortBy: "createdAt",
	sortOrder: "desc",
};
const mockPagination = {
	page: 1,
	size: 10,
	totalPages: 3,
	totalItems: 25,
};

const defaultProps = {
	queries: mockQueries,
	selectedQueryId: null,
	onSelectQuery: vi.fn(),
	searchTerm: "",
	onSearchChange: vi.fn(),
	filters: mockFilters,
	onFiltersChange: vi.fn(),
	isLoading: false,
	onPageChange: vi.fn(),
	pagination: mockPagination,
	onSortChange: vi.fn(),
};

function renderComponent(props?: Partial<IQueryListProps>) {
	return renderWithProviders(<UserQueriesList {...defaultProps} {...props} />);
}

const getFilterDialogTrigger = () => screen.getByTestId("filter-dialog-trigger");
const getSortOptionsTrigger = () => screen.getByTestId("sort-options-trigger");

describe("UserQueriesList Component - Integration Tests", () => {
	let user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render the component with queries", () => {
			renderComponent();

			expect(screen.getByTestId("filters-container")).toBeInTheDocument();
			expect(screen.getAllByText(/John Doe/)).toHaveLength(1);
			expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
			expect(screen.getByText(/Bob Johnson/)).toBeInTheDocument();
		});

		it("should render all query details correctly", () => {
			renderComponent();

			expect(screen.getByText("John Doe")).toBeInTheDocument();
			expect(screen.getByText("#query-1")).toBeInTheDocument();
			expect(screen.getByText(USER_QUERY_SUBJECT.BILLING)).toBeInTheDocument();
			expect(screen.getByText("I am having trouble processing my payment")).toBeInTheDocument();
		});

		it("should render status badges for all queries", () => {
			renderComponent();

			const statusBadges = screen.getAllByTestId("status-badge");
			expect(statusBadges).toHaveLength(3);
		});

		it("should render formatted dates correctly", () => {
			renderComponent();

			expect(screen.getByText("Date: 15/11/2024")).toBeInTheDocument();
			expect(screen.getByText("Date: 14/11/2024")).toBeInTheDocument();
			expect(screen.getByText("Date: 13/11/2024")).toBeInTheDocument();
		});

		it("should apply custom className when provided", () => {
			const { container } = renderComponent({ className: "custom-class" });

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass("custom-class");
		});

		it("should render pagination when totalPages > 0", () => {
			renderComponent();

			expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
			expect(screen.getByText("Showing 1-10 of 25 results")).toBeInTheDocument();
		});

		it("should not render pagination when totalPages is 0", () => {
			const propsWithNoPagination = {
				...defaultProps,
				pagination: { ...mockPagination, totalPages: 0 },
			};

			render(<UserQueriesList {...propsWithNoPagination} />);

			expect(screen.queryByTestId("pagination-component")).not.toBeInTheDocument();
		});
	});

	describe("Empty and Loading States", () => {
		it("should render 'No queries found' when queries array is empty", () => {
			const propsWithNoQueries = {
				...defaultProps,
				queries: [],
				isLoading: false,
			};

			render(<UserQueriesList {...propsWithNoQueries} />);

			expect(screen.getByText("No queries found")).toBeInTheDocument();
		});

		it("should render loading state when isLoading is true", () => {
			const propsWithLoading = {
				...defaultProps,
				isLoading: true,
			};

			render(<UserQueriesList {...propsWithLoading} />);

			expect(screen.getByText("Loading queries...")).toBeInTheDocument();
		});

		it("should not render queries when loading", () => {
			renderComponent({ isLoading: true });

			expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
		});

		it("should not show 'No queries found' when loading", () => {
			renderComponent({ isLoading: true, queries: [] });

			expect(screen.queryByText("No queries found")).not.toBeInTheDocument();
			expect(screen.getByText("Loading queries...")).toBeInTheDocument();
		});
	});

	describe("Query Selection", () => {
		it("should call onSelectQuery when a query is clicked", async () => {
			renderComponent();

			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery!);

			expect(defaultProps.onSelectQuery).toHaveBeenCalledWith("query-1");
		});

		it("should highlight selected query", () => {
			const propsWithSelection = {
				...defaultProps,
				selectedQueryId: "query-2",
			};

			render(<UserQueriesList {...propsWithSelection} />);

			const selectedQuery = screen.getByText("Jane Smith").closest("div[class*='cursor-pointer']");
			expect(selectedQuery).toHaveClass("border-2", "border-primary/50");
		});

		it("should not highlight non-selected queries", () => {
			const propsWithSelection = {
				...defaultProps,
				selectedQueryId: "query-2",
			};

			render(<UserQueriesList {...propsWithSelection} />);

			const nonSelectedQuery = screen.getByText("John Doe").closest("div[class*='cursor-pointer']");
			expect(nonSelectedQuery).not.toHaveClass("border-primary/50");
			expect(nonSelectedQuery).toHaveClass("border-border");
		});

		it("should handle multiple query selections", async () => {
			renderComponent();

			const firstQuery = screen.getByTestId("query-1");
			const secondQuery = screen.getByTestId("query-2");

			await user.click(firstQuery!);
			expect(defaultProps.onSelectQuery).toHaveBeenCalledWith("query-1");

			await user.click(secondQuery!);
			expect(defaultProps.onSelectQuery).toHaveBeenCalledWith("query-2");

			expect(defaultProps.onSelectQuery).toHaveBeenCalledTimes(2);
		});
	});

	describe("Filters Functionality", () => {
		it("should render Filters component with correct props", () => {
			renderComponent();

			expect(screen.getByTestId("filters-container")).toBeInTheDocument();
			expect(screen.getByTestId("search-input")).toHaveValue("");
		});

		it("should call onSearchChange when search input changes", async () => {
			renderComponent();

			const searchInput = screen.getByTestId("search-input");
			await user.type(searchInput, "test");

			expect(defaultProps.onSearchChange).toHaveBeenCalled();
		});

		it("should call onFiltersChange when filter is applied", async () => {
			renderComponent();

			await user.click(getFilterDialogTrigger());

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

		it("should call onSortChange when sort is triggered", async () => {
			renderComponent();

			await user.click(getSortOptionsTrigger());
			await user.click(screen.getByTestId("sort-option-createdAt-desc"));

			expect(defaultProps.onSortChange).toHaveBeenCalledWith("createdAt", "desc");
		});

		it("should display current search term in filters", () => {
			const propsWithSearch = {
				...defaultProps,
				searchTerm: "payment issue",
			};

			renderComponent(propsWithSearch);

			expect(screen.getByTestId("search-input")).toHaveValue("payment issue");
		});
	});

	describe("Pagination Functionality", () => {
		const getPaginationButtons = () => {
			return {
				nextButton: screen.getByTestId("next-page-button"),
				prevButton: screen.getByTestId("prev-page-button"),
			};
		};

		it("should call onPageChange when next page is clicked", async () => {
			renderComponent();

			const { nextButton } = getPaginationButtons();
			await user.click(nextButton);

			// should call onPageChange with page 2
			expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
		});

		it("should call onPageChange when previous page is clicked", async () => {
			const propsWithPage2 = {
				...defaultProps,
				pagination: { ...mockPagination, page: 2 },
			};

			renderComponent(propsWithPage2);

			await user.click(getPaginationButtons().prevButton);

			expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
		});

		it("should display correct pagination info", () => {
			const propsWithPage2 = {
				...defaultProps,
				pagination: { ...mockPagination, page: 2 },
			};

			renderComponent(propsWithPage2);

			expect(screen.getByText("Showing 11-20 of 25 results")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle query with missing last name", () => {
			const queriesWithMissingLastName = [
				{
					...mockQueries[0]!,
					name: { first: "John", last: "" },
				},
			];
			renderComponent({ queries: queriesWithMissingLastName });

			expect(screen.getByText("John")).toBeInTheDocument();
		});

		it("should handle query with undefined last name", () => {
			const queriesWithUndefinedLastName = [
				{
					...mockQueries[0]!,
					name: { first: "John", last: undefined as any },
				},
			];

			render(<UserQueriesList {...defaultProps} queries={queriesWithUndefinedLastName} />);

			expect(screen.getByText("John")).toBeInTheDocument();
		});

		it("should truncate long messages with line-clamp", () => {
			const longMessage = "This is a very long message that should be truncated. ".repeat(10);
			const queriesWithLongMessage = [
				{
					...mockQueries[0]!,
					message: longMessage,
				},
			];

			const { container } = renderComponent({ queries: queriesWithLongMessage });

			const messageElement = container.querySelector(".line-clamp-1");
			expect(messageElement).toBeInTheDocument();
			expect(messageElement).toHaveClass("truncate");
		});

		it("should handle special characters in names", () => {
			const queriesWithSpecialChars = [
				{
					...mockQueries[0]!,
					name: { first: "José", last: "O'Brien-Smith" },
				},
			];

			renderComponent({ queries: queriesWithSpecialChars });

			expect(screen.getByText("José O'Brien-Smith")).toBeInTheDocument();
		});

		it("should handle queries with all different status types", () => {
			const queriesWithAllStatuses = [
				{ ...mockQueries[0]!, status: USER_QUERY_STATUS.PENDING },
				{ ...mockQueries[1]!, status: USER_QUERY_STATUS.IN_PROGRESS },
				{ ...mockQueries[2]!, status: USER_QUERY_STATUS.RESOLVED },
			];

			renderComponent({ queries: queriesWithAllStatuses });

			const statusBadges = screen.getAllByTestId("status-badge");
			expect(statusBadges[0]).toHaveTextContent("Pending");
			expect(statusBadges[1]).toHaveTextContent("In Progress");
			expect(statusBadges[2]).toHaveTextContent("Resolved");
		});

		it("should handle single query in list", () => {
			const singleQuery = [mockQueries[0]!];

			renderComponent({ queries: singleQuery });

			expect(screen.getByText("John Doe")).toBeInTheDocument();
			expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
		});

		it("should handle invalid date gracefully", () => {
			const queriesWithInvalidDate = [
				{
					...mockQueries[0]!,
					createdAt: "invalid-date",
				},
			];

			renderComponent({ queries: queriesWithInvalidDate });

			expect(screen.getByText(/Date:/)).toBeInTheDocument();
		});

		it("should handle null selectedQueryId", () => {
			const propsWithNullSelection = {
				...defaultProps,
				selectedQueryId: null,
			};

			renderComponent(propsWithNullSelection);

			const queries = screen.getAllByText(/User Name:/).map((el) => el.closest("div[class*='cursor-pointer']"));

			queries.forEach((query) => {
				expect(query).not.toHaveClass("border-primary/50");
			});
		});

		it("should handle undefined selectedQueryId", () => {
			const propsWithUndefinedSelection = {
				...defaultProps,
				selectedQueryId: undefined as any,
			};

			renderComponent(propsWithUndefinedSelection);

			const queries = screen.getAllByText(/User Name:/).map((el) => el.closest("div[class*='cursor-pointer']"));

			queries.forEach((query) => {
				expect(query).not.toHaveClass("border-primary/50");
			});
		});

		it("should render large number of queries efficiently", () => {
			const manyQueries = Array.from({ length: 50 }, (_, i) => ({
				...mockQueries[0]!,
				_id: `query-${i + 1}`,
				name: { first: `User${i}`, last: `Test${i}` },
			}));

			renderComponent({ queries: manyQueries });

			const queryCards = screen.getAllByTestId(/^query-/i);
			expect(queryCards).toHaveLength(50);
		});
	});
	describe("Integration Tests", () => {
		it("should handle full user workflow: search, filter, select query, and paginate", async () => {
			renderComponent();

			// Search
			const searchInput = screen.getByTestId("search-input");
			await user.type(searchInput, "payment");
			expect(defaultProps.onSearchChange).toHaveBeenCalled();

			// Filter Dialog
			await user.click(getFilterDialogTrigger());

			const statusSection = screen.getByTestId("status-filter-section");
			await user.click(statusSection);

			const pendingCheckbox = screen.getByTestId(`status-${USER_QUERY_STATUS.PENDING}`);
			await user.click(pendingCheckbox);

			const generalCheckbox = screen.getByLabelText(USER_QUERY_SUBJECT.GENERAL);
			await user.click(generalCheckbox);

			expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
				expect.objectContaining({
					subjects: [USER_QUERY_SUBJECT.GENERAL],
				})
			);
			// onFiltersChange should be called twice
			expect(defaultProps.onFiltersChange).toHaveBeenCalledTimes(2);

			// Select query
			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery!);
			expect(defaultProps.onSelectQuery).toHaveBeenCalledWith("query-1");

			// Paginate
			const nextButton = screen.getByText("Next");
			await user.click(nextButton);
			expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
		});

		it("should handle empty state with pagination hidden", () => {
			const propsEmpty = {
				...defaultProps,
				queries: [],
				pagination: { ...mockPagination, totalPages: 0 },
			};

			render(<UserQueriesList {...propsEmpty} />);

			expect(screen.getByText("No queries found")).toBeInTheDocument();
			expect(screen.queryByTestId("pagination-component")).not.toBeInTheDocument();
		});
	});
	describe("Styling and Layout", () => {
		it("should apply correct container classes", () => {
			const { container } = renderComponent();

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass(
				"flex",
				"h-full",
				"w-full",
				"flex-col",
				"overflow-hidden",
				"border-r",
				"border-border",
				"bg-background"
			);
		});

		it("should apply hover styles to non-selected queries", () => {
			renderComponent();

			const query = screen.getByText("John Doe").closest("div[class*='cursor-pointer']");
			expect(query).toHaveClass("hover:bg-card/40");
		});

		it("should position status badge absolutely", () => {
			const { container } = renderComponent();

			const statusBadge = container.querySelector("[data-testid='status-badge']");
			expect(statusBadge).toHaveClass("absolute", "-top-3", "right-4", "z-10");
		});

		it("should apply correct responsive classes", () => {
			const { container } = renderComponent();

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass("md:max-w-md");
		});
	});

	describe("Accessibility", () => {
		it("should have clickable query cards", () => {
			renderComponent();

			const queryCards = screen.getAllByTestId(/query-/i).map((el) => el.closest("div[class*='cursor-pointer']"));

			queryCards.forEach((card) => {
				expect(card).toHaveClass("cursor-pointer");
			});
		});

		it("should maintain proper DOM structure for screen readers", () => {
			const { container } = render(<UserQueriesList {...defaultProps} />);

			const userNameLabels = container.querySelectorAll(".font-bold");
			expect(userNameLabels.length).toBeGreaterThan(0);
		});
	});
});
