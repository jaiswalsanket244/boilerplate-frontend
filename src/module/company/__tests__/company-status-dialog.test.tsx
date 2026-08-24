import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CompanyStatusDialog } from "@/module/company/components/company-status-dialog";
import { STATUS } from "@/types";

describe("CompanyStatusDialog Component", () => {
	const mockOnClose = vi.fn();
	const mockOnConfirm = vi.fn();

	const defaultProps = {
		isOpen: true,
		currentStatus: STATUS.ACTIVE,
		onClose: mockOnClose,
		onConfirm: mockOnConfirm,
	};

	function renderComponent(props = {}) {
		return render(<CompanyStatusDialog {...defaultProps} {...props} />);
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("should render dialog when isOpen is true", () => {
			renderComponent();

			expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
			expect(screen.getByTestId("alert-dialog")).toHaveAttribute("data-open", "true");
		});

		it("should not render dialog content when isOpen is false", () => {
			renderComponent({ isOpen: false });

			const dialog = screen.getByTestId("alert-dialog");
			expect(dialog).toHaveAttribute("data-open", "false");
		});

		it("should render dialog title", () => {
			renderComponent();

			expect(screen.getByText("Change Company Status")).toBeInTheDocument();
		});

		it("should render Cancel button", () => {
			renderComponent();

			expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
		});

		it("should render Confirm button", () => {
			renderComponent();

			expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
		});
	});

	describe("Status Display", () => {
		it("should show new status as INACTIVE when current status is ACTIVE", () => {
			renderComponent({ currentStatus: STATUS.ACTIVE });

			expect(screen.getByText(STATUS.INACTIVE)).toBeInTheDocument();
		});

		it("should show new status as ACTIVE when current status is INACTIVE", () => {
			renderComponent({ currentStatus: STATUS.INACTIVE });

			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});

		it("should display confirmation message", () => {
			renderComponent();

			expect(screen.getByText(/Are you sure you want to change the company status to/)).toBeInTheDocument();
		});

		it("should render status badge with correct status", () => {
			const { container } = renderComponent({ currentStatus: STATUS.ACTIVE });

			// Should show the opposite status (INACTIVE)
			expect(screen.getByText(STATUS.INACTIVE)).toBeInTheDocument();

			// Should have red styling for inactive
			const badge = container.querySelector(".bg-red-100");
			expect(badge).toBeInTheDocument();
		});

		it("should render status badge with green styling when changing to ACTIVE", () => {
			const { container } = renderComponent({ currentStatus: STATUS.INACTIVE });

			// Should show ACTIVE
			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();

			// Should have green styling for active
			const badge = container.querySelector(".bg-green-100");
			expect(badge).toBeInTheDocument();
		});
	});

	describe("Cancel Action", () => {
		it("should call onClose when Cancel button is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it("should not call onConfirm when Cancel is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(mockOnConfirm).not.toHaveBeenCalled();
		});
	});

	describe("Confirm Action", () => {
		it("should call onConfirm when Confirm button is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();

			const confirmButton = screen.getByRole("button", { name: "Confirm" });
			await user.click(confirmButton);

			expect(mockOnConfirm).toHaveBeenCalledTimes(1);
		});
	});

	describe("Dialog State Management", () => {
		it("should update when isOpen prop changes", () => {
			const { rerender } = renderComponent({ isOpen: false });

			let dialog = screen.getByTestId("alert-dialog");
			expect(dialog).toHaveAttribute("data-open", "false");

			rerender(<CompanyStatusDialog {...defaultProps} isOpen={true} />);

			dialog = screen.getByTestId("alert-dialog");
			expect(dialog).toHaveAttribute("data-open", "true");
		});

		it("should update status display when currentStatus changes", () => {
			const { rerender } = renderComponent({ currentStatus: STATUS.ACTIVE });

			expect(screen.getByText(STATUS.INACTIVE)).toBeInTheDocument();

			rerender(<CompanyStatusDialog {...defaultProps} currentStatus={STATUS.INACTIVE} />);

			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null currentStatus", () => {
			renderComponent({ currentStatus: null });

			// When null, should default to showing ACTIVE (since null !== STATUS.ACTIVE)
			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});

		it("should handle undefined currentStatus", () => {
			renderComponent({ currentStatus: undefined });

			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});

		it("should handle empty string currentStatus", () => {
			renderComponent({ currentStatus: "" });

			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});

		it("should handle custom status values", () => {
			renderComponent({ currentStatus: "CUSTOM_STATUS" });

			// Should show ACTIVE for any non-ACTIVE status
			expect(screen.getByText(STATUS.ACTIVE)).toBeInTheDocument();
		});
	});

	describe("Dialog Structure", () => {
		it("should render header section", () => {
			renderComponent();

			expect(screen.getByTestId("alert-header")).toBeInTheDocument();
		});

		it("should render content section", () => {
			renderComponent();

			expect(screen.getByTestId("alert-content")).toBeInTheDocument();
		});

		it("should render description section", () => {
			renderComponent();

			expect(screen.getByTestId("alert-description")).toBeInTheDocument();
		});

		it("should render footer section", () => {
			renderComponent();

			expect(screen.getByTestId("alert-footer")).toBeInTheDocument();
		});

		it("should render title as h2", () => {
			renderComponent();

			const title = screen.getByTestId("alert-title");
			expect(title.tagName).toBe("H2");
		});
	});
});
