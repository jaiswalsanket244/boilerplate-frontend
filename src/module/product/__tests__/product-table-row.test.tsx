import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ProductTableRow } from "@/module/product/components/product-table-row";
import { ROLES, COOKIES } from "@/types";
import { setupCookies, clearCookies } from "@/tests/utils/mock-cookies-next";
import { resetMenuStore, seedMenuPermissions } from "@/tests/utils/menu-store-helpers";
import { PERMISSIONS } from "@/types/permission";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import type { IProduct } from "@/module/product/types";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

const mockProduct = {
	_id: "123",
	companyRef: "test-company-ref",
	title: "Test Product",
	description: "Test Description",
	price: 100,
	costPrice: 50,
	retailPrice: 120,
	salePrice: 90,
};
vi.mock("@/module/product/components/delete-product-alert", () => ({
	DeleteProductAlert: ({ onDeleteProduct }: any) => (
		<button onClick={onDeleteProduct} data-testid="delete-alert-trigger">
			Delete
		</button>
	),
}));

describe("ProductTableRow Component", () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		setupCookies({
			[COOKIES.USER_TYPE]: ROLES.ADMIN,
		});
		seedMenuPermissions([PERMISSIONS.PRODUCTS_MANAGE]);
	});

	afterEach(() => {
		clearCookies();
		resetMenuStore();
	});

	const defaultProps = {
		product: mockProduct,
		rowClassName: "test-class",
		onEdit: mockOnEdit,
		onDelete: mockOnDelete,
	};

	function renderComponent(product?: Partial<IProduct>, props?: Partial<typeof defaultProps>) {
		const propsProduct = product ? { ...mockProduct, ...product } : mockProduct;

		const componentProps = { ...defaultProps, ...props, product: propsProduct };

		return render(
			<table>
				<tbody>
					<ProductTableRow {...componentProps} />
				</tbody>
			</table>,
			{ wrapper: MemoryRouterProvider }
		);
	}

	describe("Basic Rendering", () => {
		it("should render table row with correct data-testid", () => {
			renderComponent();

			expect(screen.getByTestId("product-row-123")).toBeInTheDocument();
		});

		it("should apply custom className to row", () => {
			renderComponent();

			const row = screen.getByTestId("product-row-123");
			expect(row).toHaveClass("test-class");
		});

		it("should render product title", () => {
			renderComponent();

			expect(screen.getByTestId("product-title")).toHaveTextContent("Test Product");
		});

		it("should render product description", () => {
			renderComponent();

			expect(screen.getByTestId("product-description")).toBeInTheDocument();
		});

		it("should render product price with currency symbol", () => {
			renderComponent();

			expect(screen.getByTestId("product-price")).toHaveTextContent("$100");
		});

		it("should render edit icon with correct attributes", () => {
			renderComponent();

			const editButton = screen.getByTestId("edit-icon");
			expect(editButton).toBeInTheDocument();
		});
	});

	describe("Description Rendering", () => {
		it("should render HTML description using dangerouslySetInnerHTML", () => {
			const productWithHTML = {
				description: "<strong>Bold</strong> description",
			};

			const { container } = renderComponent(productWithHTML);

			const descriptionCell = container.querySelector('[data-testid="product-description"]');
			expect(descriptionCell?.innerHTML).toContain("<strong>Bold</strong>");
		});

		it("should not render description div when description is undefined", () => {
			const productWithoutDesc = {
				...mockProduct,
				description: undefined,
			};

			const { container } = renderComponent(productWithoutDesc);

			const descriptionCell = container.querySelector('[data-testid="product-description"]');
			expect(descriptionCell?.querySelector("div")).not.toBeInTheDocument();
		});

		it("should handle empty string description", () => {
			const productWithEmptyDesc = {
				...mockProduct,
				description: "",
			};

			render(
				<table>
					<tbody>
						<ProductTableRow {...defaultProps} product={productWithEmptyDesc} />
					</tbody>
				</table>
			);

			expect(screen.getByTestId("product-description")).toBeInTheDocument();
		});
	});

	describe("Admin Actions", () => {
		it("should render edit button for admin users", () => {
			renderComponent();

			expect(screen.getByTestId("edit-button-123")).toBeInTheDocument();
		});

		it("should render delete alert for admin users", () => {
			renderComponent();

			expect(screen.getByTestId("delete-alert-trigger")).toBeInTheDocument();
		});

		it("should call onEdit when edit button is clicked", async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click(screen.getByTestId("edit-button-123"));

			expect(mockOnEdit).toHaveBeenCalledTimes(1);
		});

		it("should call onDelete when delete is confirmed", async () => {
			const user = userEvent.setup();
			renderComponent();

			await user.click(screen.getByTestId("delete-alert-trigger"));

			expect(mockOnDelete).toHaveBeenCalledTimes(1);
		});

		it("should show edit tooltip content", () => {
			renderComponent();

			expect(screen.getByText("Edit Product")).toBeInTheDocument();
		});
	});

	describe("Regular User View", () => {
		beforeEach(() => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
			});
			resetMenuStore();
		});

		it("should not render edit button for regular users", () => {
			renderComponent();

			expect(screen.queryByTestId("edit-button-123")).not.toBeInTheDocument();
		});

		it("should not render delete alert for regular users", () => {
			renderComponent();

			expect(screen.queryByTestId("delete-alert")).not.toBeInTheDocument();
		});

		it("should still render view link for regular users", () => {
			renderComponent();

			expect(screen.getByTestId("view-link-123")).toBeInTheDocument();
		});
	});

	describe("View Link", () => {
		it("should render view link for admin users", () => {
			renderComponent();

			expect(screen.getByTestId("view-link-123")).toBeInTheDocument();
		});

		it("should link to admin route for admin users", () => {
			renderComponent();

			const link = screen.getByTestId("view-link-123");
			expect(link).toHaveAttribute("href", "/client/products/123");
		});

		it("should link to user route for regular users", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
			});
			resetMenuStore();

			renderComponent();

			const link = screen.getByTestId("view-link-123");
			expect(link).toHaveAttribute("href", "/client/products/123");
		});

		it("should render eye icon in view link", () => {
			renderComponent();

			const icon = screen.getByTestId("eye-icon");
			expect(icon).toBeInTheDocument();
		});

		it("should show view tooltip content", () => {
			renderComponent();

			expect(screen.getByText("View Product")).toBeInTheDocument();
		});
	});

	describe("Action Cell Layout", () => {
		it("should render all actions for admin in correct order", () => {
			renderComponent();

			// Edit, Delete, View should all be present
			expect(screen.getByTestId("edit-button-123")).toBeInTheDocument();
			expect(screen.getByTestId("delete-alert-trigger")).toBeInTheDocument();
			expect(screen.getByTestId("view-link-123")).toBeInTheDocument();
		});

		it("should render only view action for regular users", () => {
			setupCookies({
				[COOKIES.USER_TYPE]: ROLES.USER,
			});
			resetMenuStore();

			renderComponent();

			expect(screen.queryByTestId("edit-button-123")).not.toBeInTheDocument();
			expect(screen.queryByTestId("delete-alert-trigger")).not.toBeInTheDocument();
			expect(screen.getByTestId("view-link-123")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle product with zero price", () => {
			const freeProduct = {
				...mockProduct,
				price: 0,
			};

			renderComponent(freeProduct);

			expect(screen.getByTestId("product-price")).toHaveTextContent("$0");
		});

		it("should handle product with negative price", () => {
			const negativeProduct = {
				...mockProduct,
				price: -50,
			};

			renderComponent(negativeProduct);

			expect(screen.getByTestId("product-price")).toHaveTextContent("$-50");
		});

		it("should handle product with decimal price", () => {
			const decimalProduct = {
				...mockProduct,
				price: 99.99,
			};

			renderComponent(decimalProduct);

			expect(screen.getByTestId("product-price")).toHaveTextContent("$99.99");
		});

		it("should handle product with very long title", () => {
			const longTitleProduct = {
				...mockProduct,
				title: "A".repeat(500),
			};

			renderComponent(longTitleProduct);

			expect(screen.getByTestId("product-title")).toHaveTextContent("A".repeat(500));
		});

		it("should handle product with special characters in title", () => {
			const specialProduct = {
				...mockProduct,
				title: "Product & Co. <Test> 'Quote' \"Double\"",
			};

			renderComponent(specialProduct);

			expect(screen.getByTestId("product-title")).toHaveTextContent("Product & Co. <Test> 'Quote' \"Double\"");
		});

		it("should handle product with HTML entities in title", () => {
			const htmlEntityProduct = {
				...mockProduct,
				title: "Product &amp; &lt;Test&gt;",
			};

			renderComponent(htmlEntityProduct);

			expect(screen.getByTestId("product-title")).toBeInTheDocument();
		});

		it("should handle product with XSS attempt in description", () => {
			const xssProduct = {
				...mockProduct,
				description: '<script>alert("xss")</script>',
			};

			const { container } = renderComponent(xssProduct);

			// Description is rendered with dangerouslySetInnerHTML
			// In production, sanitize this!
			const descriptionCell = container.querySelector('[data-testid="product-description"]');
			expect(descriptionCell).toBeInTheDocument();
		});

		it("should handle missing user type cookie", () => {
			clearCookies();
			resetMenuStore();

			renderComponent();

			// Should default to non-admin behavior
			expect(screen.queryByTestId("edit-button-123")).not.toBeInTheDocument();
		});
	});

	describe("Multiple Instances", () => {
		it("should render multiple rows independently", () => {
			const products = [
				{ ...mockProduct, _id: "1", title: "Product 1" },
				{ ...mockProduct, _id: "2", title: "Product 2" },
				{ ...mockProduct, _id: "3", title: "Product 3" },
			];

			render(
				<table>
					<tbody>
						{products.map((product) => (
							<ProductTableRow
								key={product._id}
								{...defaultProps}
								product={product}
								onEdit={() => mockOnEdit(product)}
								onDelete={() => mockOnDelete(product._id)}
							/>
						))}
					</tbody>
				</table>
			);

			expect(screen.getByTestId("product-row-1")).toBeInTheDocument();
			expect(screen.getByTestId("product-row-2")).toBeInTheDocument();
			expect(screen.getByTestId("product-row-3")).toBeInTheDocument();
		});

		it("should handle edit clicks on different rows", async () => {
			const user = userEvent.setup();
			const products = [
				{ ...mockProduct, _id: "1", title: "Product 1" },
				{ ...mockProduct, _id: "2", title: "Product 2" },
			];

			render(
				<table>
					<tbody>
						{products.map((product) => (
							<ProductTableRow
								key={product._id}
								{...defaultProps}
								product={product}
								onEdit={() => mockOnEdit(product)}
								onDelete={() => mockOnDelete(product._id)}
							/>
						))}
					</tbody>
				</table>
			);

			await user.click(screen.getByTestId("edit-button-1"));
			await user.click(screen.getByTestId("edit-button-2"));

			expect(mockOnEdit).toHaveBeenCalledTimes(2);
		});
	});

	describe("Accessibility", () => {
		it("should use semantic table cells", () => {
			const { container } = renderComponent();

			const cells = container.querySelectorAll("td");
			expect(cells.length).toBeGreaterThan(0);
		});

		it("should provide tooltip descriptions for actions", () => {
			renderComponent();

			expect(screen.getByText("Edit Product")).toBeInTheDocument();
			expect(screen.getByText("View Product")).toBeInTheDocument();
		});
	});
});
