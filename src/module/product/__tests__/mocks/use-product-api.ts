import { mockProducts } from "@/module/product/__tests__/mocks/mock-products";

let isPending = false;

export const resetProductMocks = () => {
	isPending = false;

	mockCreateProduct.mockReset();
	mockUpdateProduct.mockReset();
	mockDeleteProduct.mockReset();
};
export const setIsPending = (value: boolean) => {
	isPending = value;
};
export const mockCreateProduct = vi.fn();
export const mockUpdateProduct = vi.fn();
export const mockDeleteProduct = vi.fn();
export const mockRefetchProducts = vi.fn().mockResolvedValue({ data: [{ items: mockProducts }] });

vi.mock("@/module/product/hooks/useProducts", async (importActual) => {
	const actual = await importActual<typeof import("@/module/product/hooks/useProducts")>();
	return {
		...actual,
		useProductAPI: () => ({
			...actual.useProductAPI(),
			useCreateProductMutation: () => ({
				mutateAsync: mockCreateProduct,
				get isPending() {
					return isPending;
				},
			}),
			useUpdateProductMutation: () => ({
				mutateAsync: mockUpdateProduct,
				get isPending() {
					return isPending;
				},
			}),
			useDeleteProductMutation: () => ({
				mutateAsync: mockDeleteProduct,
				get isPending() {
					return isPending;
				},
			}),
		}),
	};
});
