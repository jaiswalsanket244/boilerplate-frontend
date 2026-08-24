import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ActionsCell from "@/module/teams/components/action-cell";
import type { TeamMember } from "@/module/teams/types";
import { ROLES, STATUS } from "@/types";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { mockAddRow, resetRecentlyChangedRowsMock } from "@/tests/utils/mock-use-recently-changed-rows";

const mockHandleDelete = vi.fn();
const mockHandleResendInvitation = vi.fn();
const mockHandleChangeRole = vi.fn();
const mockHandleUpdateStatus = vi.fn();
const mockHandleDeleteInvitation = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockCurrentUser = {
	_id: "current-user-id",
	email: "admin@example.com",
	roles: ROLES.ADMIN,
	companyRef: {
		userRef: "owner-id",
	},
} as any;
const canManageTeams = true;

// Mock handlers
vi.mock("@/module/teams/utils/handlers", () => ({
	useHandlers: () => ({
		handleDelete: mockHandleDelete,
		handleResendInvitation: mockHandleResendInvitation,
		handleChangeRole: mockHandleChangeRole,
		handleUpdateStatus: mockHandleUpdateStatus,
		handleDeleteInvitation: mockHandleDeleteInvitation,
	}),
}));

// Mock query client
const mockQueryClient = {
	invalidateQueries: mockInvalidateQueries,
};

vi.mock("@tanstack/react-query", async (importOriginal) => {
	const original = await importOriginal<typeof import("@tanstack/react-query")>();
	return {
		...original,
		useQueryClient: () => mockQueryClient,
	};
});

vi.mock("@/module/teams/hooks/useRoles", () => ({
	useRolesApi: () => ({
		useRoleList: () => ({
			data: [
				{ id: "1", slug: ROLES.ADMIN, name: "Admin" },
				{ id: "2", slug: ROLES.USER, name: "User" },
			],
		}),
	}),
}));

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useForcePasswordChangeForUser: () => ({
			mutateAsync: vi.fn().mockResolvedValue({}),
		}),
	}),
}));

const createMockRow = (data: Partial<TeamMember>, status = "ACTIVE", role: string = ROLES.USER) => ({
	id: "row-1",
	index: 0,
	original: {
		_id: "user-123",
		serialNumber: 1,
		email: "test@example.com",
		name: { first: "John", last: "Doe" },
		role: role,
		createdAt: "2024-01-01",
		status: status,
		...data,
	} as TeamMember,
	getValue: (key: string) => {
		if (key === "status") return status;
		if (key === "role") return role;
		return "";
	},
	getVisibleCells: vi.fn(),
	getAllCells: vi.fn(),
	getIsSelected: vi.fn(),
	getIsSomeSelected: vi.fn(),
	toggleSelected: vi.fn(),
	getCanSelect: vi.fn(),
	getCanExpand: vi.fn(),
	getIsExpanded: vi.fn(),
	toggleExpanded: vi.fn(),
	getCanMultiSelect: vi.fn(),
	getToggleSelectedHandler: vi.fn(),
	subRows: [],
	depth: 0,
	parentId: undefined,
	columnFilters: [],
	columnFiltersMeta: {},
});

describe("ActionsCell Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		resetRecentlyChangedRowsMock();
		user = userEvent.setup();
		mockHandleDelete.mockResolvedValue({});
		mockHandleResendInvitation.mockResolvedValue({});
		mockHandleChangeRole.mockResolvedValue({});
		mockHandleUpdateStatus.mockResolvedValue({});
		mockHandleDeleteInvitation.mockResolvedValue({});
		mockInvalidateQueries.mockResolvedValue({});
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	describe("Rendering", () => {
		it("should render dropdown menu content", () => {
			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
		});
	});

	describe("Active Users Tab Actions", () => {
		it("should render all menu items for active users", () => {
			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			expect(screen.getByText("View Details")).toBeInTheDocument();
			expect(screen.getByText("Change Role")).toBeInTheDocument();
			expect(screen.getByText(/Set user as inactive/i)).toBeInTheDocument();
			expect(screen.getByText("Impersonate User")).toBeInTheDocument();
			expect(screen.getByText("Remove User")).toBeInTheDocument();
		});

		it("should navigate to user details when View Details is clicked", async () => {
			const row = createMockRow({ _id: "user-456" });
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const viewDetailsButton = screen.getByText("View Details");
			await user.click(viewDetailsButton);

			expect(mockRouter.push).toHaveBeenCalledWith("/client/user-details/user-456");
		});

		it("should change role from USER to ADMIN when Change Role is clicked", async () => {
			const row = createMockRow({}, "ACTIVE", ROLES.USER);
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			await user.selectOptions(screen.getByRole("combobox"), ROLES.ADMIN);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockHandleChangeRole).toHaveBeenCalledWith("user-123", ROLES.ADMIN);
			});
		});

		it("should change role from ADMIN to USER when Change Role is clicked", async () => {
			const row = createMockRow({}, STATUS.ACTIVE, ROLES.ADMIN);
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			await user.selectOptions(screen.getByRole("combobox"), ROLES.USER);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockHandleChangeRole).toHaveBeenCalledWith("user-123", ROLES.USER);
			});
		});

		it("should set user as inactive when Set user as inactive is clicked", async () => {
			const row = createMockRow({}, STATUS.ACTIVE, ROLES.USER);
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const setInactiveButton = screen.getByText(/Set user as inactive/i);
			await user.click(setInactiveButton);

			await waitFor(() => {
				expect(mockHandleUpdateStatus).toHaveBeenCalledWith("user-123", "INACTIVE");
			});
		});

		it("should remove user when Remove User is clicked", async () => {
			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const removeButton = screen.getByText("Remove User");
			await user.click(removeButton);

			await waitFor(() => {
				expect(mockHandleDelete).toHaveBeenCalledWith("user-123", "DELETED");
			});
		});

		it("should invalidate queries after role change", async () => {
			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockInvalidateQueries).toHaveBeenCalled();
			});
		});

		it("should add row to recently changed after successful action", async () => {
			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalledWith("updated", "row-1");
			});
		});
	});

	describe("Invited Users Tab Actions", () => {
		it("should render menu items for invited users", () => {
			const row = createMockRow({ invitedEmail: "invited@example.com" }, "PENDING");
			render(
				<ActionsCell
					row={row as any}
					tabType="invited-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			expect(screen.getByText("Resend Invitation")).toBeInTheDocument();
			expect(screen.getByText("Cancel Invitation")).toBeInTheDocument();
		});

		it("should resend invitation when Resend Invitation is clicked", async () => {
			const row = createMockRow({ email: "invited@example.com" }, "PENDING");
			render(
				<ActionsCell
					row={row as any}
					tabType="invited-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			const resendButton = screen.getByText("Resend Invitation");
			await user.click(resendButton);

			await waitFor(() => {
				expect(mockHandleResendInvitation).toHaveBeenCalledWith("invited@example.com");
			});
		});

		it("should cancel invitation when Cancel Invitation is clicked", async () => {
			const row = createMockRow({ email: "invited@example.com" }, "PENDING");
			render(
				<ActionsCell
					row={row as any}
					tabType="invited-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			const cancelButton = screen.getByText("Cancel Invitation");
			await user.click(cancelButton);

			await waitFor(() => {
				expect(mockHandleDeleteInvitation).toHaveBeenCalledWith("invited@example.com");
				expect(mockInvalidateQueries).toHaveBeenCalled();
			});
		});

		it("should use email if invitedEmail is not available", async () => {
			const row = createMockRow({ email: "test@example.com", invitedEmail: "" }, "PENDING");
			render(
				<ActionsCell
					row={row as any}
					tabType="invited-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			const resendButton = screen.getByText("Resend Invitation");
			await user.click(resendButton);

			await waitFor(() => {
				expect(mockHandleResendInvitation).toHaveBeenCalledWith("test@example.com");
			});
		});
	});

	describe("Inactive Users Tab Actions", () => {
		it("should render menu item for inactive users", () => {
			const row = createMockRow({}, "INACTIVE");
			render(
				<ActionsCell
					row={row as any}
					tabType="in-active-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			expect(screen.getByText("Set user as active")).toBeInTheDocument();
		});

		it("should set user as active when clicked", async () => {
			const row = createMockRow({}, "INACTIVE");
			render(
				<ActionsCell
					row={row as any}
					tabType="in-active-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			const setActiveButton = screen.getByText("Set user as active");
			await user.click(setActiveButton);

			await waitFor(() => {
				expect(mockHandleUpdateStatus).toHaveBeenCalledWith("user-123", "ACTIVE");
				expect(mockInvalidateQueries).toHaveBeenCalled();
			});
		});
	});

	describe("Users Tab Actions (Default)", () => {
		it("should render pending user actions when status is PENDING", () => {
			const row = createMockRow({}, "PENDING");
			render(
				<ActionsCell row={row as any} tabType="users" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			expect(screen.getByText("Resend Invitation")).toBeInTheDocument();
			expect(screen.getByText("Cancel Invitation")).toBeInTheDocument();
		});

		it("should render inactive user actions when status is INACTIVE", () => {
			const row = createMockRow({}, "INACTIVE");
			render(
				<ActionsCell row={row as any} tabType="users" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			expect(screen.getByText("Set user as active")).toBeInTheDocument();
		});

		it("should render active user actions for other statuses", () => {
			const row = createMockRow({}, "ACTIVE");
			render(
				<ActionsCell row={row as any} tabType="users" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			expect(screen.getByText("View Details")).toBeInTheDocument();
			expect(screen.getByText("Change Role")).toBeInTheDocument();
			expect(screen.getByText("Set user as inactive")).toBeInTheDocument();
		});

		it("should handle resend invitation for pending users", async () => {
			const row = createMockRow({ email: "pending@example.com" }, "PENDING");
			render(
				<ActionsCell row={row as any} tabType="users" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const resendButton = screen.getByText("Resend Invitation");
			await user.click(resendButton);

			await waitFor(() => {
				expect(mockHandleResendInvitation).toHaveBeenCalledWith("pending@example.com");
			});
		});

		it("should handle cancel invitation for pending users", async () => {
			const row = createMockRow({ _id: "pending-user" }, "PENDING");
			render(
				<ActionsCell row={row as any} tabType="users" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const cancelButton = screen.getByText("Cancel Invitation");
			await user.click(cancelButton);

			await waitFor(() => {
				expect(mockHandleDeleteInvitation).toHaveBeenCalledWith("pending-user");
				expect(mockInvalidateQueries).toHaveBeenCalled();
			});
		});
	});

	describe("Error Handling", () => {
		it("should add row to errors when action fails", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			mockHandleChangeRole.mockRejectedValue(new Error("Network error"));

			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalledWith("errors", "row-1");
			});

			consoleErrorSpy.mockRestore();
		});

		it("should log error to console when action fails", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const error = new Error("Action failed");
			mockHandleUpdateStatus.mockRejectedValue(error);

			const row = createMockRow({});
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const setInactiveButton = screen.getByText(/Set user as inactive/i);
			await user.click(setInactiveButton);

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(error);
			});

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing email gracefully", async () => {
			const row = createMockRow({ email: "", invitedEmail: "" }, "PENDING");
			render(
				<ActionsCell
					row={row as any}
					tabType="invited-users"
					canManageTeams={canManageTeams}
					currentUser={mockCurrentUser}
				/>
			);

			const resendButton = screen.getByText("Resend Invitation");
			await user.click(resendButton);

			await waitFor(() => {
				expect(mockHandleResendInvitation).toHaveBeenCalledWith("");
			});
		});

		it("should handle missing user ID gracefully", async () => {
			const row = createMockRow({ _id: "" });
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const removeButton = screen.getByText("Remove User");
			await user.click(removeButton);

			await waitFor(() => {
				expect(mockHandleDelete).toHaveBeenCalledWith("", "DELETED");
			});
		});

		it("should handle undefined role gracefully", async () => {
			const row = createMockRow({}, "ACTIVE", undefined as any);
			render(
				<ActionsCell row={row as any} tabType="active" canManageTeams={canManageTeams} currentUser={mockCurrentUser} />
			);

			const changeRoleButton = screen.getByText("Change Role");
			await user.click(changeRoleButton);

			const saveButton = screen.getByText("Save changes");
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockHandleChangeRole).toHaveBeenCalled();
			});
		});
	});
});
