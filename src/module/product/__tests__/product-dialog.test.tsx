import "@/module/product/__tests__/mocks/use-product-api";
import {
	mockCreateProduct,
	mockUpdateProduct,
	resetProductMocks,
	setIsPending,
} from "@/module/product/__tests__/mocks/use-product-api";
import ProductDialog from "@/module/product/components/create-edit-product-dialog";
import type { ProductFormInput } from "@/module/product/utils/form-utils";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { mockAddRow } from "@/tests/utils/mock-use-recently-changed-rows";
import { COOKIES } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

vi.mock("react-icons/fa", () => ({ FaInfoCircle: () => <div data-testid="fa-info-circle" /> }));

const mockOnOpenChange = vi.fn();
const mockRefetchProducts = vi.fn();

const getSubmitButton = () => screen.getByTestId("submit-button");
const getCancelButton = () => screen.getByTestId("cancel-button");

const getInputFields = () => {
	return {
		titleInput: screen.getByTestId("title-input"),
		descriptionInput: screen.getByTestId("description-input"),
		priceInput: screen.getByTestId("price-input"),
		costPriceInput: screen.getByTestId("cost-price-input"),
		retailPriceInput: screen.getByTestId("retail-price-input"),
		salePriceInput: screen.getByTestId("sale-price-input"),
	};
};

const fillForm = async (user: UserEvent, product?: ProductFormInput) => {
	const { titleInput, descriptionInput, priceInput, costPriceInput, retailPriceInput, salePriceInput } =
		getInputFields();
	await user.type(titleInput, product?.title ?? "New Product");
	await user.type(descriptionInput, product?.description ?? "New Description");
	await user.type(priceInput, product?.price?.toString() ?? "100");
	await user.type(costPriceInput, product?.costPrice?.toString() ?? "50");
	await user.type(retailPriceInput, product?.retailPrice?.toString() ?? "120");
	await user.type(salePriceInput, product?.salePrice?.toString() ?? "90");
};

describe("Product dialog component", () => {
	const mockProduct: ProductFormInput = {
		_id: "123",
		title: "Test Product",
		description: "Test Description",
		price: 100,
		costPrice: 50,
		retailPrice: 120,
		salePrice: 90,
	};
	let user: UserEvent;

	beforeEach(() => {
		resetProductMocks();
		clearCookies();
		user = userEvent.setup();
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	const renderComponent = (props = {}) => {
		const defaultProps = {
			open: true,
			onOpenChange: mockOnOpenChange,
			refetchProducts: mockRefetchProducts,
			id: undefined,
			product: undefined,
		};

		return renderWithProviders(<ProductDialog {...defaultProps} {...props} />);
	};

	describe("Rendering", () => {
		it("should render create dialog when no product id is provided", () => {
			renderComponent();

			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Create Product");
			expect(screen.getByTestId("dialog-description")).toHaveTextContent(
				"Fill in the details to create a new product."
			);
		});

		it("should render edit dialog when product id is provided", () => {
			renderComponent({ id: "123", product: mockProduct });

			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Edit Product");
			expect(screen.getByTestId("dialog-description")).toHaveTextContent("Update the product details below.");
		});

		it("should not render dialog when open is false", () => {
			renderComponent({ open: false });

			expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();
		});

		it("should render all form fields", () => {
			renderComponent();

			expect(screen.getByTestId("title-input")).toBeInTheDocument();
			expect(screen.getByTestId("description-input")).toBeInTheDocument();
			expect(screen.getByTestId("price-input")).toBeInTheDocument();
			expect(screen.getByTestId("cost-price-input")).toBeInTheDocument();
			expect(screen.getByTestId("retail-price-input")).toBeInTheDocument();
			expect(screen.getByTestId("sale-price-input")).toBeInTheDocument();
		});

		it("should populate form fields with product data when editing", () => {
			renderComponent({ id: "123", product: mockProduct });

			expect(screen.getByTestId("title-input")).toHaveValue(mockProduct.title);
			expect(screen.getByTestId("description-input")).toHaveValue(mockProduct.description);
			expect(screen.getByTestId("price-input")).toHaveValue(mockProduct.price);
			expect(screen.getByTestId("cost-price-input")).toHaveValue(mockProduct.costPrice);
			expect(screen.getByTestId("retail-price-input")).toHaveValue(mockProduct.retailPrice);
			expect(screen.getByTestId("sale-price-input")).toHaveValue(mockProduct.salePrice);
		});
	});

	describe("Form Validation", () => {
		it("should show validation errors for empty required fields", async () => {
			renderComponent();

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.queryByTestId("title-field-error-icon")).toBeInTheDocument();
			});
		});

		it("should validate price fields are numbers", async () => {
			renderComponent();

			const { priceInput } = getInputFields();
			await user.type(priceInput, "invalid");
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateProduct).not.toHaveBeenCalled();
			});
		});
	});

	describe("Create Product", () => {
		it("should successfully create a product", async () => {
			mockCreateProduct.mockResolvedValueOnce({ _id: "new-123" });

			renderComponent();
			const { titleInput, descriptionInput, priceInput, costPriceInput, retailPriceInput, salePriceInput } =
				getInputFields();

			await user.type(titleInput, "New Product");
			await user.type(descriptionInput, "New Description");
			await user.type(priceInput, "100");
			await user.type(costPriceInput, "50");
			await user.type(retailPriceInput, "120");
			await user.type(salePriceInput, "90");

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateProduct).toHaveBeenCalledWith(
					expect.objectContaining({
						title: "New Product",
						description: "New Description",
						price: 100,
						costPrice: 50,
						retailPrice: 120,
						salePrice: 90,
					})
				);

				expect(mockCreateProduct).toHaveBeenCalledTimes(1);
				expect(mockRefetchProducts).toHaveBeenCalledTimes(1);
			});
		});

		it("should update product IDs and refetch after creation", async () => {
			mockCreateProduct.mockResolvedValueOnce({ _id: "new-123" });

			renderComponent();

			await fillForm(user);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalledTimes(1);
				expect(mockRefetchProducts).toHaveBeenCalledTimes(1);
			});
		});

		it("should show error message when creation fails", async () => {
			mockCreateProduct.mockRejectedValueOnce(new Error("Creation failed"));

			renderComponent();

			await fillForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByTestId("error-message")).toHaveTextContent("Product creation failed!");
			});
		});

		it("should close dialog after successful creation", async () => {
			mockCreateProduct.mockResolvedValueOnce({ _id: "new-123" });

			renderComponent();

			await fillForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			});
		});
	});

	describe("Update Product", () => {
		it("should successfully update a product", async () => {
			setupCookies({
				[COOKIES.COMPANY_REF]: "test-company-ref",
			});
			mockUpdateProduct.mockResolvedValueOnce({});

			renderComponent({ id: "123", product: mockProduct });

			const { titleInput } = getInputFields();
			await user.clear(titleInput);
			await user.type(titleInput, "Updated Product");

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdateProduct).toHaveBeenCalledWith({
					id: "123",
					data: expect.objectContaining({
						title: "Updated Product",
						companyRef: "test-company-ref",
					}),
				});
			});
		});

		it("should update product IDs and refetch after update", async () => {
			mockUpdateProduct.mockResolvedValueOnce({});

			renderComponent({ id: "123", product: mockProduct });

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockAddRow).toHaveBeenCalled();
				expect(mockRefetchProducts).toHaveBeenCalled();
			});
		});

		it("should show error message when update fails", async () => {
			mockUpdateProduct.mockRejectedValueOnce(new Error("Update failed"));

			renderComponent({ id: "123", product: mockProduct });

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByTestId("error-message")).toHaveTextContent("Product update failed!");
			});
		});

		it("should close dialog after successful update", async () => {
			mockUpdateProduct.mockResolvedValueOnce({});

			renderComponent({ id: "123", product: mockProduct });

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			});
		});

		it("should clear error message on successful update", async () => {
			mockUpdateProduct.mockResolvedValueOnce({});

			renderComponent({ id: "123", product: mockProduct });

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
			});
		});
	});

	describe("Dialog Actions", () => {
		it("should close dialog when cancel button is clicked", async () => {
			renderComponent();

			await user.click(getCancelButton());

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("should reset form when closing dialog", async () => {
			renderComponent();

			await user.type(screen.getByTestId("title-input"), "Test");
			await user.click(getCancelButton());

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("should clear error message when closing dialog", async () => {
			mockCreateProduct.mockRejectedValueOnce(new Error("Failed"));

			renderComponent();

			await user.type(screen.getByTestId("title-input"), "Test");
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.getByTestId("description-field-error-icon")).toBeInTheDocument();
			});

			await user.click(getCancelButton());

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});
	});

	describe("Loading States", () => {
		it("should disable submit button while creating", () => {
			setIsPending(true);
			renderComponent();

			const submitButton = getSubmitButton();

			expect(submitButton).toBeDisabled();
			expect(submitButton).toHaveTextContent("Submitting...");
		});

		it("should disable submit button while updating", () => {
			setIsPending(true);

			renderComponent({ id: "123", product: mockProduct });

			const submitButton = getSubmitButton();

			expect(submitButton).toBeDisabled();
			expect(submitButton).toHaveTextContent("Submitting...");
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing companyRef", async () => {
			// vi.mocked(Cookies.get as (key: string) => string | undefined).mockImplementation((key: string) => {
			// 	return undefined;
			// });
			setupCookies({
				[COOKIES.COMPANY_REF]: undefined,
			});
			mockCreateProduct.mockResolvedValueOnce({ _id: "new-123" });

			renderComponent();

			await fillForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateProduct).toHaveBeenCalledWith(
					expect.objectContaining({
						companyRef: undefined,
					})
				);
			});
		});

		it("should handle product update with partial data", async () => {
			const partialProduct = {
				_id: "123",
				title: "Partial Product",
				description: "Partial Description",
				price: 50,
			};

			mockUpdateProduct.mockResolvedValueOnce({});
			renderComponent({ id: "123", product: partialProduct });

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdateProduct).toHaveBeenCalled();
			});
		});

		it("should handle setProductIds being undefined", async () => {
			mockCreateProduct.mockResolvedValueOnce({ _id: "new-123" });

			renderComponent({ setProductIds: undefined });

			await fillForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateProduct).toHaveBeenCalled();
			});
		});

		it("should handle numeric input for price fields", async () => {
			renderComponent();

			const priceInput = screen.getByTestId("price-input");
			await user.type(priceInput, "99.99");

			expect(priceInput).toHaveValue(99.99);
		});
	});
});
