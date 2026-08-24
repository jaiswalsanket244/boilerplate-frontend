import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DeleteProductAlert } from "@/module/product/components/delete-product-alert";

const mockOnDeleteProduct = vi.fn();

const getConfirmButton = () => screen.getByRole("button", { name: "Confirm" });
const getCancelButton = () => screen.getByRole("button", { name: "Cancel" });
const getDeleteButton = () => screen.getByTestId("alert-trigger").querySelector("button");

describe("DeleteProductAlert Component", () => {
	let user: UserEvent;
	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	const renderComponent = (props = {}) => {
		const defaultProps = {
			onDeleteProduct: mockOnDeleteProduct,
			productId: "123",
		};

		return render(<DeleteProductAlert {...defaultProps} {...props} />);
	};

	describe("Rendering", () => {
		it("should render delete button with trash icon", () => {
			renderComponent();

			const button = screen.getByTestId("alert-trigger").querySelector("button");
			expect(button).toBeInTheDocument();
		});

		it("should render tooltip with delete text", () => {
			renderComponent();

			expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Delete product");
		});

		it("should not show alert dialog initially", () => {
			renderComponent();

			const alertDialog = screen.getByTestId("alert-dialog");
			expect(alertDialog).toHaveAttribute("data-open", "false");
		});
	});

	describe("Dialog Interaction", () => {
		it("should open dialog when delete button is clicked", async () => {
			renderComponent();

			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			await waitFor(() => {
				const alertDialog = screen.getByTestId("alert-dialog");
				expect(alertDialog).toHaveAttribute("data-open", "true");
			});
		});

		it("should display correct dialog title", async () => {
			renderComponent();

			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			await waitFor(() => {
				expect(screen.getByTestId("alert-title")).toHaveTextContent("Delete Product");
			});
		});

		it("should display correct dialog description", async () => {
			const user = userEvent.setup();
			renderComponent();

			const deleteButton = screen.getByTestId("alert-trigger").querySelector("button");
			if (deleteButton) {
				await user.click(deleteButton);
			}

			await waitFor(() => {
				expect(screen.getByTestId("alert-description")).toHaveTextContent(
					"Are you sure you want to delete this product?"
				);
			});
		});

		it("should display cancel and confirm buttons in footer", async () => {
			const user = userEvent.setup();
			renderComponent();

			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			await waitFor(() => {
				expect(screen.getByTestId("alert-dialog-cancel")).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
			});
		});
	});

	describe("Delete Confirmation", () => {
		it("should call onDeleteProduct when confirm is clicked", async () => {
			renderComponent();

			// Open dialog
			const deleteButton = screen.getByTestId("alert-trigger").querySelector("button");
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Click confirm
			await waitFor(async () => {
				const confirmButton = screen.getByText("Confirm");
				await user.click(confirmButton);
			});

			await waitFor(() => {
				expect(mockOnDeleteProduct).toHaveBeenCalledTimes(1);
			});
		});

		it("should close dialog after successful deletion", async () => {
			renderComponent();

			// Open dialog
			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Confirm deletion
			await waitFor(async () => {
				const confirmButton = getConfirmButton();
				await user.click(confirmButton);
			});

			await waitFor(() => {
				const alertDialog = screen.getByTestId("alert-dialog");
				expect(alertDialog).toHaveAttribute("data-open", "false");
			});
		});
	});

	describe("Cancel Action", () => {
		it("should close dialog when cancel is clicked", async () => {
			renderComponent();

			// Open dialog
			const deleteButton = screen.getByTestId("alert-trigger").querySelector("button");
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Click cancel
			await waitFor(async () => {
				const cancelButton = screen.getByTestId("alert-dialog-cancel");
				await user.click(cancelButton);
			});

			await waitFor(() => {
				const alertDialog = screen.getByTestId("alert-dialog");
				expect(alertDialog).toHaveAttribute("data-open", "false");
			});
		});

		it("should not call onDeleteProduct when cancel is clicked", async () => {
			renderComponent();

			// Open dialog
			const deleteButton = screen.getByTestId("alert-trigger").querySelector("button");
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Click cancel
			await waitFor(async () => {
				const cancelButton = screen.getByTestId("alert-dialog-cancel");
				await user.click(cancelButton);
			});

			expect(mockOnDeleteProduct).not.toHaveBeenCalled();
		});
	});

	describe("Async Operations", () => {
		it("should handle slow delete operations", async () => {
			mockOnDeleteProduct.mockImplementation(() => {
				return new Promise((resolve) => setTimeout(resolve, 1000));
			});

			renderComponent({ onDeleteProduct: mockOnDeleteProduct });

			// Open dialog
			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Confirm deletion
			await waitFor(async () => {
				const confirmButton = getConfirmButton();
				await user.click(confirmButton);
			});

			expect(mockOnDeleteProduct).toHaveBeenCalled();

			// Wait for async operation
			await waitFor(
				() => {
					const alertDialog = screen.getByTestId("alert-dialog");
					expect(alertDialog).toHaveAttribute("data-open", "false");
				},
				{ timeout: 2000 }
			);
		});

		it("should prevent multiple delete calls", async () => {
			renderComponent();

			// Open dialog
			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Click confirm multiple times rapidly
			const confirmButton = getConfirmButton();
			await user.click(confirmButton);
			await user.click(confirmButton);
			await user.click(confirmButton);

			// Should only be called once due
			await waitFor(() => {
				expect(mockOnDeleteProduct).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe("State Management", () => {
		it("should reset state when reopening dialog", async () => {
			renderComponent();

			// Open and close dialog
			const deleteButton = getDeleteButton();
			if (deleteButton) {
				await user.click(deleteButton);
			}

			const cancelButton = getCancelButton();
			await user.click(cancelButton);

			await waitFor(() => {
				const alertDialog = screen.getByTestId("alert-dialog");
				expect(alertDialog).toHaveAttribute("data-open", "false");
			});
			// Reopen dialog
			if (deleteButton) {
				await user.click(deleteButton);
			}

			// Should show the dialog again
			await waitFor(() => {
				const alertDialog = screen.getByTestId("alert-dialog");
				expect(alertDialog).toHaveAttribute("data-open", "true");
			});
		});
	});
});
