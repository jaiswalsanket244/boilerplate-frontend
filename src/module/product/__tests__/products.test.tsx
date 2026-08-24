import Products from "@/module/product/templates/products";
import { mockDelete, mockGet, mockPost } from "@/tests/utils/mock-api-client";
import { clearCookies, setupCookies } from "@/tests/utils/mock-cookies-next";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import { resetMenuStore, seedMenuPermissions } from "@/tests/utils/menu-store-helpers";
import { COOKIES, ROLES } from "@/types";
import { PERMISSIONS } from "@/types/permission";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type IProduct } from "@/module/product/types";
import { mockProducts } from "@/module/product/__tests__/mocks/mock-products";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

const getOpenDialogButton = () => screen.getByTestId("add-product-button");
const getCancelButton = () => screen.getByTestId("cancel-button");
const getSubmitButton = () => screen.getByTestId("submit-button");
const getSearchBox = () => screen.getByTestId("search-box");

const checkInitialProducts = async () => {
	await waitFor(() => {
		expect(screen.queryByTestId("no-data-message")).not.toBeInTheDocument();
	});
};
const getProductsData = (products: IProduct[]) => ({
	data: { data: { data: products, pagination: { currentPage: 1, pageSize: 10, totalPages: 1, totalCount: 3 } } },
});

const newProduct = {
	_id: "4",
	companyRef: "comp1",
	title: "Product 4",
	description: "New product",
	price: 10,
	costPrice: 5,
	retailPrice: 12,
	salePrice: 9,
};

describe("Products Component - Integration Tests", () => {
	let user: UserEvent;
	beforeEach(() => {
		setupCookies({
			[COOKIES.USER_TYPE]: ROLES.ADMIN,
			[COOKIES.COMPANY_REF]: "test-company",
		});
		seedMenuPermissions([PERMISSIONS.PRODUCTS_MANAGE]);
		user = userEvent.setup();
		mockGet.mockResolvedValue(getProductsData(mockProducts));
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.clearAllTimers();
		vi.useRealTimers();
		clearCookies();
		resetMenuStore();
	});

	const renderComponent = () => {
		return renderWithProviders(<Products />, {
			wrapper: MemoryRouterProvider,
		});
	};

	describe("Initial State and Rendering", () => {
		it("should render with initial products data", async () => {
			renderComponent();

			expect(
				screen.getByRole("heading", {
					name: "Products",
				})
			).toBeInTheDocument();

			await waitFor(() => {
				expect(screen.getByText("Product 1")).toBeInTheDocument();
				expect(screen.getByText("Product 2")).toBeInTheDocument();
				expect(screen.getByText("Product 3")).toBeInTheDocument();
				expect(screen.getAllByTestId(/^product-row-/).length).toBe(3);
			});
		});

		it("should not show dialog initially", () => {
			renderComponent();

			expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();
		});

		it("should show add button for admin users", () => {
			renderComponent();

			expect(getOpenDialogButton()).toBeInTheDocument();
		});

		it("should hide add button for regular users", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
				[COOKIES.COMPANY_REF]: "test-company",
			});
			resetMenuStore();

			renderComponent();

			expect(screen.queryByTestId("add-product-button")).not.toBeInTheDocument();
		});
	});

	describe("Dialog State Management", () => {
		it("should open create dialog when add button is clicked", async () => {
			renderComponent();

			expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();

			await user.click(screen.getByTestId("add-product-button"));

			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Create Product");
		});

		it("should close dialog when cancel is clicked", async () => {
			renderComponent();

			await user.click(getOpenDialogButton());
			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();

			await user.click(getCancelButton());
			expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();
		});

		it("should open edit dialog with selected product", async () => {
			renderComponent();

			await waitFor(async () => {
				const editButton = screen.getByTestId("edit-button-1");
				await user.click(editButton);
			});
			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Edit Product");
		});

		it("should clear selected product when dialog closes", async () => {
			renderComponent();

			// Open edit dialog
			await waitFor(async () => {
				await user.click(screen.getByTestId("edit-button-1"));
			});

			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Edit Product");

			// Close dialog
			await user.click(getCancelButton());
			expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();

			// Open create dialog - should not have previous product
			await user.click(getOpenDialogButton());
			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Create Product");
		});
	});

	describe("Search Functionality", () => {
		it("should update search value as user types", async () => {
			renderComponent();

			const searchBox = screen.getByTestId("search-box");
			expect(searchBox).toHaveValue("");

			await user.type(searchBox, "Product 1");
			expect(searchBox).toHaveValue("Product 1");
		});

		it("should pass debounced search value to query", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			renderComponent();

			const searchBox = screen.getByTestId("search-box");
			await user.type(searchBox, "test");

			await act(async () => {
				vi.advanceTimersByTime(500);
			});

			// Query should be called with the search value
			await waitFor(() => {
				expect(mockGet).toHaveBeenCalledWith(expect.any(String), {
					params: expect.objectContaining({ searchValue: "test", companyRef: "test-company" }),
				});
			});
		});

		it("should clear search value", async () => {
			const user = userEvent.setup({ delay: null });
			renderComponent();

			const searchBox = getSearchBox();
			await user.type(searchBox, "test");
			expect(searchBox).toHaveValue("test");

			await user.clear(searchBox);
			expect(searchBox).toHaveValue("");
		});
	});

	describe("Delete Functionality", () => {
		it("should remove product from list after delete", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData(mockProducts.filter((p) => p._id !== "2")));
			renderComponent();

			// Initial products
			await waitFor(() => {
				expect(screen.getByText("Product 1")).toBeInTheDocument();
				expect(screen.getByText("Product 2")).toBeInTheDocument();
				expect(screen.getByText("Product 3")).toBeInTheDocument();
			});

			// Delete product 2
			const deleteButton = screen.getByTestId("delete-button-2");
			await user.click(deleteButton);

			// Confirm delete
			const confirmButton = screen.getByTestId("delete-confirm-2");
			await user.click(confirmButton);

			await waitFor(() => {
				expect(mockDelete).toHaveBeenCalledWith(expect.any(String), { data: { companyRef: "test-company" } });
			});

			await vi.advanceTimersByTimeAsync(3000);

			await waitFor(() => {
				expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
				expect(screen.getByText("Product 1")).toBeInTheDocument();
				expect(screen.getByText("Product 3")).toBeInTheDocument();
			});
		});

		it("should delete multiple products sequentially", async () => {
			const afterDeleting1 = mockProducts.filter((p) => p._id !== "1");
			const afterDeleting1And2 = afterDeleting1.filter((p) => p._id !== "2");

			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData(afterDeleting1))
				.mockResolvedValueOnce(getProductsData(afterDeleting1And2));

			vi.useFakeTimers({ shouldAdvanceTime: true });

			renderComponent();

			// Delete product 1
			await waitFor(() => {
				expect(screen.getByText("Product 1")).toBeInTheDocument();
			});

			await user.click(screen.getByTestId("delete-button-1"));
			await user.click(screen.getByTestId("delete-confirm-1"));

			await waitFor(async () => {
				expect(mockDelete).toHaveBeenCalledWith(
					expect.any(String),
					expect.objectContaining({ data: { companyRef: "test-company" } })
				);
			});

			await vi.advanceTimersByTimeAsync(3000);

			// Wait for first delete to complete
			await waitFor(() => {
				expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
			});

			// Delete product 2
			await user.click(screen.getByTestId("delete-button-2"));
			await user.click(screen.getByTestId("delete-confirm-2"));

			await waitFor(() => {
				expect(mockDelete).toHaveBeenCalledWith(expect.any(String), { data: { companyRef: "test-company" } });
			});

			await vi.advanceTimersByTimeAsync(3000);

			// Both products should be removed
			await waitFor(() => {
				expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
				expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
				expect(screen.getByText("Product 3")).toBeInTheDocument();
			});
		});

		it("should maintain other products when one is deleted", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData(mockProducts.filter((p) => p._id !== "2")));

			renderComponent();

			let initialProductCount = 0;
			await waitFor(() => {
				expect(screen.getByText("Product 1")).toBeInTheDocument();
			});
			initialProductCount = screen.getAllByTestId(/^product-row-/).length;

			await user.click(screen.getByTestId("delete-button-2"));
			await user.click(screen.getByTestId("delete-confirm-2"));

			await waitFor(() => {
				expect(mockDelete).toHaveBeenCalled();
			});

			await vi.advanceTimersByTimeAsync(3000);

			await waitFor(() => {
				const remainingProducts = screen.getAllByTestId(/^product-row-/);
				expect(remainingProducts.length).toBe(initialProductCount - 1);
			});
		});

		it("should handle delete failure gracefully", async () => {
			mockGet.mockResolvedValue(getProductsData(mockProducts));
			const user = userEvent.setup({ delay: null });

			// Mock delete to fail
			mockDelete.mockRejectedValueOnce(new Error("Delete failed"));

			renderComponent();

			await waitFor(() => {
				expect(screen.queryByTestId("no-data-message")).not.toBeInTheDocument();
			});

			const initialProducts = screen.getAllByTestId("product-title");

			await user.click(screen.getByTestId("delete-button-1"));
			await user.click(screen.getByTestId("delete-confirm-1"));

			await waitFor(() => {
				expect(mockDelete).toHaveBeenCalled();
			});

			// Products should remain unchanged
			expect(screen.getAllByTestId("product-title").length).toBe(initialProducts.length);
		});
	});

	describe("Edit Functionality ", () => {
		it("should open edit dialog with correct product data", async () => {
			renderComponent();
			await checkInitialProducts();
			await user.click(screen.getByTestId("edit-button-1"));

			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-title")).toHaveTextContent("Edit Product");
		});

		it("should close dialog and refetch after save", async () => {
			renderComponent();
			await checkInitialProducts();
			await user.click(screen.getByTestId("edit-button-1"));
			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();
			});
		});

		it("should update title in the DOM", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const updatedProducts = [...mockProducts];
			if (updatedProducts[0]) {
				updatedProducts[0] = { ...updatedProducts[0], title: "Product 1 - Updated" };
			}

			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData(updatedProducts));
			renderComponent();
			await checkInitialProducts();

			await user.click(screen.getByTestId("edit-button-1"));
			expect(screen.getByTestId("product-dialog")).toBeInTheDocument();

			await user.click(getSubmitButton());
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			// Wait for updated title in the DOM
			await waitFor(() => expect(screen.getByText("Product 1 - Updated")).toBeInTheDocument());
		});
	});

	describe("Create Functionality", () => {
		it("should create a new product and add it to the list", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData([...mockProducts, newProduct]));
			mockPost.mockResolvedValue({
				data: { data: newProduct },
			});
			renderComponent();
			await checkInitialProducts();

			const addBtn = await screen.findByTestId("add-product-button");
			await user.click(addBtn);

			const titleInput = await screen.findByTestId("title-input");
			const descriptionInput = await screen.findByTestId("description-input");
			const priceInput = await screen.findByTestId("price-input");

			await user.type(titleInput, newProduct.title);
			await user.type(descriptionInput, newProduct.description);
			await user.type(priceInput, newProduct.price.toString());

			await user.click(getSubmitButton());

			act(() => {
				vi.advanceTimersByTime(500);
			});

			await waitFor(() => {
				expect(screen.getByText("Product 4")).toBeInTheDocument();
				expect(screen.queryByTestId("product-dialog")).not.toBeInTheDocument();
			});
		});
	});

	describe("Empty State Transitions", () => {
		it("should show empty state when all products are deleted", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const afterDeleting1 = mockProducts.filter((p) => p._id !== "1");
			const afterDeleting1And2 = afterDeleting1.filter((p) => p._id !== "2");
			const afterDeletingAll: IProduct[] = [];
			mockGet
				.mockResolvedValueOnce(getProductsData(mockProducts))
				.mockResolvedValueOnce(getProductsData(afterDeleting1))
				.mockResolvedValueOnce(getProductsData(afterDeleting1And2))
				.mockResolvedValueOnce(getProductsData(afterDeletingAll));
			renderComponent();

			await checkInitialProducts();
			// Delete all products
			for (const product of mockProducts.slice()) {
				const deleteButton = screen.getByTestId(`delete-button-${product._id}`);
				await user.click(deleteButton);
				await user.click(screen.getByTestId(`delete-confirm-${product._id}`));
				await waitFor(() => {
					expect(mockDelete).toHaveBeenCalledWith(expect.any(String), {
						data: { companyRef: "test-company" },
					});
				});
				await vi.advanceTimersByTimeAsync(2000);
			}
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			// Should show no data message
			await waitFor(() => {
				expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
				expect(mockGet.mock.calls.length).toBeGreaterThanOrEqual(4);
			});
		});
		it("should transition from empty to populated state", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const newProduct = mockProducts[0]!;
			mockGet.mockResolvedValue(getProductsData([])).mockResolvedValue(getProductsData([newProduct]));

			renderComponent();

			vi.advanceTimersByTime(1000);

			expect(screen.getByTestId("no-data-message")).toBeInTheDocument();

			const addBtn = await screen.findByTestId("add-product-button");
			await user.click(addBtn);

			const titleInput = await screen.findByTestId("title-input");
			const descriptionInput = await screen.findByTestId("description-input");
			const priceInput = await screen.findByTestId("price-input");

			await user.type(titleInput, newProduct.title);
			await user.type(descriptionInput, newProduct.description);
			await user.type(priceInput, newProduct.price.toString());

			await user.click(getSubmitButton());

			act(() => {
				vi.advanceTimersByTime(1000);
			});

			await waitFor(() => {
				expect(screen.queryByTestId("no-data-message")).not.toBeInTheDocument();
				expect(screen.getByText("Product 1")).toBeInTheDocument();
			});
		});
	});

	describe("Permission-Based State Management", () => {
		it("should not allow delete for regular users", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
				[COOKIES.COMPANY_REF]: "test-company",
			});
			resetMenuStore();

			renderComponent();

			expect(screen.queryByTestId("delete-button-1")).not.toBeInTheDocument();
			expect(screen.queryByTestId("delete-button-2")).not.toBeInTheDocument();
		});

		it("should not allow edit for regular users", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
				[COOKIES.COMPANY_REF]: "test-company",
			});
			resetMenuStore();

			renderComponent();

			expect(screen.queryByTestId("edit-button-1")).not.toBeInTheDocument();
			expect(screen.queryByTestId("edit-button-2")).not.toBeInTheDocument();
		});
	});
});
