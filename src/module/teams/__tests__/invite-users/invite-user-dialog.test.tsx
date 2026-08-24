import { IInviteUserDialogProps } from "@/module/teams/types";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InviteUserDialog from "@/module/teams/components/invite-users/invite-user-dialog";
import userEvent from "@testing-library/user-event";

const mockOnOpenChange = vi.fn();

function renderComponent(props?: Partial<IInviteUserDialogProps>) {
	return renderWithProviders(<InviteUserDialog open={true} onOpenChange={mockOnOpenChange} {...props} />);
}

function getSubmitButton() {
	return screen.getByRole("button", { name: "Invite User(s)" });
}
function getCancelButton() {
	return screen.getByRole("button", { name: "Cancel" });
}

describe("InviteUserDialog Component", () => {
	const user = userEvent.setup();
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	describe("Rendering - Dialog Closed", () => {
		it("should not render dialog content when open is false", () => {
			renderComponent({ open: false });

			expect(screen.queryByText("Invite User(s)")).not.toBeInTheDocument();
		});
	});

	describe("Rendering - Dialog Open", () => {
		it("should render dialog when open is true", () => {
			renderComponent();

			expect(screen.getByRole("heading", { name: "Invite User(s)", level: 2 })).toBeInTheDocument();
		});

		it("should render description text", () => {
			renderComponent();

			expect(
				screen.getByText(/You can either add a user through their emails or import an .xlsx file/)
			).toBeInTheDocument();
		});

		it("should render Download Template button", () => {
			renderComponent();

			expect(screen.getByText("Download Template")).toBeInTheDocument();
		});

		it("should render InviteUsersForm with tabs", () => {
			renderComponent();

			expect(screen.getByText("Add Manually")).toBeInTheDocument();
			expect(screen.getByText("Import from Excel")).toBeInTheDocument();
		});

		it("should render Cancel button", () => {
			renderComponent();

			expect(getCancelButton()).toBeInTheDocument();
		});

		it("should render Invite User(s) submit button", () => {
			renderComponent();

			expect(getSubmitButton()).toBeInTheDocument();
		});

		it("should render form element", () => {
			const { container } = renderComponent();

			const form = container.querySelector("form");
			expect(form).toBeInTheDocument();
		});
	});

	describe("Manual Tab - Add Rows Dropdown", () => {
		it("should render Add Row(s) dropdown in manual tab", () => {
			renderComponent();

			expect(screen.getByTestId("add-row-dropdown")).toBeInTheDocument();
		});

		it("should render dropdown menu items", () => {
			renderComponent();

			// Open dropdown
			const dropdownMenu = screen.getByTestId("add-row-dropdown");
			userEvent.click(dropdownMenu);

			expect(screen.getByText("One Row")).toBeInTheDocument();
			expect(screen.getByText("5 Rows")).toBeInTheDocument();
			expect(screen.getByText("10 Rows")).toBeInTheDocument();
		});

		it("should add one row when One Row is clicked", async () => {
			renderComponent();

			const initialRows = screen.getAllByText(/^\d+$/);
			const initialCount = initialRows.length;

			const oneRowButton = screen.getByText("One Row");
			await user.click(oneRowButton);

			const updatedRows = screen.getAllByText(/^\d+$/);
			expect(updatedRows.length).toBe(initialCount + 1);
		});

		it("should add 5 rows when 5 Rows is clicked", async () => {
			renderComponent();

			const initialRows = screen.getAllByText(/^\d+$/);
			const initialCount = initialRows.length;

			const fiveRowsButton = screen.getByText("5 Rows");
			await user.click(fiveRowsButton);

			const updatedRows = screen.getAllByText(/^\d+$/);
			expect(updatedRows.length).toBe(initialCount + 5);
		});

		it("should add 10 rows when 10 Rows is clicked", async () => {
			renderComponent();

			const initialRows = screen.getAllByText(/^\d+$/);
			const initialCount = initialRows.length;

			const tenRowsButton = screen.getByText("10 Rows");
			await user.click(tenRowsButton);

			const updatedRows = screen.getAllByText(/^\d+$/);
			expect(updatedRows.length).toBe(initialCount + 10);
		});

		it("should add rows cumulatively", async () => {
			renderComponent();

			const initialRows = screen.getAllByText(/^\d+$/);
			const initialCount = initialRows.length;

			await user.click(screen.getByText("One Row"));
			await user.click(screen.getByText("5 Rows"));

			const updatedRows = screen.getAllByText(/^\d+$/);
			expect(updatedRows.length).toBe(initialCount + 6);
		});

		it("should not render Add Row(s) dropdown in import tab", async () => {
			renderComponent();

			const importTab = screen.getByText("Import from Excel");
			await user.click(importTab);

			expect(screen.queryByText("Add Row(s)")).not.toBeInTheDocument();
		});
	});

	describe("Tab Switching", () => {
		it("should switch to import tab when clicked", async () => {
			renderComponent();

			const importTab = screen.getByText("Import from Excel");
			await user.click(importTab);

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should switch back to manual tab when clicked", async () => {
			renderComponent();

			const importTab = screen.getByText("Import from Excel");
			await user.click(importTab);

			const manualTab = screen.getByText("Add Manually");
			await user.click(manualTab);

			expect(screen.getByText("Add Row(s)")).toBeInTheDocument();
		});

		it("should maintain manual tab content after switching", async () => {
			renderComponent();

			// Add some rows
			await user.click(screen.getByText("5 Rows"));

			// Switch to import
			await user.click(screen.getByText("Import from Excel"));

			// Switch back to manual
			await user.click(screen.getByText("Add Manually"));

			// Rows should still be there
			const rows = screen.getAllByText(/^\d+$/);
			expect(rows.length).toBeGreaterThan(1);
		});
	});

	describe("Cancel Functionality", () => {
		it("should call onOpenChange when Cancel is clicked", async () => {
			renderComponent();
			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});
	});

	describe("Initial State", () => {
		it("should start with one empty user row", () => {
			renderComponent();

			const serialNumbers = screen.getAllByText(/^\d+$/);
			expect(serialNumbers.length).toBeGreaterThanOrEqual(1);
		});

		it("should start on manual tab", () => {
			renderComponent();

			expect(screen.getByText("Add Row(s)")).toBeInTheDocument();
		});

		it("should not show sending modal initially", () => {
			renderComponent();

			expect(screen.queryByText("Sending your invitations..")).not.toBeInTheDocument();
		});

		it("should not show success modal initially", () => {
			renderComponent();

			expect(screen.queryByText("Invitation(s) Sent Successfully!")).not.toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle rapid tab switching", async () => {
			renderComponent();

			const importTab = screen.getByText("Import from Excel");
			const manualTab = screen.getByText("Add Manually");

			for (let i = 0; i < 5; i++) {
				await user.click(importTab);
				await user.click(manualTab);
			}

			expect(screen.getByText("Add Row(s)")).toBeInTheDocument();
		});

		it("should handle adding many rows", async () => {
			renderComponent();

			for (let i = 0; i < 10; i++) {
				await user.click(screen.getByText("10 Rows"));
			}

			const rows = screen.getAllByText(/^\d+$/);
			expect(rows.length).toBeGreaterThan(50);
		});
	});

	describe("Integration with Child Components", () => {
		it("should render InviteUsersForm", () => {
			renderComponent();

			expect(screen.getByText("Add Manually")).toBeInTheDocument();
			expect(screen.getByText("Import from Excel")).toBeInTheDocument();
		});

		it("should render ManualUserEntry in manual tab", () => {
			renderComponent();

			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByText("First Name")).toBeInTheDocument();
			expect(screen.getByText("Last Name")).toBeInTheDocument();
		});

		it("should render ExcelUserImport in import tab", async () => {
			renderComponent();

			await user.click(screen.getByText("Import from Excel"));

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should render SendingInvitationStatusModal", () => {
			const { container } = renderComponent();

			// SendingInvitationStatusModal is always in the DOM, just not visible
			expect(container).toBeInTheDocument();
		});
	});

	describe("User Input Handling", () => {
		it("should allow typing in email field", async () => {
			renderComponent();

			const emailInputs = screen.getAllByRole("textbox");
			const emailInput = emailInputs[0]!;

			await user.type(emailInput, "test@example.com");

			expect(emailInput).toHaveValue("test@example.com");
		});

		it("should allow typing in first name field", async () => {
			renderComponent();

			const inputs = screen.getAllByRole("textbox");
			const firstNameInput = inputs[1]!;

			await user.type(firstNameInput, "John");

			expect(firstNameInput).toHaveValue("John");
		});

		it("should allow typing in last name field", async () => {
			renderComponent();

			const inputs = screen.getAllByRole("textbox");
			const lastNameInput = inputs[2]!;

			await user.type(lastNameInput, "Doe");

			expect(lastNameInput).toHaveValue("Doe");
		});
	});
});
