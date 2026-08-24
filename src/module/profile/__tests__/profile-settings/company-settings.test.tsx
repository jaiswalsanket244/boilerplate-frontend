import CompanySettings from "@/module/profile/templates/company-settings";
import { routes } from "@/config/routes";
import { mockRouter } from "@/tests/utils/mock-next-navigation";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { PERMISSIONS } from "@/types/permission";
import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateCompanyMutateAsync = vi.fn();

let mockUserDataResult: {
	data?: unknown;
	isLoading?: boolean;
	error?: unknown;
	isPending?: boolean;
};

vi.mock("@/module/profile/hooks/useProfile", () => ({
	useProfileAPI: () => ({
		useGetUserData: () => mockUserDataResult,
		useUpdateCompany: { mutateAsync: mockUpdateCompanyMutateAsync },
	}),
}));

// Danger zone has its own API dependencies; stub it out to isolate this template.
vi.mock("@/module/profile/components/company-danger-zone", () => ({
	default: () => <div data-testid="company-danger-zone" />,
}));

const adminUserData = {
	permissions: [PERMISSIONS.COMPANY_MANAGE],
	companyRef: {
		_id: "company-1",
		supportEmail: "support@company.com",
		rotatePassword: false,
		passwordValidityDays: 90,
		passwordGraceDays: 5,
	},
};

const getSupportEmailField = () => screen.getByLabelText(/support email/i) as HTMLInputElement;

describe("CompanySettings component", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
		mockUpdateCompanyMutateAsync.mockResolvedValue(undefined);
		mockUserDataResult = { data: adminUserData, isLoading: false, error: null, isPending: false };
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Loading and Error States", () => {
		it("should show loading spinner while fetching user data", () => {
			mockUserDataResult = { data: undefined, isLoading: true };

			renderWithProviders(<CompanySettings />);

			expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		});

		it("should show error message when user data fails to load", () => {
			mockUserDataResult = { data: undefined, isLoading: false, error: new Error("Failed to load company") };

			renderWithProviders(<CompanySettings />);

			expect(screen.getByText("Failed to load company")).toBeInTheDocument();
		});
	});

	describe("Access Control", () => {
		it("should render company settings for users with company:manage permission", async () => {
			renderWithProviders(<CompanySettings />);

			expect(screen.getByText("Company Settings")).toBeInTheDocument();

			await waitFor(() => {
				expect(getSupportEmailField()).toHaveValue("support@company.com");
			});
		});

		it("should redirect users without company:manage permission to profile settings", () => {
			mockUserDataResult = {
				data: { permissions: [], companyRef: adminUserData.companyRef },
				isLoading: false,
			};

			renderWithProviders(<CompanySettings />);

			expect(mockRouter.push).toHaveBeenCalledWith(routes.settings.profile);
			expect(screen.queryByText("Company Settings")).not.toBeInTheDocument();
		});
	});

	describe("Password Rotation", () => {
		it("should reveal validity and grace period fields when password rotation is enabled", async () => {
			renderWithProviders(<CompanySettings />);

			expect(screen.queryByLabelText(/password validity days/i)).not.toBeInTheDocument();

			await user.click(screen.getByRole("switch"));

			expect(screen.getByLabelText(/password validity days/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/grace period days/i)).toBeInTheDocument();
		});
	});

	describe("Form Submission", () => {
		it("should keep save button disabled until the form is changed", async () => {
			renderWithProviders(<CompanySettings />);

			await waitFor(() => {
				expect(getSupportEmailField()).toHaveValue("support@company.com");
			});

			expect(screen.getByTestId("save-changes-button")).toBeDisabled();
		});

		it("should submit updated company settings for an admin", async () => {
			renderWithProviders(<CompanySettings />);

			await waitFor(() => {
				expect(getSupportEmailField()).toHaveValue("support@company.com");
			});

			await user.clear(getSupportEmailField());
			await user.type(getSupportEmailField(), "newsupport@company.com");

			await user.click(screen.getByTestId("save-changes-button"));

			await waitFor(() => {
				expect(mockUpdateCompanyMutateAsync).toHaveBeenCalledWith({
					id: "company-1",
					data: {
						supportEmail: "newsupport@company.com",
						rotatePassword: false,
						passwordValidityDays: 90,
						passwordGraceDays: 5,
					},
				});
			});

			expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument();
		});

		it("should surface an error message when the update fails", async () => {
			mockUpdateCompanyMutateAsync.mockRejectedValue(new Error("Update failed"));

			renderWithProviders(<CompanySettings />);

			await waitFor(() => {
				expect(getSupportEmailField()).toHaveValue("support@company.com");
			});

			await user.clear(getSupportEmailField());
			await user.type(getSupportEmailField(), "newsupport@company.com");

			await user.click(screen.getByTestId("save-changes-button"));

			expect(await screen.findByText("Update failed")).toBeInTheDocument();
		});
	});
});
