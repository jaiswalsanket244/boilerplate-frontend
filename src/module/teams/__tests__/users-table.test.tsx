import { createColumns } from "@/module/teams/components/columns";
import UsersTable from "@/module/teams/components/users-table";
import type { IUsersTableProps, TeamMember } from "@/module/teams/types";
import { ROLES } from "@/types";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockData: TeamMember[] = [
	{
		_id: "user-1",
		serialNumber: 1,
		email: "john@example.com",
		invitedEmail: "",
		name: { first: "John", last: "Doe" },
		role: ROLES.USER,
		createdAt: "2024-01-01",
		status: "ACTIVE",
	},
	{
		_id: "user-2",
		serialNumber: 2,
		email: "jane@example.com",
		invitedEmail: "",
		name: { first: "Jane", last: "Smith" },
		role: ROLES.ADMIN,
		createdAt: "2024-01-02",
		status: "ACTIVE",
	},
];

const mockSetSorting = vi.fn();
const mockSetFilters = vi.fn();

function renderComponent(props?: Partial<IUsersTableProps>) {
	return renderWithProviders(
		<UsersTable
			data={mockData}
			sorting={[]}
			setSorting={mockSetSorting}
			filters={[]}
			setFilters={mockSetFilters}
			activeTab="active"
			currentUser={null}
			canManageTeams={true}
			{...props}
		/>
	);
}

describe("UsersTable Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	const columns = createColumns("users", true, null);

	describe("Rendering", () => {
		it("should render DataTable component", () => {
			renderComponent();

			expect(screen.getByTestId("data-table")).toBeInTheDocument();
		});

		it("should render all data rows", () => {
			renderComponent();

			const rows = screen.getAllByTestId(/table-row-/);

			expect(rows.length).toBe(mockData.length);
		});

		it("should render all the columns with header names", () => {
			renderComponent();

			const headers = screen.getAllByRole("columnheader");

			expect(headers.length).toBe(columns.length);

			columns.forEach((column) => {
				expect(screen.getByText(column.header as string)).toBeInTheDocument();
			});
		});

		it("should render no results row when no data", () => {
			renderComponent({ data: [] });

			expect(screen.getByTestId("no-results-row")).toBeInTheDocument();
		});

		it("shows all the row details on display", () => {
			renderComponent();

			const rows = screen.getAllByTestId(/table-row-/);
			const row = rows[0];

			const data = mockData[0]!;

			expect(row).toHaveTextContent(data.name.first);
			expect(row).toHaveTextContent(data.name.last);
			expect(row).toHaveTextContent(data.email);
			expect(row).toHaveTextContent(data.role!);
			expect(row).toHaveTextContent(data.status);
		});
	});

	describe("Edge cases", () => {
		it("handles the null data", () => {
			renderComponent({ data: null as any });

			expect(screen.getByTestId("no-results-row")).toBeInTheDocument();
		});

		it("handles the undefined data", () => {
			renderComponent({ data: undefined as any });

			expect(screen.getByTestId("no-results-row")).toBeInTheDocument();
		});
	});
});
