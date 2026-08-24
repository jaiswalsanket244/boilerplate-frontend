import { ProductsTable } from "@/module/product/components/products-table";
import { setupCookies } from "@/tests/utils/mock-cookies-next";
import { resetMenuStore, seedMenuPermissions } from "@/tests/utils/menu-store-helpers";
import { renderWithProviders } from "@/tests/utils/mock-providers";
import {
	mockGetRowAnimationClasses,
	resetRecentlyChangedRowsMock,
	setRecentlyChangedRows,
	useRecentlyChangedRows,
} from "@/tests/utils/mock-use-recently-changed-rows";
import { COOKIES, ROLES } from "@/types";
import { PERMISSIONS } from "@/types/permission";
import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/module/product/components/delete-product-alert", () => ({
	DeleteProductAlert: ({ onDeleteProduct, productId }: any) => (
		<button onClick={onDeleteProduct} data-testid={`delete-button-${productId}`}>
			Delete
		</button>
	),
}));

describe("ProductsTable Component", () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();
	let user: UserEvent;

	const mockProducts = [
		{
			_id: "1",
			companyRef: "comp1",
			title: "Product 1",
			description: "Description 1",
			price: 100,
			costPrice: 50,
			retailPrice: 120,
			salePrice: 90,
		},
		{
			_id: "2",
			companyRef: "comp1",
			title: "Product 2",
			description: "Description 2",
			price: 200,
			costPrice: 100,
			retailPrice: 220,
			salePrice: 180,
		},
		{
			_id: "3",
			title: "Product 3",
			description: "Description 3",
			companyRef: "comp1",
			price: 300,
			costPrice: 150,
			retailPrice: 320,
			salePrice: 270,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		resetRecentlyChangedRowsMock();
		user = userEvent.setup();
		setupCookies({ [COOKIES.USER_TYPE]: ROLES.ADMIN });
		seedMenuPermissions([PERMISSIONS.PRODUCTS_MANAGE]);
	});

	afterEach(() => {
		vi.clearAllMocks();
		resetRecentlyChangedRowsMock();
		resetMenuStore();
	});

	const renderComponent = (props = {}) => {
		return renderWithProviders(
			<ProductsTable products={mockProducts} isSuccess={true} onEdit={mockOnEdit} onDelete={mockOnDelete} {...props} />
		);
	};

	describe("Table Structure", () => {
		it("should render table element", () => {
			renderComponent();
			expect(screen.getByTestId("products-table")).toBeInTheDocument();
		});

		it("should render table header", () => {
			renderComponent();
			expect(screen.getByTestId("table-header")).toBeInTheDocument();
		});

		it("should render table body", () => {
			renderComponent();
			expect(screen.getByTestId("table-body")).toBeInTheDocument();
		});

		it("should render all column headers", () => {
			renderComponent();

			expect(screen.getByText("Product Name")).toBeInTheDocument();
			expect(screen.getByText("Description")).toBeInTheDocument();
			expect(screen.getByText("Price")).toBeInTheDocument();
			expect(screen.getByText("Action")).toBeInTheDocument();
		});
	});

	describe("Products Display", () => {
		it("should render all products when data is available", () => {
			renderComponent();

			expect(screen.getByTestId("product-row-1")).toBeInTheDocument();
			expect(screen.getByTestId("product-row-2")).toBeInTheDocument();
			expect(screen.getByTestId("product-row-3")).toBeInTheDocument();
		});

		it("should display product titles", () => {
			renderComponent();

			expect(screen.getByText("Product 1")).toBeInTheDocument();
			expect(screen.getByText("Product 2")).toBeInTheDocument();
			expect(screen.getByText("Product 3")).toBeInTheDocument();
		});

		it("should display product descriptions", () => {
			renderComponent();

			expect(screen.getByText("Description 1")).toBeInTheDocument();
			expect(screen.getByText("Description 2")).toBeInTheDocument();
			expect(screen.getByText("Description 3")).toBeInTheDocument();
		});

		it("should display product prices with currency symbol", () => {
			renderComponent();

			expect(screen.getByText("$100")).toBeInTheDocument();
			expect(screen.getByText("$200")).toBeInTheDocument();
			expect(screen.getByText("$300")).toBeInTheDocument();
		});

		it("should render correct number of rows", () => {
			renderComponent();

			const rows = screen.getAllByTestId(/^product-row-/);
			expect(rows).toHaveLength(3);
		});
	});

	describe("Empty State", () => {
		it("should show no data message when products array is empty", () => {
			renderComponent({ products: [] });
			expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
			expect(screen.getByText("No Data")).toBeInTheDocument();
		});

		it("should show no data message when products is null", () => {
			renderComponent({ products: null });

			expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
		});

		it("should show no data message when products is undefined", () => {
			renderComponent({ products: undefined });

			expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
		});

		it("should show no data message when isSuccess is false", () => {
			renderComponent({ isSuccess: false });

			expect(screen.getByTestId("no-data-message")).toBeInTheDocument();
		});

		it("should span no data message across all columns", () => {
			renderComponent({ products: [] });

			const noDataCell = screen.getByTestId("no-data-message").closest("td");
			expect(noDataCell).toHaveAttribute("colSpan", "4");
		});

		it("should center align no data message", () => {
			renderComponent({ products: [] });
			const noDataCell = screen.getByTestId("no-data-message").closest("td");
			expect(noDataCell).toHaveClass("py-5", "text-center");
		});
	});

	describe("Edit Functionality", () => {
		it("should call onEdit with correct product when edit button is clicked", async () => {
			renderComponent();

			await user.click(screen.getByTestId("edit-button-1"));

			expect(mockOnEdit).toHaveBeenCalledTimes(1);
			expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
		});

		it("should call onEdit for different products", async () => {
			renderComponent();

			await user.click(screen.getByTestId("edit-button-1"));
			await user.click(screen.getByTestId("edit-button-2"));
			await user.click(screen.getByTestId("edit-button-3"));

			expect(mockOnEdit).toHaveBeenCalledTimes(3);
			expect(mockOnEdit).toHaveBeenNthCalledWith(1, mockProducts[0]);
			expect(mockOnEdit).toHaveBeenNthCalledWith(2, mockProducts[1]);
			expect(mockOnEdit).toHaveBeenNthCalledWith(3, mockProducts[2]);
		});

		it("should render edit button for each product", () => {
			renderComponent();

			expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
			expect(screen.getByTestId("edit-button-2")).toBeInTheDocument();
			expect(screen.getByTestId("edit-button-3")).toBeInTheDocument();
		});
	});

	describe("Delete Functionality", () => {
		it("should call onDelete with correct product id when delete button is clicked", async () => {
			renderComponent();

			await user.click(screen.getByTestId("delete-button-1"));

			expect(mockOnDelete).toHaveBeenCalledTimes(1);
			expect(mockOnDelete).toHaveBeenCalledWith("1");
		});

		it("should call onDelete for different products", async () => {
			renderComponent();

			await user.click(screen.getByTestId("delete-button-1"));
			await user.click(screen.getByTestId("delete-button-2"));
			await user.click(screen.getByTestId("delete-button-3"));

			expect(mockOnDelete).toHaveBeenCalledTimes(3);
			expect(mockOnDelete).toHaveBeenNthCalledWith(1, "1");
			expect(mockOnDelete).toHaveBeenNthCalledWith(2, "2");
			expect(mockOnDelete).toHaveBeenNthCalledWith(3, "3");
		});

		it("should render delete button for each product", () => {
			renderComponent();
			expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
			expect(screen.getByTestId("delete-button-2")).toBeInTheDocument();
			expect(screen.getByTestId("delete-button-3")).toBeInTheDocument();
		});
	});

	describe("Row Animation Classes", () => {
		it("should call getRowAnimationClasses for each product", () => {
			renderComponent();

			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("1");
			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("2");
			expect(mockGetRowAnimationClasses).toHaveBeenCalledWith("3");
		});

		it("should apply animation classes to created products", () => {
			setRecentlyChangedRows({ created: ["1"] });

			renderComponent();

			const row = screen.getByTestId("product-row-1");
			expect(row).toHaveClass("animate-fade-in-blue");
		});

		it("should apply animation classes to updated products", () => {
			setRecentlyChangedRows({ updated: ["2"] });

			renderComponent();

			const row = screen.getByTestId("product-row-2");
			expect(row).toHaveClass("animate-fade-in-yellow");
		});

		it("should apply animation classes to deleted products", () => {
			setRecentlyChangedRows({ deleted: ["3"] });

			renderComponent();

			const row = screen.getByTestId("product-row-3");
			expect(row).toHaveClass("animate-delete-row");
		});

		it("should apply animation classes to products with errors", () => {
			setRecentlyChangedRows({ errors: ["1"] });

			renderComponent();

			const row = screen.getByTestId("product-row-1");
			expect(row).toHaveClass("animate-error-shake");
		});

		it("should apply multiple animation classes when needed", () => {
			setRecentlyChangedRows({
				created: ["1"],
				updated: ["1"],
			});

			renderComponent();

			const row = screen.getByTestId("product-row-1");
			expect(row).toHaveClass("animate-fade-in-blue", "animate-fade-in-yellow");
		});
	});

	describe("Integration with useRecentlyChangedRows", () => {
		it("should call useRecentlyChangedRows hook", () => {
			renderComponent();

			expect(useRecentlyChangedRows).toHaveBeenCalled();
		});

		it("should use getRowAnimationClasses from hook", () => {
			renderComponent();

			expect(mockGetRowAnimationClasses).toHaveBeenCalledTimes(3);
		});
	});

	describe("Product Data Edge Cases", () => {
		it("should handle products with missing optional fields", () => {
			const incompleteProducts = [
				{
					_id: "1",
					title: "Product 1",
					price: 100,
				},
			];

			renderComponent({
				products: incompleteProducts,
			});

			expect(screen.getByText("Product 1")).toBeInTheDocument();
			expect(screen.getByText("$100")).toBeInTheDocument();
		});

		it("should handle products with zero price", () => {
			const freeProducts = [
				{
					_id: "1",
					title: "Free Product",
					description: "Free",
					price: 0,
				},
			];

			renderComponent({
				products: freeProducts,
			});

			expect(screen.getByText("$0")).toBeInTheDocument();
		});

		it("should handle products with very long titles", () => {
			const longTitleProducts = [
				{
					_id: "1",
					title: "A".repeat(200),
					description: "Description",
					price: 100,
				},
			];

			renderComponent({
				products: longTitleProducts,
			});
			expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
		});

		it("should handle products with HTML in description", () => {
			const htmlProducts = [
				{
					_id: "1",
					title: "Product",
					description: "<strong>Bold</strong> description",
					price: 100,
				},
			];

			renderComponent({
				products: htmlProducts,
			});

			// The description is rendered via dangerouslySetInnerHTML in ProductTableRow
			expect(screen.getByText("Product")).toBeInTheDocument();
		});

		it("should handle products with special characters in title", () => {
			const specialCharProducts = [
				{
					_id: "1",
					title: "Product & Co. <Test>",
					description: "Description",
					price: 100,
				},
			];

			renderComponent({
				products: specialCharProducts,
			});

			expect(screen.getByText("Product & Co. <Test>")).toBeInTheDocument();
		});
	});

	describe("Performance Considerations", () => {
		it("should render large product lists efficiently", () => {
			const largeProductList = Array.from({ length: 100 }, (_, i) => ({
				_id: String(i + 1),
				title: `Product ${i + 1}`,
				description: `Description ${i + 1}`,
				price: (i + 1) * 10,
			}));

			renderComponent({ products: largeProductList });

			const rows = screen.getAllByTestId(/^product-row-/);
			expect(rows).toHaveLength(100);
		});
	});

	describe("Props Validation", () => {
		it("should handle all props being passed correctly", () => {
			const props = {
				products: mockProducts,
				isSuccess: true,
				onEdit: mockOnEdit,
				onDelete: mockOnDelete,
			};

			renderComponent(props);

			// Verify component renders without errors
			expect(screen.getByTestId("products-table")).toBeInTheDocument();
			expect(screen.getAllByTestId(/^product-row-/)).toHaveLength(3);
		});

		it("should pass correct props to ProductTableRow", () => {
			renderComponent();
			// Each row should have received correct props
			expect(screen.getByTestId("product-row-1")).toBeInTheDocument();
			expect(screen.getByTestId("edit-button-1")).toBeInTheDocument();
			expect(screen.getByTestId("delete-button-1")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should use semantic table elements", () => {
			renderComponent();

			expect(screen.getByTestId("products-table").tagName).toBe("TABLE");
			expect(screen.getByTestId("table-header").tagName).toBe("THEAD");
			expect(screen.getByTestId("table-body").tagName).toBe("TBODY");
		});

		it("should maintain proper table structure", () => {
			const { container } = renderComponent();

			const table = container.querySelector("table");
			const thead = table?.querySelector("thead");
			const tbody = table?.querySelector("tbody");

			expect(table).toBeInTheDocument();
			expect(thead).toBeInTheDocument();
			expect(tbody).toBeInTheDocument();
		});
	});
});
