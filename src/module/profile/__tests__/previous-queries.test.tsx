import PreviousQueries from "@/module/profile/templates/previous-queries";
import { mockGet } from "@/tests/utils/mock-api-client";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionStorage } from "@/lib/utils/session-storage";

// Mock session storage
vi.mock("@/lib/utils/session-storage", () => ({
	getSessionStorage: vi.fn(),
}));

describe("PreviousQueries Template - Integration Tests", () => {
	const mockQueries = [
		{
			_id: "1",
			subject: USER_QUERY_SUBJECT.GENERAL,
			status: USER_QUERY_STATUS.PENDING,
			message: "Query 1",
			createdAt: "2023-01-01T12:00:00Z",
			email: "test1@example.com",
			name: { first: "John", last: "Doe" },
			userName: "John Doe",
		},
		{
			_id: "2",
			subject: USER_QUERY_SUBJECT.TECHNICAL,
			status: USER_QUERY_STATUS.RESOLVED,
			message: "Query 2",
			createdAt: "2023-01-02T12:00:00Z",
			email: "test2@example.com",
			name: { first: "Jane", last: "Doe" },
			userName: "Jane Doe",
		},
	];

	const getQueriesResponse = (items = mockQueries, total = 2, page = 1, pageSize = 15) => ({
		data: {
			data: [
				{
					items,
					total,
					page,
					pageSize,
				},
			],
		},
	});

	beforeEach(() => {
		vi.clearAllMocks();
		(getSessionStorage as any).mockReturnValue([]);
		mockGet.mockResolvedValue(getQueriesResponse());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	const renderComponent = () => {
		return renderWithProviders(<PreviousQueries />, {
			wrapper: MemoryRouterProvider,
		});
	};

	it("should render loading state initially", async () => {
		// Create a promise that won't resolve immediately to simulate loading
		mockGet.mockReturnValue(new Promise(() => {}));
		renderComponent();
		expect(screen.getByText("Loading Queries...")).toBeInTheDocument();
	});

	it("should render queries when data is loaded", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Query 1")).toBeInTheDocument();
			expect(screen.getByText("Query 2")).toBeInTheDocument();
		});

		expect(screen.queryByText("Loading Queries...")).not.toBeInTheDocument();
	});

	it("should render breadcrumb", async () => {
		renderComponent();
		await waitFor(() => {
			expect(screen.getByText("Previous Queries")).toBeInTheDocument();
			expect(screen.getByText("Contact Us")).toBeInTheDocument();
		});
	});

	it("should highlight new queries based on session storage", async () => {
		(getSessionStorage as any).mockReturnValue(["1"]); // Query 1 is new
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText("Query 1")).toBeInTheDocument();
		});

		const query1Card = screen.getByText("Query 1").closest("div.relative");
		const query2Card = screen.getByText("Query 2").closest("div.relative");

		expect(query1Card).toHaveClass("border-info/40", "bg-blue-50/60");
		expect(query2Card).not.toHaveClass("border-info/40", "bg-blue-50/60");
	});

	it("should handle empty state", async () => {
		mockGet.mockResolvedValue(getQueriesResponse([], 0, 1, 15));
		renderComponent();

		await waitFor(() => {
			expect(screen.queryByText("Loading Queries...")).not.toBeInTheDocument();
		});

		expect(screen.getByText("No Queries Found")).toBeInTheDocument();
	});
});
