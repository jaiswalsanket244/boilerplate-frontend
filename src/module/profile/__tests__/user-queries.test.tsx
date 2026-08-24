import UserQueries from "@/module/profile/templates/user-queries";
import type { IUserQuery } from "@/module/profile/types";
import { USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { mockGet } from "@/tests/utils/mock-api-client";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUseIsMobile = vi.fn();

vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: () => mockUseIsMobile(),
}));

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

const getApiResponse = (queries: IUserQuery[]) => ({
	data: {
		data: [
			{
				items: queries,
				page: 1,
				pageSize: 10,
				total: queries.length,
			},
		],
	},
});

function renderComponent() {
	return renderWithProviders(<UserQueries />);
}
async function waitForQueriesToLoad() {
	await waitFor(() => {
		expect(screen.queryByText("Loading queries...")).not.toBeInTheDocument();
	});
}

describe("UserQueries - Integration Tests", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockResolvedValue(getApiResponse(mockQueries));
		mockUseIsMobile.mockReturnValue(false);
		user = userEvent.setup();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	describe("Desktop View", () => {
		beforeEach(() => {
			mockUseIsMobile.mockReturnValue(false);
		});

		it("should render both list and detail view side by side", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
				expect(screen.getByTestId("no-query-selected")).toBeInTheDocument();
			});
		});

		it("should not show back button in detail view on desktop", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
		});

		it("should display 'Select a query' message when no query is selected", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("no-query-selected")).toBeInTheDocument();
				expect(screen.getByText(/select a query/i)).toBeInTheDocument();
			});
		});

		it("should load and display queries from API", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("John Doe")).toBeInTheDocument();
				expect(screen.getByText("Jane Smith")).toBeInTheDocument();
				expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
			});
		});

		it("should select and display query details when query is clicked", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.queryByText("Loading queries...")).not.toBeInTheDocument();
			});

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery);

			await waitFor(() => {
				const queryDetail = screen.getByTestId("query-detail");
				expect(queryDetail).toBeInTheDocument();
				expect(queryDetail.querySelector("[data-testid='message-content']")).toHaveTextContent(
					"I am having trouble processing my payment"
				);
			});
		});

		it("should change selected query when different query is clicked", async () => {
			renderComponent();
			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			// Select first query
			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery);

			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent("I am having trouble processing my payment");
			});

			// Select second query
			const secondQuery = screen.getByTestId("query-2");
			await user.click(secondQuery);

			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent("Cannot log into my account");
			});
		});

		it("should not change selection when clicking same query again", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const firstQuery = screen.getByTestId("query-1");

			// Click once
			await user.click(firstQuery);

			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent("I am having trouble processing my payment");
			});

			// Click again
			await user.click(firstQuery);

			// Should still show the same query
			expect(screen.getByTestId("message-content")).toHaveTextContent("I am having trouble processing my payment");
		});

		it("should apply max-w-md class to list on desktop", async () => {
			renderComponent();
			await waitForQueriesToLoad();

			await waitFor(() => {
				const list = screen.getByTestId("user-queries-list");
				expect(list).toHaveClass("max-w-md");
			});
		});

		it("should maintain layout with container classes", async () => {
			const { container } = renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
			});

			const mainContainer = container.firstChild;
			expect(mainContainer).toHaveClass("flex", "overflow-hidden", "bg-background");
		});
	});

	describe("Mobile View", () => {
		beforeEach(() => {
			mockUseIsMobile.mockReturnValue(true);
		});

		it("should show only the list initially", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
				expect(screen.queryByTestId("query-detail")).not.toBeInTheDocument();
			});
		});

		it("should show detail view after selecting a query", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery);

			await waitFor(() => {
				expect(screen.getByTestId("query-detail")).toBeInTheDocument();
				expect(screen.queryByTestId("user-queries-list")).not.toBeInTheDocument();
			});
		});

		it("should show back button in detail view on mobile", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery);

			await waitFor(() => {
				expect(screen.getByTestId("back-button")).toBeInTheDocument();
			});
		});

		it("should return to list when back button is clicked", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			// Select query to show detail
			const firstQuery = screen.getByTestId("query-1");
			await user.click(firstQuery);

			await waitFor(() => {
				expect(screen.getByTestId("query-detail")).toBeInTheDocument();
			});

			// Click back button
			const backButton = screen.getByTestId("back-button");
			await user.click(backButton);

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
				expect(screen.queryByTestId("query-detail")).not.toBeInTheDocument();
			});
		});

		it("should apply full width class to list on mobile", async () => {
			renderComponent();

			await waitFor(() => {
				const list = screen.getByTestId("user-queries-list");
				expect(list).toHaveClass("w-full");
			});
		});

		it("should handle multiple query selections on mobile", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			// Select first query
			await user.click(screen.getByTestId("query-1"));

			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent("I am having trouble processing my payment");
			});

			// Go back
			await user.click(screen.getByTestId("back-button"));

			await waitFor(() => {
				expect(screen.getByTestId("user-queries-list")).toBeInTheDocument();
			});

			// Select second query
			await user.click(screen.getByTestId("query-2"));

			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent("Cannot log into my account");
			});
		});
	});

	describe("Search Functionality", () => {
		beforeEach(() => {
			mockUseIsMobile.mockReturnValue(false);
		});

		it("should update search value as user types", async () => {
			renderComponent();
			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("search-input")).toBeInTheDocument();
			});

			const searchInput = screen.getByTestId("search-input");
			await user.type(searchInput, "john");

			expect(searchInput).toHaveValue("john");
		});

		it("should trigger API call with search term after debounce", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const searchInput = screen.getByTestId("search-input");
			await user.type(searchInput, "payment");

			// Advance timers and wait for the debounced function to execute and cause state updates
			await act(async () => {
				vi.advanceTimersByTime(1000);
			});

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("search=payment"));
			});
		});
	});

	describe("Loading State", () => {
		it("should display loading state initially", () => {
			// Mock a delayed response
			mockGet.mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve(getApiResponse(mockQueries)), 1000);
					})
			);

			renderComponent();

			expect(screen.getByTestId("loading-queries")).toBeInTheDocument();
		});

		it("should display queries after loading completes", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("John Doe")).toBeInTheDocument();
				expect(screen.queryByTestId("loading-queries")).not.toBeInTheDocument();
			});
		});
	});

	describe("Empty State", () => {
		beforeEach(() => {
			mockGet.mockResolvedValue(getApiResponse([]));
		});

		it("should render empty state when no queries exist", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
			});
		});

		it("should still show detail view on desktop with empty list", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("no-query-selected")).toBeInTheDocument();
			});
		});
	});

	describe("Pagination Functionality", () => {
		beforeEach(() => {
			mockUseIsMobile.mockReturnValue(false);
		});

		it("should display pagination controls when total exceeds page size", async () => {
			mockGet.mockResolvedValue({
				data: {
					data: [
						{
							items: mockQueries,
							page: 1,
							pageSize: 2,
							total: 25,
						},
					],
				},
			});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
			});
		});

		it("should load next page when pagination button is clicked", async () => {
			mockGet
				.mockResolvedValueOnce({
					data: {
						data: [
							{
								items: mockQueries.slice(0, 2),
								page: 1,
								pageSize: 2,
								total: 3,
							},
						],
					},
				})
				.mockResolvedValueOnce({
					data: {
						data: [
							{
								items: [mockQueries[2]!],
								page: 2,
								pageSize: 2,
								total: 3,
							},
						],
					},
				});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("John Doe")).toBeInTheDocument();
			});

			const nextButton = screen.getByTestId("next-page-button");
			await user.click(nextButton);

			await waitFor(() => {
				expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
			});
		});
	});

	describe("Filter Functionality", () => {
		it("should open filter dialog when filter button is clicked", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("filter-dialog-trigger")).toBeInTheDocument();
			});

			await user.click(screen.getByTestId("filter-dialog-trigger"));

			await waitFor(() => {
				expect(screen.getByTestId("filter-dialog")).toBeInTheDocument();
			});
		});

		it("should apply filters and trigger API call", async () => {
			const filteredQueries = [mockQueries[0]!];

			mockGet.mockResolvedValueOnce(getApiResponse(mockQueries)).mockResolvedValueOnce(getApiResponse(filteredQueries));

			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("filter-dialog-trigger")).toBeInTheDocument();
			});
			// open filter popover
			await user.click(screen.getByTestId("filter-dialog-trigger"));

			// open status filter section
			const statusSection = screen.getByTestId("status-filter-section");
			await user.click(statusSection);

			// select pending status
			const pendingCheckbox = screen.getByTestId(`status-${USER_QUERY_STATUS.PENDING}`);
			await user.click(pendingCheckbox);

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("status=Pending"));
			});
		});
	});

	describe("Sort Functionality", () => {
		it("should trigger API call when sort option is changed", async () => {
			const sortedQueries = [...mockQueries].reverse();

			mockGet.mockResolvedValueOnce(getApiResponse(mockQueries)).mockResolvedValueOnce(getApiResponse(sortedQueries));

			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("sort-options-trigger")).toBeInTheDocument();
			});

			await user.click(screen.getByTestId("sort-options-trigger"));
			await user.click(screen.getByTestId("sort-option-createdAt-asc"));

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("sortBy=createdAt&sortOrder=desc"));
			});

			await user.click(screen.getByTestId("sort-option-createdAt-asc"));

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("sortBy=createdAt&sortOrder=asc"));
			});
			expect(mockGet).toHaveBeenCalledTimes(3);
		});
	});

	describe("Edge Cases", () => {
		it("should handle API error gracefully", async () => {
			mockGet.mockRejectedValue(new Error("API Error"));

			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("error-message")).toBeInTheDocument();
			});
		});

		it("should handle rapid query selections", async () => {
			renderComponent();

			await waitForQueriesToLoad();

			await waitFor(() => {
				expect(screen.getByTestId("query-1")).toBeInTheDocument();
			});

			const query1 = screen.getByTestId("query-1");
			const query2 = screen.getByTestId("query-2");
			const query3 = screen.getByTestId("query-3");

			// Rapidly click different queries
			await user.click(query1);
			await user.click(query2);
			await user.click(query3);

			// Should display the last selected query
			await waitFor(() => {
				expect(screen.getByTestId("message-content")).toHaveTextContent(
					"Would like to request a new feature for the dashboard"
				);
			});
		});
	});
});
