import Companies from "@/module/company/templates/companies";
import { mockGet } from "@/tests/utils/mock-api-client";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { cookiesUtilsMocks } from "@/tests/utils/mock-cookies-utils";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockAddRow } from "@/tests/utils/mock-use-recently-changed-rows";
import { COOKIES, ROLES, STATUS } from "@/types";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockCompaniesData = [
	{
		items: [
			{
				_id: "company-1",
				name: "Test Company 1",
				companyStatus: STATUS.ACTIVE,
				userRef: "user-1",
				supportEmail: "support1@test.com",
			},
			{
				_id: "company-2",
				name: "Test Company 2",
				companyStatus: STATUS.INACTIVE,
				userRef: "user-2",
				supportEmail: "support2@test.com",
			},
			{
				_id: "company-3",
				name: "Test Company 3",
				companyStatus: STATUS.ACTIVE,
				userRef: "user-3",
			},
		],
		total: 100,
		page: 1,
		pageSize: 10,
	},
];

const mockUserData = {
	_id: "admin-1",
	email: "admin@test.com",
	name: {
		first: "Admin",
		last: "User",
	},
};

const mockUpdateCompanyMutate = vi.fn();

// Mock hooks
vi.mock("@/module/company/hooks/useCompany", async (importOriginal) => {
	const originalModule = await importOriginal<typeof import("@/module/company/hooks/useCompany")>();
	return {
		...originalModule,
		useCompanyAPI: () => ({
			...originalModule.useCompanyAPI(),
			useUpdateCompanyData: {
				mutate: mockUpdateCompanyMutate,
			},
		}),
	};
});

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => ({
			data: mockUserData,
		}),
	}),
}));

function renderComponent() {
	return renderWithProviders(<Companies />);
}
function getSearchInput() {
	return screen.getByTestId("search-bar-input") as HTMLInputElement;
}

describe("Companies Template - Integration Tests", () => {
	let user = userEvent.setup();
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockResolvedValue({
			data: {
				data: mockCompaniesData,
			},
		});
		setupCookies({
			[COOKIES.USER_TYPE]: "admin",
		});
		user = userEvent.setup();
	});

	afterEach(() => {
		vi.useRealTimers();
		clearCookies();
	});

	describe("Initial Rendering", () => {
		it("should render page header with title", () => {
			renderComponent();

			expect(screen.getByText("Companies")).toBeInTheDocument();
		});

		it("should render search bar", () => {
			renderComponent();

			expect(screen.getByPlaceholderText("Search anything here...")).toBeInTheDocument();
		});

		it("should render companies table", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
				expect(screen.getByText("Test Company 2")).toBeInTheDocument();
				expect(screen.getByText("Test Company 3")).toBeInTheDocument();
			});
		});

		it("should render pagination controls", () => {
			renderComponent();

			expect(screen.getByTestId("prev-page-button")).toBeInTheDocument();
			expect(screen.getByTestId("next-page-button")).toBeInTheDocument();
		});

		it("should render add company button", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.SUPER_ADMIN,
			});

			renderComponent();

			const addCompanyButton = screen.getByRole("button", { name: "Add Company" });
			expect(addCompanyButton).toBeInTheDocument();
		});
	});

	describe("Search Functionality", () => {
		it("should update search value when typing in search bar", async () => {
			renderComponent();

			const searchInput = getSearchInput();

			await user.type(searchInput, "Test Company");

			expect(searchInput.value).toBe("Test Company");
		});

		it("should debounce search input", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			renderComponent();

			const searchInput = getSearchInput();

			await user.type(searchInput, "test");

			// Search should not trigger immediately
			act(() => {
				vi.advanceTimersByTime(200);
			});

			// After debounce delay
			act(() => {
				vi.advanceTimersByTime(100);
			});

			await waitFor(() => {
				expect(searchInput).toHaveValue("test");
			});
		});

		it("should clear search when input is cleared", async () => {
			const user = userEvent.setup({ delay: null });
			renderComponent();

			const searchInput = getSearchInput();

			await user.type(searchInput, "test");
			expect(searchInput.value).toBe("test");

			await user.clear(searchInput);
			expect(searchInput.value).toBe("");
		});
	});

	describe("Pagination", async () => {
		it("should display correct page information", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Showing 1-10 of 100 results")).toBeInTheDocument();
			});
		});

		it("should have Previous button disabled on first page", () => {
			renderComponent();

			const previousButton = screen.getByTestId("prev-page-button");
			expect(previousButton).toBeDisabled();
		});

		it("should have Next button enabled when not on last page", async () => {
			renderComponent();

			await waitFor(() => {
				const nextButton = screen.getByTestId("next-page-button");
				expect(nextButton).not.toBeDisabled();
			});
		});

		it("should change page size", async () => {
			renderComponent();

			const select = screen.getByRole("combobox");
			await user.selectOptions(select, "25");

			await waitFor(() => {
				expect(screen.getByText("Showing 1-25 of 100 results")).toBeInTheDocument();
			});
		});
	});

	describe("Company Actions", async () => {
		it("should show actions for companies not matching admin email", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByTestId("view-company-company-1")).toBeInTheDocument();
				expect(screen.getByTestId("toggle-status-company-1")).toBeInTheDocument();
			});
		});

		it("should redirect to admin page when view is clicked", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});
			const viewIcon = screen.getByTestId("view-company-company-1");

			await user.click(viewIcon);

			await waitFor(() => {
				expect(cookiesUtilsMocks.setCookies).toHaveBeenCalledWith({
					[COOKIES.COMPANY_REF]: "company-1",
					[COOKIES.IS_ADMIN_PATH]: "true",
				});
				expect(mockRouter.push).toHaveBeenCalled();
			});
		});

		it("should open status dialog when toggle is clicked", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			const actionIcon = screen.getByTestId("toggle-status-company-1");

			await user.click(actionIcon);

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});
		});
	});

	describe("Status Change Dialog", () => {
		it("should show dialog when toggling company status", async () => {
			const { container } = renderComponent();

			const actionIcons = container.querySelectorAll("span.cursor-pointer");
			const toggleIcon = actionIcons[1];

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
			});
		});

		it("should close dialog when Cancel is clicked", async () => {
			const user = userEvent.setup();
			const { container } = renderComponent();

			// Open dialog
			const actionIcons = container.querySelectorAll("span.cursor-pointer");
			const toggleIcon = actionIcons[1];

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			// Click Cancel
			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			// Dialog should close (data-open should be false)
			await waitFor(() => {
				const dialog = screen.getByTestId("alert-dialog");
				expect(dialog).toHaveAttribute("data-open", "false");
			});
		});

		it("should update company status when Confirm is clicked", async () => {
			mockUpdateCompanyMutate.mockImplementation((params, { onSuccess }) => {
				onSuccess?.();
			});
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			// Open dialog for first company (ACTIVE)
			const actionIcon = screen.getByTestId("toggle-status-company-1");

			await user.click(actionIcon);

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			// Click Confirm
			const confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockUpdateCompanyMutate).toHaveBeenCalledWith(
					{
						id: "company-1",
						data: { companyStatus: STATUS.INACTIVE },
					},
					expect.any(Object)
				);
			});
		});

		it("should add row animation on successful update", async () => {
			mockUpdateCompanyMutate.mockImplementation((params, { onSuccess }) => {
				onSuccess?.();
			});
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			const actionIcons = screen.getAllByTestId(/toggle-status-/);
			const toggleIcon = actionIcons[1];

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			const confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalledWith("updated", "company-2");
			});
		});

		it("should add error row animation on failed update", async () => {
			mockUpdateCompanyMutate.mockImplementation((params, { onError }) => {
				onError?.(new Error("Update failed"));
			});
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			const actionIcons = screen.getAllByTestId(/toggle-status-/);
			const toggleIcon = actionIcons[1];

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			const confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalledWith("errors", "company-2");
			});
		});
	});

	describe("Complete Workflow", () => {
		it("should handle search, pagination, and status change workflow", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			mockUpdateCompanyMutate.mockImplementation((params, { onSuccess }) => {
				onSuccess?.();
			});

			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			// Step 1: Search for a company
			const searchInput = screen.getByPlaceholderText("Search anything here...");
			await user.type(searchInput, "Test");

			act(() => {
				vi.advanceTimersByTime(300);
			});

			// Step 2: Change page size
			const select = screen.getByRole("combobox");
			await user.selectOptions(select, "25");

			await waitFor(() => {
				expect(screen.getByText("Showing 1-25 of 100 results")).toBeInTheDocument();
			});

			// Step 3: Open status dialog

			const actionIcons = screen.getAllByTestId(/toggle-status-/);
			const toggleIcon = actionIcons[1];

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			// Step 4: Confirm status change
			const confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockUpdateCompanyMutate).toHaveBeenCalled();
				// expect(mockInvalidateQueries).toHaveBeenCalled();
				expect(mockAddRow).toHaveBeenCalledWith("updated", "company-2");
			});
		});

		it("should handle viewing multiple companies", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});
			const viewIcons = screen.getAllByTestId(/view-company/);

			// View first company
			if (viewIcons.length > 0 && viewIcons[0]) {
				await user.click(viewIcons[0]);
			}
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=company-1");

			mockRouter.push.mockClear();

			// View second company
			if (viewIcons[2]) {
				await user.click(viewIcons[2]);
			}
			expect(mockRouter.push).toHaveBeenCalledWith("/client/dashboard?companyRef=company-3");
		});

		it("should handle toggling status for multiple companies", async () => {
			mockUpdateCompanyMutate.mockImplementation((params, { onSuccess }) => {
				onSuccess?.();
			});
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Test Company 1")).toBeInTheDocument();
			});

			const actionIcons = screen.getAllByTestId(/toggle-status-/);

			// Toggle first company
			if (actionIcons.length > 0 && actionIcons[0]) {
				await user.click(actionIcons[0]);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			let confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockUpdateCompanyMutate).toHaveBeenCalledWith(
					expect.objectContaining({ id: "company-1" }),
					expect.any(Object)
				);
			});

			mockUpdateCompanyMutate.mockClear();

			// Toggle second company
			if (actionIcons.length > 0 && actionIcons[2]) {
				await user.click(actionIcons[2]);
			}

			await waitFor(() => {
				expect(screen.getByText("Change Company Status")).toBeInTheDocument();
			});

			confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockUpdateCompanyMutate).toHaveBeenCalledWith(
					expect.objectContaining({ id: "company-3", data: { companyStatus: STATUS.INACTIVE } }),
					expect.any(Object)
				);
			});
		});
	});
});
