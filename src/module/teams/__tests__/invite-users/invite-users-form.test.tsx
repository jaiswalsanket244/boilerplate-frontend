import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InviteUsersForm } from "@/module/teams/components/invite-users/invite-users-form";
import type { UserInviteDetails } from "@/module/teams/types";
import { IMPORT_TYPE } from "@/module/teams/types";

describe("InviteUsersForm Component", () => {
	const mockSetUsers = vi.fn();
	const mockSetActiveTab = vi.fn();

	const mockUsers: UserInviteDetails[] = [
		{
			email: "test@example.com",
			firstName: "Test",
			lastName: "User",
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render tabs", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Add Manually")).toBeInTheDocument();
			expect(screen.getByText("Import from Excel")).toBeInTheDocument();
		});

		it("should render manual entry tab content when active", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			// ManualUserEntry should be rendered
			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
		});

		it("should render import tab content when active", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			// ExcelUserImport should be rendered
			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});
	});

	describe("Tab Switching", () => {
		it("should call setActiveTab when manual tab is clicked", async () => {
			const user = userEvent.setup();
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const manualTab = screen.getByText("Add Manually");
			await user.click(manualTab);

			expect(mockSetActiveTab).toHaveBeenCalledWith(IMPORT_TYPE.manual);
		});

		it("should call setActiveTab when import tab is clicked", async () => {
			const user = userEvent.setup();
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const importTab = screen.getByText("Import from Excel");
			await user.click(importTab);

			expect(mockSetActiveTab).toHaveBeenCalledWith(IMPORT_TYPE.import);
		});

		it("should display correct active tab", () => {
			const { rerender } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("S.No.")).toBeInTheDocument();

			rerender(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});
	});

	describe("Props Passing", () => {
		it("should pass users and setUsers to ManualUserEntry", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			// Verify ManualUserEntry receives the data
			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
		});

		it("should pass users and setUsers to ExcelUserImport", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			// ExcelUserImport should be rendered with props
			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
		});

		it("should handle empty users array", () => {
			render(
				<InviteUsersForm
					users={[]}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("S.No.")).toBeInTheDocument();
		});

		it("should handle multiple users", () => {
			const multipleUsers: UserInviteDetails[] = [
				{ email: "user1@example.com", firstName: "User1", lastName: "One" },
				{ email: "user2@example.com", firstName: "User2", lastName: "Two" },
				{ email: "user3@example.com", firstName: "User3", lastName: "Three" },
			];

			render(
				<InviteUsersForm
					users={multipleUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByDisplayValue("user1@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("user2@example.com")).toBeInTheDocument();
			expect(screen.getByDisplayValue("user3@example.com")).toBeInTheDocument();
		});
	});

	describe("Tab Content Visibility", () => {
		it("should only show manual content when manual tab is active", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("S.No.")).toBeInTheDocument();
			expect(screen.queryByText("Drag & drop your Excel file or")).not.toBeInTheDocument();
		});

		it("should only show import content when import tab is active", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Drag & drop your Excel file or")).toBeInTheDocument();
			expect(screen.queryByText("S.No.")).not.toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should apply correct container styling", () => {
			const { container } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const containerDiv = container.querySelector(".flex.flex-col.gap-4");
			expect(containerDiv).toBeInTheDocument();
		});

		it("should have full width tabs", () => {
			const { container } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const tabs = container.querySelector(".w-full");
			expect(tabs).toBeInTheDocument();
		});

		it("should have grid layout for tab triggers", () => {
			const { container } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const tabsList = container.querySelector(".grid.w-full.grid-cols-2");
			expect(tabsList).toBeInTheDocument();
		});

		it("should apply spacing to tab content", () => {
			const { container } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const tabContent = container.querySelector(".space-y-4");
			expect(tabContent).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle undefined activeTab", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={undefined as any}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Add Manually")).toBeInTheDocument();
		});

		it("should handle invalid activeTab value", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={"invalid" as any}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Add Manually")).toBeInTheDocument();
		});

		it("should handle rapid tab switching", async () => {
			const user = userEvent.setup();
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const importTab = screen.getByText("Import from Excel");
			const manualTab = screen.getByText("Add Manually");

			for (let i = 0; i < 5; i++) {
				await user.click(importTab);
				await user.click(manualTab);
			}

			expect(mockSetActiveTab).toHaveBeenCalledTimes(10);
		});

		it("should handle users with errors", () => {
			const usersWithErrors: UserInviteDetails[] = [
				{
					email: "invalid",
					firstName: "",
					lastName: "User",
					errors: ["Invalid email", "First name required"],
				},
			];

			render(
				<InviteUsersForm
					users={usersWithErrors}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByText("Invalid email")).toBeInTheDocument();
		});

		it("should handle null users", () => {
			expect(() => {
				render(
					<InviteUsersForm
						users={null as any}
						setUsers={mockSetUsers}
						activeTab={IMPORT_TYPE.manual}
						setActiveTab={mockSetActiveTab}
					/>
				);
			}).not.toThrow();
		});
	});

	describe("Integration", () => {
		it("should maintain state when switching tabs", async () => {
			const user = userEvent.setup();
			const { rerender } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

			rerender(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.import}
					setActiveTab={mockSetActiveTab}
				/>
			);

			rerender(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
		});

		it("should update when users prop changes", () => {
			const { rerender } = render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

			const newUsers: UserInviteDetails[] = [
				{
					email: "new@example.com",
					firstName: "New",
					lastName: "User",
				},
			];

			rerender(
				<InviteUsersForm
					users={newUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			expect(screen.getByDisplayValue("new@example.com")).toBeInTheDocument();
			expect(screen.queryByDisplayValue("test@example.com")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have accessible tab controls", () => {
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			const manualTab = screen.getByText("Add Manually");
			const importTab = screen.getByText("Import from Excel");

			expect(manualTab).toBeInTheDocument();
			expect(importTab).toBeInTheDocument();
		});

		it("should be keyboard navigable", async () => {
			const user = userEvent.setup();
			render(
				<InviteUsersForm
					users={mockUsers}
					setUsers={mockSetUsers}
					activeTab={IMPORT_TYPE.manual}
					setActiveTab={mockSetActiveTab}
				/>
			);

			await user.tab();

			const manualTab = screen.getByText("Add Manually");
			expect(manualTab).toHaveFocus();
		});
	});
});
