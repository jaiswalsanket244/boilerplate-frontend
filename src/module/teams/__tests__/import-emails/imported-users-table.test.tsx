import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UsersTable } from "@/module/teams/components/import-emails/imported-users-table";
import type { IInviteUsersTableProps, UserInviteDetails } from "@/module/teams/types";

describe("UsersTable (Imported Users) Component", () => {
	let user: UserEvent;
	const mockOnSearchChange = vi.fn();
	const mockOnRemoveUser = vi.fn();

	const mockUsers: UserInviteDetails[] = [
		{
			id: "1",
			email: "john@example.com",
			firstName: "John",
			lastName: "Doe",
		},
		{
			id: "2",
			email: "jane@example.com",
			firstName: "Jane",
			lastName: "Smith",
		},
		{
			id: "3",
			email: "invalid-email",
			firstName: "",
			lastName: "Test",
			errors: ["Invalid email format", "First name is required"],
		},
	];

	function renderComponent(props?: Partial<IInviteUsersTableProps>) {
		return render(
			<UsersTable
				users={mockUsers}
				filteredUsers={mockUsers}
				searchQuery=""
				onSearchChange={mockOnSearchChange}
				onRemoveUser={mockOnRemoveUser}
				{...props}
			/>
		);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render search input", () => {
			renderComponent();

			expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument();
		});

		it("should render table headers", () => {
			renderComponent();

			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByText("First Name")).toBeInTheDocument();
			expect(screen.getByText("Last Name")).toBeInTheDocument();
		});

		it("should render all filtered users", () => {
			renderComponent();
			expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("invalid-email")).toBeInTheDocument();
		});

		it("should render search icon", () => {
			renderComponent();
			const searchIcon = screen.getByTestId("search-icon");
			expect(searchIcon).toBeInTheDocument();
		});
	});

	describe("Search Functionality", () => {
		it("should call onSearchChange when search input changes", async () => {
			renderComponent();

			const searchInput = screen.getByPlaceholderText("Search users...");
			await user.type(searchInput, "john");

			expect(mockOnSearchChange).toHaveBeenCalledWith("j");
			expect(mockOnSearchChange).toHaveBeenCalledWith("o");
			expect(mockOnSearchChange).toHaveBeenCalledWith("h");
			expect(mockOnSearchChange).toHaveBeenCalledWith("n");
		});

		it("should display current search query", () => {
			renderComponent({ searchQuery: "john" });

			const searchInput = screen.getByPlaceholderText("Search users...") as HTMLInputElement;
			expect(searchInput.value).toBe("john");
		});

		it("should show no results message when filteredUsers is empty with search query", () => {
			renderComponent({ filteredUsers: [], searchQuery: "nonexistent" });

			expect(screen.getByText("No users found matching your search")).toBeInTheDocument();
		});

		it("should show no users message when filteredUsers is empty without search query", () => {
			renderComponent({ filteredUsers: [], searchQuery: "" });

			expect(screen.getByText("No users to display")).toBeInTheDocument();
		});
	});

	describe("User Display", () => {
		it("should display correct serial numbers based on original users array", () => {
			const filteredUsers = [mockUsers[1]!]; // Only Jane

			renderComponent({ filteredUsers, searchQuery: "jane" });

			// Jane is at index 1 in original array, so serial number should be 2
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("should display user emails in input fields", () => {
			renderComponent();

			expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
		});

		it("should display user first names in input fields", () => {
			renderComponent();

			expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
		});

		it("should display user last names in input fields", () => {
			renderComponent();

			expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Smith")).toBeInTheDocument();
		});
	});

	describe("Error Display", () => {
		it("should highlight email field with error", () => {
			renderComponent();

			const emailInput = screen.getByDisplayValue("invalid-email");
			expect(emailInput).toHaveClass("border-red-500");
		});

		it("should display email error messages", () => {
			renderComponent();

			expect(screen.getByText("Invalid email format")).toBeInTheDocument();
		});

		it("should highlight first name field with error", () => {
			renderComponent();

			const firstNameInputs = screen.getAllByDisplayValue("");
			const errorInput = firstNameInputs.find((input) => input.classList.contains("border-red-500"));
			expect(errorInput).toBeInTheDocument();
		});

		it("should display first name error messages", () => {
			renderComponent();

			expect(screen.getByText("First name is required")).toBeInTheDocument();
		});

		it("should handle multiple errors for same field", () => {
			const userWithMultipleErrors: UserInviteDetails[] = [
				{
					id: "1",
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
					errors: ["Email error 1", "Email error 2"],
				},
			];

			renderComponent({ users: userWithMultipleErrors, filteredUsers: userWithMultipleErrors });

			expect(screen.getByText("Email error 1")).toBeInTheDocument();
			expect(screen.getByText("Email error 2")).toBeInTheDocument();
		});
	});

	describe("Remove Functionality", () => {
		it("should render remove button for each user", () => {
			renderComponent();

			const removeButtons = screen.getAllByRole("button");
			expect(removeButtons.length).toBe(mockUsers.length);
		});

		it("should call onRemoveUser with correct id when remove button is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();

			const removeButtons = screen.getAllByRole("button");
			await user.click(removeButtons[0]!);

			expect(mockOnRemoveUser).toHaveBeenCalledWith("1");
		});

		it("should call onRemoveUser for different users", async () => {
			const user = userEvent.setup();
			renderComponent();

			const removeButtons = screen.getAllByRole("button");
			await user.click(removeButtons[1]!);

			expect(mockOnRemoveUser).toHaveBeenCalledWith("2");
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty users array", () => {
			renderComponent({ users: [], filteredUsers: [] });

			expect(screen.getByText("No users to display")).toBeInTheDocument();
		});

		it("should handle users without errors", () => {
			const usersWithoutErrors: UserInviteDetails[] = [
				{
					id: "1",
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
				},
			];

			renderComponent({ users: usersWithoutErrors, filteredUsers: usersWithoutErrors });

			const emailInput = screen.getByDisplayValue("test@example.com");
			expect(emailInput).not.toHaveClass("border-red-500");
		});

		it("should handle very long user data", () => {
			const longEmail = "a".repeat(100) + "@example.com";
			const longName = "B".repeat(100);

			const usersWithLongData: UserInviteDetails[] = [
				{
					id: "1",
					email: longEmail,
					firstName: longName,
					lastName: longName,
				},
			];

			renderComponent({ users: usersWithLongData, filteredUsers: usersWithLongData });

			expect(screen.getByDisplayValue(longEmail)).toBeInTheDocument();
		});

		it("should handle special characters in user data", () => {
			const specialUsers: UserInviteDetails[] = [
				{
					id: "1",
					email: "test+tag@example.com",
					firstName: "José",
					lastName: "O'Brien-Smith",
				},
			];

			renderComponent({ users: specialUsers, filteredUsers: specialUsers });

			expect(screen.getByDisplayValue("test+tag@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("José")).toBeInTheDocument();
			expect(screen.getByDisplayValue("O'Brien-Smith")).toBeInTheDocument();
		});

		it("should handle users without id", () => {
			const usersWithoutId: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
				} as any,
			];

			renderComponent({ users: usersWithoutId, filteredUsers: usersWithoutId });

			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
		});
	});
});
