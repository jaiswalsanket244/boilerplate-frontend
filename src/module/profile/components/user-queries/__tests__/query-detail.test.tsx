import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IQueryDetailProps, type IUserQuery, USER_QUERY_STATUS, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { QueryDetail } from "@/module/profile/components/user-queries/query-detail";

const mockSendEmail = vi.fn();
const mockUpdateQuery = vi.fn();

// Mock dependencies
vi.mock("@/module/profile/hooks/useUserQueryAPI", async (importOriginal) => {
	const originalModule = await importOriginal<typeof import("@/module/profile/hooks/useUserQueryAPI")>();
	return {
		default: () => ({
			...originalModule.default(),
			useSendEmail: () => ({ mutateAsync: mockSendEmail }),
			useUpdateQuery: () => ({ mutateAsync: mockUpdateQuery }),
		}),
	};
});

const mockQuery: IUserQuery = {
	_id: "query-123",
	name: {
		first: "John",
		last: "Doe",
	},
	userName: "John Doe",
	email: "john.doe@example.com",
	subject: USER_QUERY_SUBJECT.GENERAL,
	message: "This is a test query message with some details.",
	status: USER_QUERY_STATUS.PENDING,
	createdAt: "2024-11-15T10:30:00.000Z",
};

const mockOnBack = vi.fn();

function renderComponent(props?: Partial<IQueryDetailProps>) {
	return render(<QueryDetail query={mockQuery} onBack={mockOnBack} {...props} />);
}

describe("QueryDetail Component", async () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	describe("Rendering", () => {
		it("should render empty state when no query is provided", () => {
			renderComponent({ query: null });

			expect(screen.getByText("Select a query to view details")).toBeInTheDocument();
		});

		it("should render query details correctly", () => {
			renderComponent();

			expect(screen.getByText("John Doe")).toBeInTheDocument();
			expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
			expect(screen.getByText("query-123")).toBeInTheDocument();
			expect(screen.getByText(mockQuery.subject)).toBeInTheDocument();
			expect(screen.getByText(mockQuery.message)).toBeInTheDocument();
		});

		it("should display user initials in avatar", () => {
			renderComponent();

			expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("J");
		});

		it("should render back button when showBackButton is true", () => {
			renderComponent({ showBackButton: true });

			const backButton = screen.getByTestId("back-button");
			expect(backButton).toBeInTheDocument();
		});

		it("should not render back button when showBackButton is false", () => {
			render(<QueryDetail query={mockQuery} onBack={mockOnBack} showBackButton={false} />);

			expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
		});

		it("should render email form", () => {
			render(<QueryDetail query={mockQuery} onBack={mockOnBack} />);

			expect(screen.getByTestId("email-form")).toBeInTheDocument();
		});

		it("should format and display creation date correctly", () => {
			render(<QueryDetail query={mockQuery} onBack={mockOnBack} />);

			expect(screen.getByText("Date: 15/11/2024")).toBeInTheDocument();
		});

		it("should render status select with current status", () => {
			render(<QueryDetail query={mockQuery} onBack={mockOnBack} />);

			const select = screen.getByRole("combobox");
			expect(select).toBeInTheDocument();
			expect(select).toHaveTextContent("Pending");
		});
	});

	describe("Back Button Functionality", () => {
		it("should call onBack when back button is clicked", async () => {
			renderComponent({ showBackButton: true });

			const backButton = screen.getByTestId("back-button");
			await user.click(backButton);

			expect(mockOnBack).toHaveBeenCalledTimes(1);
		});
	});

	describe("Status Update Functionality", () => {
		it("should update status when a new status is selected", async () => {
			mockUpdateQuery.mockResolvedValue({});

			renderComponent();

			const select = screen.getByTestId("mock-select");

			await user.selectOptions(select, USER_QUERY_STATUS.RESOLVED);

			await waitFor(() => {
				expect(mockUpdateQuery).toHaveBeenCalledWith({
					id: "query-123",
					data: { status: USER_QUERY_STATUS.RESOLVED },
				});
			});
		});

		it("should update status to IN_PROGRESS", async () => {
			mockUpdateQuery.mockResolvedValue({});

			renderComponent();

			const select = screen.getByTestId("mock-select");

			await user.selectOptions(select, USER_QUERY_STATUS.IN_PROGRESS);

			await waitFor(() => {
				expect(mockUpdateQuery).toHaveBeenCalledWith({
					id: "query-123",
					data: { status: USER_QUERY_STATUS.IN_PROGRESS },
				});
			});
		});

		it("should render all status options in select", async () => {
			renderComponent();

			const statuses = Object.values(USER_QUERY_STATUS);
			for (const status of statuses) {
				expect(await screen.findByRole("option", { name: status })).toBeInTheDocument();
			}
		});

		it("should handle multiple consecutive status changes", async () => {
			const user = userEvent.setup();
			mockUpdateQuery.mockResolvedValue({});

			renderComponent({ query: mockQuery });

			const select = screen.getByTestId("mock-select");

			await user.selectOptions(select, USER_QUERY_STATUS.RESOLVED);

			await waitFor(() => {
				expect(mockUpdateQuery).toHaveBeenCalledWith({
					id: "query-123",
					data: { status: USER_QUERY_STATUS.RESOLVED },
				});
			});

			// Second change
			await user.selectOptions(select, USER_QUERY_STATUS.IN_PROGRESS);

			await waitFor(() => {
				expect(mockUpdateQuery).toHaveBeenCalledWith({
					id: "query-123",
					data: { status: USER_QUERY_STATUS.IN_PROGRESS },
				});
			});

			expect(mockUpdateQuery).toHaveBeenCalledTimes(2);
		});
	});

	describe("Email Sending Functionality", () => {
		it("should send email when email form is submitted", async () => {
			mockSendEmail.mockResolvedValue({});

			renderComponent();

			// enter message to enable send button
			await user.type(screen.getByPlaceholderText("Message"), "Test message");

			const sendButton = screen.getByRole("button", { name: "Send Email" });
			await user.click(sendButton);

			await waitFor(() => {
				expect(mockSendEmail).toHaveBeenCalledWith({
					id: "query-123",
					payload: expect.objectContaining({
						message: "Test message",
					}),
				});
			});
		});

		it("should not send email when query is null", async () => {
			const { rerender } = render(<QueryDetail query={mockQuery} onBack={mockOnBack} />);

			expect(screen.queryByTestId("email-form")).toBeInTheDocument();

			rerender(<QueryDetail query={null} onBack={mockOnBack} />);

			expect(screen.queryByTestId("email-form")).not.toBeInTheDocument();
			expect(mockSendEmail).not.toHaveBeenCalled();
		});
	});

	describe("Edge Cases", () => {
		it("should handle query with missing last name", () => {
			const queryWithoutLastName = {
				...mockQuery,
				name: { first: "John", last: "" },
			};

			renderComponent({ query: queryWithoutLastName });

			expect(screen.getByText("John")).toBeInTheDocument();
		});

		it("should handle query with only first name", () => {
			const queryOnlyFirstName = {
				...mockQuery,
				name: { first: "John", last: undefined as any },
			};

			render(<QueryDetail query={queryOnlyFirstName} onBack={mockOnBack} />);

			expect(screen.getByText("John")).toBeInTheDocument();
		});

		it("should handle empty email", () => {
			const queryWithEmptyEmail = { ...mockQuery, email: "" };

			renderComponent({ query: queryWithEmptyEmail });

			expect(screen.getByTestId("email-span")).toHaveTextContent("");
		});

		it("should handle very long message", () => {
			const longMessage = JSON.stringify("This is a very long message. ".repeat(50));
			const queryWithLongMessage = { ...mockQuery, message: longMessage };

			renderComponent({ query: queryWithLongMessage });

			expect(screen.getByTestId("message-content")).toHaveTextContent(longMessage);
		});

		it("should handle special characters in name", () => {
			const queryWithSpecialChars = {
				...mockQuery,
				name: { first: "José", last: "O'Brien-Smith" },
			};

			renderComponent({ query: queryWithSpecialChars });

			expect(screen.getByText("José O'Brien-Smith")).toBeInTheDocument();
		});

		it("should handle query with different initial status", () => {
			const queryResolved = { ...mockQuery, status: USER_QUERY_STATUS.RESOLVED };

			renderComponent({ query: queryResolved });

			const select = screen.getByRole("combobox");
			expect(select).toHaveTextContent("Resolved");
		});

		it("should handle query with IN_PROGRESS status", () => {
			const queryInProgress = { ...mockQuery, status: USER_QUERY_STATUS.IN_PROGRESS };

			renderComponent({ query: queryInProgress });

			const select = screen.getByRole("combobox");
			expect(select).toHaveTextContent("In Progress");
		});

		it("should handle undefined query gracefully", () => {
			renderComponent({ query: undefined as any });

			expect(screen.getByText("Select a query to view details")).toBeInTheDocument();
		});

		it("should handle invalid date format", () => {
			const queryWithInvalidDate = { ...mockQuery, createdAt: "invalid-date" };

			renderComponent({ query: queryWithInvalidDate });

			expect(screen.getByText(/Date:/)).toBeInTheDocument();
		});
	});

	describe("Responsive Behavior", () => {
		it("should apply correct responsive classes", () => {
			const { container } = renderComponent();

			const headerDiv = container.querySelector(".p-2.md\\:p-4");
			expect(headerDiv).toBeInTheDocument();
		});

		it("should hide back button on large screens via lg:hidden class", () => {
			renderComponent({ showBackButton: true });

			const backButton = screen.getByTestId("back-button");
			expect(backButton).toHaveClass("lg:hidden");
		});
	});
});
