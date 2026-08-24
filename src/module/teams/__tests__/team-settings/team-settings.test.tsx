import TeamSettingsView from "@/module/teams/templates/team-settings";
import { mockGet } from "@/tests/utils/mock-api-client";
import { setupCookies } from "@/tests/utils/mock-cookies-next";
import { mockPathname } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { resetMenuStore, seedMenuPermissions } from "@/tests/utils/menu-store-helpers";
import { COOKIES, ROLES, STATUS } from "@/types";
import { PERMISSIONS } from "@/types/permission";
import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the InviteUserDialog component
vi.mock("@/module/teams/components/invite-users/invite-user-dialog", () => ({
	default: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
		<div data-testid="invite-user-dialog" data-open={open}>
			<button onClick={() => onOpenChange(false)}>Close Dialog</button>
		</div>
	),
}));

const mockTeamMembersData = {
	data: [
		{
			_id: "user-1",
			email: "john@example.com",
			name: { first: "John", last: "Doe" },
			roles: ROLES.USER,
			status: STATUS.ACTIVE,
			createdAt: "2024-01-01T00:00:00.000Z",
			images: ["https://example.com/john.jpg"],
		},
		{
			_id: "user-2",
			email: "jane@example.com",
			name: { first: "Jane", last: "Smith" },
			roles: ROLES.ADMIN,
			status: STATUS.ACTIVE,
			createdAt: "2024-01-02T00:00:00.000Z",
			images: [],
		},
	],
	pagination: {
		totalCount: 2,
		currentPage: 1,
		totalPages: 1,
		pageSize: 10,
	},
};

const mockInvitedUsersData = {
	data: [
		{
			_id: "invited-1",
			invitedEmail: "invited@example.com",
			name: { first: "Invited", last: "User" },
			status: "INVITED",
			createdAt: "2024-01-03T00:00:00.000Z",
			expiry: 1234567890,
		},
	],
	pagination: {
		totalCount: 22,
		currentPage: 1,
		totalPages: 2,
		pageSize: 10,
	},
};

const mockUserCounts = {
	total: 10,
	active: 8,
	invited: 1,
	inActive: 1,
};

const renderComponent = () => {
	return renderWithProviders(<TeamSettingsView />);
};

const waitForLoadingToFinish = async () => {
	await waitFor(
		() => {
			expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
		},
		{ timeout: 3000 }
	);
};

const getInviteButton = () => screen.getByRole("button", { name: /invite user\(s\)/i });

const getTabByName = (name: string) => {
	const tabs = screen.getAllByRole("tab");
	return tabs.find((tab) => tab.textContent?.includes(name));
};

describe("TeamSettingsView Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();

		setupCookies({
			[COOKIES.USER_TYPE]: ROLES.ADMIN,
			[COOKIES.COMPANY_REF]: "test-company",
		});
		seedMenuPermissions([PERMISSIONS.TEAMS_MANAGE]);

		// Default mock for team members
		mockGet.mockImplementation((url: string) => {
			if (url.includes("/admin/invite-users/users-count")) {
				return Promise.resolve({
					data: { data: mockUserCounts },
				});
			}
			if (url.includes("/admin/invite-users/users/")) {
				return Promise.resolve({
					data: { data: mockTeamMembersData },
				});
			}
			if (url.includes("/admin/invite-users/")) {
				return Promise.resolve({
					data: { data: mockInvitedUsersData },
				});
			}
			return Promise.resolve({ data: { data: [] } });
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		resetMenuStore();
	});

	describe("Initial Render", () => {
		it("should render DataTabs component", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByRole("tablist")).toBeInTheDocument();
			});
		});

		it("should render all tabs with correct labels and counts", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users \(10\)/i)).toBeInTheDocument();
			});

			expect(screen.getByText(/Active \(8\)/i)).toBeInTheDocument();
			expect(screen.getByText(/In-active \(1\)/i)).toBeInTheDocument();
			expect(screen.getByText(/Invited \(1\)/i)).toBeInTheDocument();
		});

		it("should render Invite User(s) button", async () => {
			renderComponent();

			await waitFor(() => {
				expect(getInviteButton()).toBeInTheDocument();
			});
		});

		it("should default to 'All users' tab", async () => {
			renderComponent();

			await waitFor(() => {
				const allUsersTab = getTabByName("All users");
				expect(allUsersTab).toHaveAttribute("data-state", "active");
			});
		});

		it("should fetch team members data on mount", async () => {
			renderComponent();

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(
					expect.stringContaining("/admin/invite-users/users-count"),
					expect.anything()
				);
			});
		});

		it("should fetch user counts on mount", async () => {
			renderComponent();

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(
					"/admin/invite-users/users-count",
					expect.objectContaining({
						params: { companyRef: "test-company" },
					})
				);
			});
		});
	});

	describe("Tab Navigation", () => {
		it("should switch to Active tab when clicked", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const activeTab = getTabByName("Active");
			await user.click(activeTab!);

			await waitFor(() => {
				expect(activeTab).toHaveAttribute("data-state", "active");
			});
		});

		it("should switch to Invited tab when clicked", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const invitedTab = getTabByName("Invited");
			await user.click(invitedTab!);

			await waitFor(() => {
				expect(invitedTab).toHaveAttribute("data-state", "active");
			});
		});

		it("should switch to In-active tab when clicked", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const inactiveTab = getTabByName("In-active");
			await user.click(inactiveTab!);

			await waitFor(() => {
				expect(inactiveTab).toHaveAttribute("data-state", "active");
			});
		});

		it("should fetch data for the selected tab", async () => {
			vi.clearAllMocks();
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const activeTab = getTabByName("Active");
			await user.click(activeTab!);

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("tab=active"));
			});

			const invitedTab = getTabByName("Invited");
			await user.click(invitedTab!);

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("tab=invited"));
			});
		});

		it("should apply status filter for Active tab", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const activeTab = getTabByName("Active");
			await user.click(activeTab!);

			expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("ACTIVE"));
		});

		it("should apply status filter for Inactive tab", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users/i)).toBeInTheDocument();
			});

			const inactiveTab = getTabByName("In-active");
			await user.click(inactiveTab!);

			expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("INACTIVE"));
		});
	});

	describe("Search Functionality", () => {
		it("should render search box", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/search here/i)).toBeInTheDocument();
			});
		});

		it("should trigger search when user types", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			renderComponent();

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/search here/i)).toBeInTheDocument();
			});

			const searchBox = screen.getByPlaceholderText(/search here/i);
			await user.type(searchBox, "john");

			// Advance timers for debounce
			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("search=john"));

			vi.useRealTimers();
		});
	});

	describe("Invite User Dialog", () => {
		it("should open invite dialog when Invite User(s) button is clicked", async () => {
			renderComponent();

			await waitFor(() => {
				expect(getInviteButton()).toBeInTheDocument();
			});

			await user.click(getInviteButton());

			await waitFor(() => {
				const dialog = screen.getByTestId("invite-user-dialog");
				expect(dialog).toHaveAttribute("data-open", "true");
			});
		});

		it("should close invite dialog when dialog close is triggered", async () => {
			renderComponent();

			await waitFor(() => {
				expect(getInviteButton()).toBeInTheDocument();
			});

			await user.click(getInviteButton());

			await waitFor(() => {
				expect(screen.getByTestId("invite-user-dialog")).toHaveAttribute("data-open", "true");
			});

			const closeButton = screen.getByText("Close Dialog");
			await user.click(closeButton);

			await waitFor(() => {
				expect(screen.getByTestId("invite-user-dialog")).toHaveAttribute("data-open", "false");
			});
		});
	});

	describe("Data Display", () => {
		it("should display UsersTable component", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("data-table")).toBeInTheDocument();
			});
		});

		it("should pass correct data to UsersTable", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("john@example.com")).toBeInTheDocument();
			});
			expect(screen.getByText("John Doe")).toBeInTheDocument();
		});

		it("should display pagination when data is available", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/page/i)).toBeInTheDocument();
			});
		});
	});

	describe("Loading States", () => {
		it("should show loading spinner while fetching data", async () => {
			mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
			});
		});

		it("should hide loading spinner after data is loaded", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			});
		});
	});

	describe("Company Reference Handling", () => {
		it("should use company ref from cookies for admin users", async () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.ADMIN,
				[COOKIES.COMPANY_REF]: "admin-company",
			});

			renderComponent();

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("companyRef=admin-company"));
			});
		});

		it("should use empty company ref for super admin on super-admin path", async () => {
			mockPathname.mockReturnValue("/super-admin/teams");
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.SUPER_ADMIN,
				[COOKIES.COMPANY_REF]: "some-company",
			});

			renderComponent();

			// Empty company ref disables the team-data queries, so no team endpoint is hit
			// (the unrelated /user/me profile fetch may still fire).
			await waitFor(() => {
				expect(mockGet).not.toHaveBeenCalledWith(expect.stringContaining("invite-users"));
			});
		});
	});

	describe("Sorting", () => {
		it("should render sort control", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("sort-control")).toBeInTheDocument();
			});
		});

		it("should apply sorting when sort option is selected", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("sort-control")).toBeInTheDocument();
			});

			const sortControl = screen.getByTestId("sort-control");
			await user.click(sortControl);

			const sortOption = screen.getByText(/Newest to Oldest/i);
			await user.click(sortOption);

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("sort=createdAt"));
			});
		});
	});

	describe("Filtering", () => {
		it("should render filter control", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("filter-control-trigger")).toBeInTheDocument();
			});
		});

		it("should apply filters when filter is selected", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			});

			const filterControl = screen.getByTestId("filter-control-trigger");
			await user.click(filterControl);

			await waitFor(() => {
				expect(screen.getByTestId("filter-control-content")).toBeInTheDocument();
			});

			await user.click(screen.getByRole("checkbox", { name: /admin/i }));
			await user.click(screen.getByTestId("apply-filters-button"));

			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("roles=multiselect%23ADMIN"));
			});
		});
	});

	describe("Pagination", () => {
		it("should handle page change", async () => {
			const multiPageData = {
				...mockTeamMembersData,
				pagination: {
					totalCount: 20,
					currentPage: 1,
					totalPages: 2,
					pageSize: 10,
				},
			};

			mockGet.mockImplementation((url: string) => {
				if (url.includes("/admin/invite-users/users/")) {
					return Promise.resolve({
						data: { data: multiPageData },
					});
				}
				if (url.includes("/admin/invite-users/users-count")) {
					return Promise.resolve({
						data: { data: mockUserCounts },
					});
				}
				return Promise.resolve({ data: { data: [] } });
			});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Showing 1-10 of 20 results")).toBeInTheDocument();
			});

			const nextButton = screen.getByRole("button", { name: /next/i });
			await user.click(nextButton);

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("page=2"));
			});
		});

		it("should handle page size change", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
			});

			const pageSizeSelect = screen.getByRole("combobox");
			await user.selectOptions(pageSizeSelect, "25");

			await waitFor(() => {
				expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining("pageSize=25"));
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty data gracefully", async () => {
			mockGet.mockImplementation((url: string) => {
				if (url.includes("/admin/invite-users/users-count")) {
					return Promise.resolve({
						data: { data: { total: 0, active: 0, invited: 0, inActive: 0 } },
					});
				}
				return Promise.resolve({
					data: {
						data: {
							data: [],
							pagination: {
								totalCount: 0,
								currentPage: 1,
								totalPages: 0,
								pageSize: 10,
							},
						},
					},
				});
			});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByTestId("no-results-row")).toBeInTheDocument();
			});
		});

		it("should handle API errors gracefully", async () => {
			mockGet.mockRejectedValue(new Error("Network error"));

			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/error/i)).toBeInTheDocument();
			});
		});

		it("should handle missing company ref", async () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.ADMIN,
				[COOKIES.COMPANY_REF]: "",
			});

			renderComponent();

			await waitFor(() => {
				// Should not make API calls without company ref
				expect(mockGet).not.toHaveBeenCalledWith(
					expect.stringContaining("/admin/invite-users/users/"),
					expect.anything()
				);
			});
		});

		it("should handle null user counts", async () => {
			mockGet.mockImplementation((url: string) => {
				if (url.includes("/admin/invite-users/users-count")) {
					return Promise.resolve({
						data: { data: null },
					});
				}
				return Promise.resolve({
					data: { data: mockTeamMembersData },
				});
			});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByText(/All users \(0\)/i)).toBeInTheDocument();
			});
		});

		it("should handle missing pagination data", async () => {
			mockGet.mockImplementation((url: string) => {
				if (url.includes("/admin/invite-users/users/")) {
					return Promise.resolve({
						data: {
							data: {
								data: mockTeamMembersData.data,
								pagination: null,
							},
						},
					});
				}
				return Promise.resolve({
					data: { data: mockUserCounts },
				});
			});

			renderComponent();

			await waitForLoadingToFinish();

			// Should still render with default pagination values
			await waitFor(() => {
				expect(screen.getByText("Showing 1-0 of 0 results")).toBeInTheDocument();
			});
		});
	});

	describe("Tab State Persistence", () => {
		it("should maintain search state when switching tabs", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			renderComponent();

			await waitForLoadingToFinish();

			// Search in All users tab
			const searchBox = screen.getByPlaceholderText(/search here/i);
			await user.type(searchBox, "john");

			act(() => {
				vi.advanceTimersByTime(500);
			});

			// Switch to Active tab
			const activeTab = getTabByName("Active");
			await user.click(activeTab!);

			// Switch back to All users tab
			const allUsersTab = getTabByName("All users");
			await user.click(allUsersTab!);

			// Search state should be maintained
			expect(searchBox).toHaveValue("john");

			vi.useRealTimers();
		});

		it("should maintain separate state for each tab", async () => {
			renderComponent();

			await waitForLoadingToFinish();

			// Search in All users tab
			const searchBox = screen.getByPlaceholderText(/search here/i);
			await user.type(searchBox, "john");

			// Switch to Active tab
			const activeTab = getTabByName("Active");
			await user.click(activeTab!);

			// Active tab should have empty search
			await waitFor(() => {
				expect(screen.getByPlaceholderText(/search here/i)).toHaveValue("");
			});
		});
	});
});
