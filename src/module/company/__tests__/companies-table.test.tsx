import type { ICompaniesTableProps, ICompany } from "@/module/company/types";
import { STATUS } from "@/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompaniesTable } from "@/module/company/components/companies-table";

const mockCompanies: ICompany[] = [
	{
		_id: "company-1",
		name: "Company One",
		companyStatus: STATUS.ACTIVE,
		userRef: "user-1",
		supportEmail: "support1@test.com",
	},
	{
		_id: "company-2",
		name: "Company Two",
		companyStatus: STATUS.INACTIVE,
		userRef: "user-2",
		supportEmail: "support2@test.com",
	},
	{
		_id: "company-3",
		name: "Company Three",
		companyStatus: STATUS.ACTIVE,
		userRef: "user-3",
	},
];
const mockOnViewCompany = vi.fn();
const mockOnToggleStatus = vi.fn();
const mockGetRowAnimationClasses = vi.fn(() => "");

const defaultProps = {
	companies: mockCompanies,
	currentUserEmail: "admin@test.com",
	onViewCompany: mockOnViewCompany,
	onToggleStatus: mockOnToggleStatus,
	getRowAnimationClasses: mockGetRowAnimationClasses,
};

function renderComponent(props?: Partial<ICompaniesTableProps>) {
	return render(<CompaniesTable {...defaultProps} {...props} />);
}

describe("CompaniesTable Component", () => {
	let user = userEvent.setup();
	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render table with companies", () => {
			renderComponent();

			expect(screen.getByText("Company One")).toBeInTheDocument();
			expect(screen.getByText("Company Two")).toBeInTheDocument();
			expect(screen.getByText("Company Three")).toBeInTheDocument();
		});

		it("should render table headers", () => {
			renderComponent();

			expect(screen.getByText("Company Name")).toBeInTheDocument();
			expect(screen.getByText("Company Status")).toBeInTheDocument();
			expect(screen.getByText("Action")).toBeInTheDocument();
		});

		it("should render company statuses", () => {
			renderComponent();

			const activeStatuses = screen.getAllByText(STATUS.ACTIVE);
			const inactiveStatuses = screen.getAllByText(STATUS.INACTIVE);

			expect(activeStatuses.length).toBe(2);
			expect(inactiveStatuses.length).toBe(1);
		});

		it("should render table in a container", () => {
			renderComponent();

			const tableContainer = screen.getByTestId("companies-table-container");
			expect(tableContainer).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("should show 'No Data !!' when companies array is empty", () => {
			renderComponent({ companies: [] });

			expect(screen.getByText("No Data !!")).toBeInTheDocument();
		});

		it("should show 'Loading...' when isLoading is true and no companies", () => {
			renderComponent({ companies: [], isLoading: true });

			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should not show loading when companies exist", () => {
			renderComponent({ isLoading: true });

			expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
			expect(screen.getByText("Company One")).toBeInTheDocument();
		});

		it("should render empty state with correct colspan", () => {
			const { container } = renderComponent({ companies: [] });

			const emptyCell = container.querySelector('td[colspan="3"]');
			expect(emptyCell).toBeInTheDocument();
		});
	});

	describe("Company Actions", () => {
		it("should show actions for companies not matching current user email", () => {
			renderComponent({ currentUserEmail: "admin@t.com" });

			expect(screen.getByTestId("view-company-company-1")).toBeInTheDocument();
			expect(screen.getByTestId("toggle-status-company-2")).toBeInTheDocument();
		});

		it("should hide actions for company matching current user email", () => {
			renderComponent({ currentUserEmail: "Company One" });

			// Company One should not have actions
			expect(screen.queryByTestId("view-company-company-1")).not.toBeInTheDocument();
		});

		it("should show actions when currentUserEmail is undefined", () => {
			renderComponent({ currentUserEmail: undefined });

			// No actions should be shown when currentUserEmail is undefined
			expect(screen.queryByText("View Company")).not.toBeInTheDocument();
		});

		it("should call onViewCompany with correct company id", async () => {
			renderComponent();

			const viewIcons = screen.queryAllByTestId(/view-company/);
			const firstViewIcon = viewIcons[0];

			if (firstViewIcon) {
				await user.click(firstViewIcon);
			}

			expect(mockOnViewCompany).toHaveBeenCalledWith("company-1");
		});

		it("should call onToggleStatus with correct company", async () => {
			renderComponent();

			const actionIcons = screen.queryAllByTestId(/toggle-status/);
			const firstToggleIcon = actionIcons[0]; // Second icon is toggle

			if (firstToggleIcon) {
				await user.click(firstToggleIcon);
			}

			expect(mockOnToggleStatus).toHaveBeenCalledWith(mockCompanies[0]);
		});
	});

	describe("Row Animation Classes", () => {
		it("should call getRowAnimationClasses for each company", () => {
			renderComponent();

			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("company-1");
			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("company-2");
			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("company-3");
			expect(mockGetRowAnimationClasses).toHaveBeenCalledTimes(3);
		});

		it("should apply animation classes to rows", () => {
			const mockGetRowClasses = vi.fn((id) => `animated-row-${id}`);
			const { container } = renderComponent({ getRowAnimationClasses: mockGetRowClasses });

			const rows = container.querySelectorAll("tbody tr");
			expect(rows[0]).toHaveClass("animated-row-company-1");
			expect(rows[1]).toHaveClass("animated-row-company-2");
			expect(rows[2]).toHaveClass("animated-row-company-3");
		});

		it("should work without getRowAnimationClasses prop", () => {
			const { getRowAnimationClasses, ...propsWithoutAnimation } = defaultProps;
			renderComponent({ ...propsWithoutAnimation });

			expect(screen.getByText("Company One")).toBeInTheDocument();
		});
	});

	describe("Status Badge Display", () => {
		it("should render status badges with correct colors", () => {
			const { container } = renderComponent();

			const greenBadges = container.querySelectorAll(".bg-green-100");
			const redBadges = container.querySelectorAll(".bg-red-100");

			expect(greenBadges.length).toBe(2); // Two active companies
			expect(redBadges.length).toBe(1); // One inactive company
		});

		it("should handle companies with undefined status", () => {
			const companiesWithUndefinedStatus = [{ ...mockCompanies[0]!, companyStatus: undefined }];

			renderComponent({ companies: companiesWithUndefinedStatus });

			expect(screen.getByText("Unknown")).toBeInTheDocument();
		});
	});

	describe("Multiple Companies", () => {
		it("should render all companies in the list", () => {
			renderComponent();

			const rows = screen.getAllByRole("row");
			// 1 header row + 3 data rows
			expect(rows.length).toBe(4);
		});

		it("should handle single company", () => {
			renderComponent({ companies: [mockCompanies[0]!] });

			expect(screen.getByText("Company One")).toBeInTheDocument();
			expect(screen.queryByText("Company Two")).not.toBeInTheDocument();
		});

		it("should handle large number of companies", () => {
			const manyCompanies = Array.from({ length: 100 }, (_, i) => ({
				_id: `company-${i}`,
				name: `Company ${i}`,
				companyStatus: i % 2 === 0 ? STATUS.ACTIVE : STATUS.INACTIVE,
			}));

			renderComponent({ companies: manyCompanies });

			expect(screen.getByText("Company 0")).toBeInTheDocument();
			expect(screen.getByText("Company 99")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle company with empty name", () => {
			const companyWithEmptyName = [{ ...mockCompanies[0]!, name: "" }];
			renderComponent({ companies: companyWithEmptyName });

			const rows = screen.getAllByRole("row");
			expect(rows.length).toBe(2); // Header + 1 data row
		});

		it("should handle null companies array", () => {
			renderComponent({ companies: null as any });

			expect(screen.getByText("No Data !!")).toBeInTheDocument();
		});

		it("should handle undefined companies array", () => {
			renderComponent({ companies: undefined as any });

			expect(screen.getByText("No Data !!")).toBeInTheDocument();
		});
	});

	describe("User Email Matching", () => {
		it("should hide actions when company name matches user email exactly", () => {
			const companies = [{ ...mockCompanies[0]!, name: "admin@test.com" }];
			renderComponent({ companies, currentUserEmail: "admin@test.com" });

			expect(screen.queryByText("View Company")).not.toBeInTheDocument();
		});

		it("should be case-sensitive when matching email", () => {
			const companies = [{ ...mockCompanies[0]!, name: "Admin@Test.com" }];
			renderComponent({ companies, currentUserEmail: "admin@test.com" });

			// Should show actions because case doesn't match
			expect(screen.getByText("View Company")).toBeInTheDocument();
		});

		it("should handle empty currentUserEmail", () => {
			renderComponent({ companies: [{ ...mockCompanies[0]!, name: "admin@test.com" }], currentUserEmail: "" });

			// Should not show actions when email is empty
			expect(screen.queryByText("View Company")).not.toBeInTheDocument();
		});
	});

	describe("Table Structure", () => {
		it("should render table with correct structure", () => {
			const { container } = renderComponent();

			expect(container.querySelector("table")).toBeInTheDocument();
			expect(container.querySelector("thead")).toBeInTheDocument();
			expect(container.querySelector("tbody")).toBeInTheDocument();
		});

		it("should render data in correct columns", () => {
			const { container } = renderComponent({ companies: [mockCompanies[0]!] });

			const dataCells = container.querySelectorAll("tbody td");
			expect(dataCells[0]).toHaveTextContent("Company One");
			expect(dataCells[1]).toHaveTextContent(STATUS.ACTIVE);
		});
	});

	describe("Component Updates", () => {
		it("should update when companies prop changes", () => {
			const { rerender } = renderComponent({ companies: [mockCompanies[0]!] });

			expect(screen.getByText("Company One")).toBeInTheDocument();
			expect(screen.queryByText("Company Two")).not.toBeInTheDocument();

			rerender(<CompaniesTable {...defaultProps} companies={[mockCompanies[1]!]} />);

			expect(screen.queryByText("Company One")).not.toBeInTheDocument();
			expect(screen.getByText("Company Two")).toBeInTheDocument();
		});

		it("should update from empty to populated", () => {
			const { rerender } = renderComponent({ companies: [] });

			expect(screen.getByText("No Data !!")).toBeInTheDocument();

			rerender(<CompaniesTable {...defaultProps} companies={mockCompanies} />);

			expect(screen.queryByText("No Data !!")).not.toBeInTheDocument();
			expect(screen.getByText("Company One")).toBeInTheDocument();
		});
	});

	describe("Interaction Scenarios", () => {
		it("should handle clicking view on multiple companies", async () => {
			renderComponent();

			const viewIcons = screen.getAllByTestId(/view-company-/);

			// Click first company's view icon
			if (viewIcons[0]) {
				await user.click(viewIcons[0]);
			}
			expect(mockOnViewCompany).toHaveBeenCalledWith("company-1");

			// Click second company's view icon (indices 2 because each company has 2 icons)
			if (viewIcons[2]) {
				await user.click(viewIcons[2]);
			}
			expect(mockOnViewCompany).toHaveBeenCalledWith("company-3");
		});
	});
});
