import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CompanyActions } from "@/module/company/components/company-actions";
import type { CompanyType, ICompanyActionsProps } from "@/module/company/types";
import { STATUS } from "@/types";

const mockCompany: CompanyType = {
	_id: "company-123",
	name: "Test Company",
	companyStatus: STATUS.ACTIVE,
	userRef: "user-123",
	supportEmail: "support@test.com",
};
const mockOnView = vi.fn();
const mockOnToggleStatus = vi.fn();

function renderComponent(props?: Partial<ICompanyActionsProps>) {
	return render(
		<CompanyActions
			company={mockCompany}
			onView={mockOnView}
			onToggleStatus={mockOnToggleStatus}
			showActions={true}
			{...props}
		/>
	);
}

describe("CompanyActions Component", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	describe("Rendering", () => {
		it("should render actions when showActions is true", () => {
			renderComponent();

			expect(screen.getByText("View Company")).toBeInTheDocument();
			expect(screen.getByText("Toggle Company Status")).toBeInTheDocument();
		});

		it("should not render actions when showActions is false", () => {
			const { container } = renderComponent({ showActions: false });

			expect(container.firstChild).toBeNull();
			expect(screen.queryByText("View Company")).not.toBeInTheDocument();
			expect(screen.queryByText("Toggle Company Status")).not.toBeInTheDocument();
		});

		it("should render both action icons", () => {
			const { container } = renderComponent();

			const icons = container.querySelectorAll("svg");
			expect(icons.length).toBe(2);
		});

		it("should render actions in a flex container", () => {
			const { container } = renderComponent();

			const actionsContainer = container.querySelector(".flex.items-center.justify-start.gap-3");
			expect(actionsContainer).toBeInTheDocument();
		});
	});

	describe("View Company Action", () => {
		it("should call onView with company id when view icon is clicked", async () => {
			renderComponent();
			const viewIcon = screen.getByTestId(/view-company-company-123/);
			expect(viewIcon).toBeInTheDocument();

			if (viewIcon) {
				await user.click(viewIcon);
			}

			expect(mockOnView).toHaveBeenCalledWith("company-123");
			expect(mockOnView).toHaveBeenCalledTimes(1);
		});

		it("should display view company tooltip", () => {
			renderComponent();

			expect(screen.getByText("View Company")).toBeInTheDocument();
		});

		it("should call onView with different company ids", async () => {
			const company1 = { ...mockCompany, _id: "company-1" };
			const company2 = { ...mockCompany, _id: "company-2" };

			const { container, rerender } = renderComponent({ company: company1 });
			const viewIcon = screen.getByTestId(/view-company-company-1/);
			if (viewIcon) {
				await user.click(viewIcon);
			}

			expect(mockOnView).toHaveBeenCalledWith("company-1");

			rerender(
				<CompanyActions company={company2} onView={mockOnView} onToggleStatus={mockOnToggleStatus} showActions={true} />
			);

			const viewIcon2 = screen.getByTestId(/view-company-company-2/);
			if (viewIcon2) {
				await user.click(viewIcon2);
			}

			expect(mockOnView).toHaveBeenCalledWith("company-2");
		});
	});

	describe("Toggle Status Action", () => {
		it("should call onToggleStatus with company when toggle icon is clicked", async () => {
			renderComponent();

			const toggleIcon = screen.getByTestId(/toggle-status-company-123/);
			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			expect(mockOnToggleStatus).toHaveBeenCalledWith(mockCompany);
			expect(mockOnToggleStatus).toHaveBeenCalledTimes(1);
		});

		it("should display toggle status tooltip", () => {
			renderComponent();

			expect(screen.getByText("Toggle Company Status")).toBeInTheDocument();
		});

		it("should pass entire company object to onToggleStatus", async () => {
			const customCompany = {
				...mockCompany,
				_id: "custom-123",
				name: "Custom Company",
				companyStatus: STATUS.INACTIVE,
			};

			renderComponent({ company: customCompany });

			const toggleIcon = screen.getByTestId(/toggle-status-custom-123/);
			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			expect(mockOnToggleStatus).toHaveBeenCalledWith(customCompany);
		});
	});

	describe("Multiple Clicks", () => {
		it("should handle multiple view clicks", async () => {
			renderComponent();

			const viewIcon = screen.getByTestId(/view-company-company-123/);

			if (viewIcon) {
				await user.click(viewIcon);
				await user.click(viewIcon);
				await user.click(viewIcon);
			}

			expect(mockOnView).toHaveBeenCalledTimes(3);
		});

		it("should handle multiple toggle clicks", async () => {
			renderComponent();

			const toggleIcon = screen.getByTestId(/toggle-status-company-123/);

			if (toggleIcon) {
				await user.click(toggleIcon);
				await user.click(toggleIcon);
			}

			expect(mockOnToggleStatus).toHaveBeenCalledTimes(2);
		});

		it("should handle alternating clicks between actions", async () => {
			renderComponent();

			const viewIcon = screen.getByTestId(/view-company-company-123/);
			const toggleIcon = screen.getByTestId(/toggle-status-company-123/);

			if (viewIcon && toggleIcon) {
				await user.click(viewIcon);
				await user.click(toggleIcon);
				await user.click(viewIcon);
				await user.click(toggleIcon);
			}

			expect(mockOnView).toHaveBeenCalledTimes(2);
			expect(mockOnToggleStatus).toHaveBeenCalledTimes(2);
		});
	});

	describe("Edge Cases", () => {
		it("should handle company with empty id", async () => {
			const companyWithEmptyId = { ...mockCompany, _id: "" };
			renderComponent({ company: companyWithEmptyId });

			const viewIcon = screen.getByTestId(/view-company-/);
			if (viewIcon) {
				await user.click(viewIcon);
			}

			expect(mockOnView).toHaveBeenCalledWith("");
		});

		it("should handle company with undefined status", async () => {
			const user = userEvent.setup();
			const companyWithoutStatus = { ...mockCompany, companyStatus: undefined };
			const { container } = renderComponent({ company: companyWithoutStatus });

			const toggleIcon = screen.getByTestId(/toggle-status-company-123/);

			if (toggleIcon) {
				await user.click(toggleIcon);
			}

			expect(mockOnToggleStatus).toHaveBeenCalledWith(companyWithoutStatus);
		});

		it("should handle company with all optional fields undefined", async () => {
			const user = userEvent.setup();
			const minimalCompany: CompanyType = {
				_id: "minimal-123",
			};

			renderComponent({ company: minimalCompany });

			const viewIcon = screen.getByTestId(/view-company-minimal-123/);

			if (viewIcon) {
				await user.click(viewIcon);
			}
			expect(mockOnView).toHaveBeenCalledWith("minimal-123");

			const toggleIcon = screen.getByTestId(/toggle-status-minimal-123/);

			if (toggleIcon) {
				await user.click(toggleIcon);
			}
			expect(mockOnToggleStatus).toHaveBeenCalledWith(minimalCompany);
		});
	});

	describe("Styling", () => {
		it("should render icons with correct size", () => {
			const { container } = renderComponent();

			const icons = container.querySelectorAll("svg");
			icons.forEach((icon) => {
				expect(icon).toHaveAttribute("width", "17");
				expect(icon).toHaveAttribute("height", "17");
			});
		});
	});

	describe("Conditional Rendering", () => {
		it("should return null immediately when showActions is false", () => {
			const { container } = renderComponent({ showActions: false });
			expect(container.firstChild).toBeNull();
		});

		it("should not call callbacks when showActions is false", async () => {
			const { container } = renderComponent({ showActions: false });

			// Try to click (should not be possible as nothing is rendered)
			const icons = container.querySelectorAll("span.cursor-pointer");
			expect(icons.length).toBe(0);

			expect(mockOnView).not.toHaveBeenCalled();
			expect(mockOnToggleStatus).not.toHaveBeenCalled();
		});

		it("should toggle between showing and hiding actions", () => {
			const { container, rerender } = renderComponent({ showActions: true });

			expect(container.querySelector(".flex")).toBeInTheDocument();

			rerender(
				<CompanyActions
					company={mockCompany}
					onView={mockOnView}
					onToggleStatus={mockOnToggleStatus}
					showActions={false}
				/>
			);

			expect(container.querySelector(".flex")).not.toBeInTheDocument();

			rerender(
				<CompanyActions
					company={mockCompany}
					onView={mockOnView}
					onToggleStatus={mockOnToggleStatus}
					showActions={true}
				/>
			);

			expect(container.querySelector(".flex")).toBeInTheDocument();
		});
	});
});
