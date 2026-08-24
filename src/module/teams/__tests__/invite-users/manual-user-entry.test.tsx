import { logRoles, render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ManualUserEntry from "@/module/teams/components/invite-users/manual-user-entry";
import type { UserInviteDetails } from "@/module/teams/types";

describe("ManualUserEntry Component", () => {
	const mockSetUsers = vi.fn();
	let user: UserEvent;

	const mockUsers: UserInviteDetails[] = [
		{
			email: "john@example.com",
			firstName: "John",
			lastName: "Doe",
		},
		{
			email: "jane@example.com",
			firstName: "Jane",
			lastName: "Smith",
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render table headers", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByText("First Name")).toBeInTheDocument();
			expect(screen.getByText("Last Name")).toBeInTheDocument();
		});

		it("should render all users", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("John")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
		});

		it("should render serial numbers", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("should render remove buttons for multiple users", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const removeIcons = screen.getAllByTestId("x-icon");
			expect(removeIcons.length).toBe(2);
		});

		it("should not render remove button for single user", () => {
			const singleUser = [mockUsers[0]!];
			render(<ManualUserEntry users={singleUser} setUsers={mockSetUsers} />);

			const removeIcons = document.querySelectorAll(".lucide-x");
			expect(removeIcons.length).toBe(0);
		});
	});

	describe("Input Handling", () => {
		it("should call setUsers when email is changed", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("john@example.com");
			await user.clear(emailInput);
			await user.type(emailInput, "newemail@example.com");

			expect(mockSetUsers).toHaveBeenCalled();
		});

		it("should call setUsers when first name is changed", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const firstNameInput = screen.getByDisplayValue("John");
			await user.clear(firstNameInput);
			await user.type(firstNameInput, "NewName");

			expect(mockSetUsers).toHaveBeenCalled();
		});

		it("should call setUsers when last name is changed", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const lastNameInput = screen.getByDisplayValue("Doe");
			await user.clear(lastNameInput);
			await user.type(lastNameInput, "NewLastName");

			expect(mockSetUsers).toHaveBeenCalled();
		});

		it("should update correct user when changing input", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("jane@example.com");
			await user.type(emailInput, "x");

			expect(mockSetUsers).toHaveBeenCalledWith(expect.any(Function));

			// Test the updater function
			const updaterFn = mockSetUsers.mock.calls[0]?.[0];
			const result = updaterFn(mockUsers.map((u) => ({ ...u })));

			expect(result[1].email).toBe("jane@example.comx");
			expect(result[0].email).toBe("john@example.com"); // First user unchanged
		});

		it("should handle typing in empty fields", async () => {
			const emptyUsers: UserInviteDetails[] = [
				{
					email: "",
					firstName: "",
					lastName: "",
				},
			];

			render(<ManualUserEntry users={emptyUsers} setUsers={mockSetUsers} />);

			const emailInputs = screen.getAllByRole("textbox");
			await user.type(emailInputs[0]!, "test@example.com");

			expect(mockSetUsers).toHaveBeenCalled();
		});
	});

	describe("Error Display", () => {
		it("should highlight email field with error", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "invalid-email",
					firstName: "John",
					lastName: "Doe",
					errors: ["Invalid email format"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("invalid-email");
			expect(emailInput).toHaveClass("border-red-300");
		});

		it("should display email error messages", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "invalid-email",
					firstName: "John",
					lastName: "Doe",
					errors: ["Invalid email format"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			expect(screen.getByText("Invalid email format")).toBeInTheDocument();
		});

		it("should highlight first name field with error", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "",
					lastName: "Doe",
					errors: ["First name is required"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			const firstNameInputs = screen.getAllByRole("textbox");
			const firstNameInput = firstNameInputs[1]; // Second input is first name
			expect(firstNameInput).toHaveClass("border-red-300");
		});

		it("should display first name error messages", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "",
					lastName: "Doe",
					errors: ["First name is required"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			expect(screen.getByText("First name is required")).toBeInTheDocument();
		});

		it("should highlight last name field with error", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "John",
					lastName: "",
					errors: ["Last name is required"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			const lastNameInputs = screen.getAllByRole("textbox");
			const lastNameInput = lastNameInputs[2]; // Third input is last name
			expect(lastNameInput).toHaveClass("border-red-300");
		});

		it("should display last name error messages", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "John",
					lastName: "",
					errors: ["Last name is required"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			expect(screen.getByText("Last name is required")).toBeInTheDocument();
		});

		it("should display multiple errors for same field", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "test",
					firstName: "John",
					lastName: "Doe",
					errors: ["Invalid email format", "Email is too short"],
				},
			];

			render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			expect(screen.getByText("Invalid email format")).toBeInTheDocument();
			expect(screen.getByText("Email is too short")).toBeInTheDocument();
		});

		it("should apply red background to row with errors", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "invalid",
					firstName: "John",
					lastName: "Doe",
					errors: ["Invalid email"],
				},
			];

			const { container } = render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			const errorRow = container.querySelector(".bg-red-50");
			expect(errorRow).toBeInTheDocument();
		});
	});

	describe("Remove Functionality", () => {
		it("should call setUsers when remove icon is clicked", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const removeIcons = screen.getAllByTestId("x-icon");
			await user.click(removeIcons[0]!);

			expect(mockSetUsers).toHaveBeenCalled();
		});

		it("should remove correct user when remove icon is clicked", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			await user.click(screen.getByTestId("remove-row-button-1"));

			// Get the filter function passed to setUsers
			const filterFn = mockSetUsers.mock.calls[0]?.[0];
			const result = filterFn(mockUsers.map((u) => ({ ...u })));

			expect(result.length).toBe(1);
			expect(result[0].email).toBe("jane@example.com");
		});

		it("should remove second user when second remove icon is clicked", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			await user.click(screen.getByTestId("remove-row-button-2"));

			const filterFn = mockSetUsers.mock.calls[0]?.[0];
			const result = filterFn(mockUsers.map((u) => ({ ...u })));

			expect(result.length).toBe(1);
			expect(result[0].email).toBe("john@example.com");
		});
	});

	describe("Input Types", () => {
		it("should have email type for email input", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("john@example.com");
			expect(emailInput).toHaveAttribute("type", "email");
		});

		it("should have text type for first name input", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const firstNameInput = screen.getByDisplayValue("John");
			logRoles(firstNameInput);
			expect(firstNameInput).toHaveAttribute("type", "text");
		});

		it("should have text type for last name input", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const lastNameInput = screen.getByDisplayValue("Doe");
			logRoles(lastNameInput);
			expect(lastNameInput).toHaveAttribute("type", "text");
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty users array", () => {
			render(<ManualUserEntry users={[]} setUsers={mockSetUsers} />);

			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		});

		it("should handle users with empty strings", () => {
			const emptyUsers: UserInviteDetails[] = [
				{
					email: "",
					firstName: "",
					lastName: "",
				},
			];

			render(<ManualUserEntry users={emptyUsers} setUsers={mockSetUsers} />);

			const inputs = screen.getAllByRole("textbox");
			expect(inputs.length).toBe(3);
		});

		it("should handle very long user data", () => {
			const longEmail = "a".repeat(100) + "@example.com";
			const longName = "B".repeat(100);

			const longUsers: UserInviteDetails[] = [
				{
					email: longEmail,
					firstName: longName,
					lastName: longName,
				},
			];

			render(<ManualUserEntry users={longUsers} setUsers={mockSetUsers} />);

			expect(screen.getByDisplayValue(longEmail)).toBeInTheDocument();
		});

		it("should handle special characters in user data", () => {
			const specialUsers: UserInviteDetails[] = [
				{
					email: "test+tag@example.com",
					firstName: "José",
					lastName: "O'Brien-Smith",
				},
			];

			render(<ManualUserEntry users={specialUsers} setUsers={mockSetUsers} />);

			expect(screen.getByDisplayValue("test+tag@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("José")).toBeInTheDocument();
			expect(screen.getByDisplayValue("O'Brien-Smith")).toBeInTheDocument();
		});

		it("should handle large number of users", () => {
			const manyUsers = Array.from({ length: 100 }, (_, i) => ({
				email: `user${i}@example.com`,
				firstName: `First${i}`,
				lastName: `Last${i}`,
			}));

			render(<ManualUserEntry users={manyUsers} setUsers={mockSetUsers} />);

			expect(screen.getByText("100")).toBeInTheDocument();
		});

		it("should handle users without errors property", () => {
			const usersWithoutErrors: UserInviteDetails[] = [
				{
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
				},
			];

			render(<ManualUserEntry users={usersWithoutErrors} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("test@example.com");
			expect(emailInput).not.toHaveClass("border-red-300");
		});

		it("should handle undefined in users array", () => {
			const usersWithUndefined = [mockUsers[0], undefined, mockUsers[1]] as any;

			expect(() => {
				render(<ManualUserEntry users={usersWithUndefined} setUsers={mockSetUsers} />);
			}).not.toThrow();
		});
	});

	describe("Styling", () => {
		it("should apply correct styling to inputs", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const emailInput = screen.getByDisplayValue("john@example.com");
			expect(emailInput).toHaveClass("bg-muted/70");
		});

		it("should apply correct styling to table cells", () => {
			const { container } = render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const tableCells = container.querySelectorAll("td");
			expect(tableCells.length).toBeGreaterThan(0);
		});

		it("should apply correct styling to error text", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "invalid",
					firstName: "John",
					lastName: "Doe",
					errors: ["Invalid email"],
				},
			];

			const { container } = render(<ManualUserEntry users={usersWithErrors} setUsers={mockSetUsers} />);

			const errorText = container.querySelector(".text-red-500");
			expect(errorText).toHaveClass("text-xs", "mt-1");
		});
	});

	describe("Accessibility", () => {
		it("should have accessible inputs", () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const inputs = screen.getAllByRole("textbox");
			inputs.forEach((input) => {
				expect(input).toBeInTheDocument();
			});
		});

		it("should be keyboard navigable", async () => {
			render(<ManualUserEntry users={mockUsers} setUsers={mockSetUsers} />);

			const inputs = screen.getAllByRole("textbox");

			await user.tab();
			expect(inputs[0]).toHaveFocus();

			await user.tab();
			expect(inputs[1]).toHaveFocus();
		});
	});
});
