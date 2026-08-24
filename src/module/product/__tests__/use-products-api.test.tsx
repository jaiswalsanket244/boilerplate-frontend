import { mockProducts } from "@/module/product/__tests__/mocks/mock-products";
import { useProductAPI } from "@/module/product/hooks/useProducts";
import { mockDelete, mockGet, mockPost, mockPut } from "@/tests/utils/mock-api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

const wrapper = ({ children }: { children: React.ReactNode }) => {
	const qc = createClient();
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useProductAPI hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("useGetAllProductsQuery fetches products", async () => {
		mockGet.mockResolvedValue({ data: { data: { data: mockProducts } } });

		const { result } = renderHook(
			() => {
				const { useGetAllProductsQuery } = useProductAPI();
				return useGetAllProductsQuery({ searchValue: "", page: 1, pageSize: 10, companyRef: "comp1" });
			},
			{ wrapper }
		);

		await waitFor(() => {
			expect(result.current.data?.data).toBeDefined();
		});

		expect(result.current.data?.data).toEqual(mockProducts);

		expect(mockGet).toHaveBeenCalledWith("/products", { params: expect.any(Object) });
	});

	it("useCreateProductMutation posts product", async () => {
		const created = { data: { data: { _id: "10", title: "created" } } };
		mockPost.mockResolvedValue(created);

		const { result } = renderHook(
			() => {
				const { useCreateProductMutation } = useProductAPI();
				return useCreateProductMutation();
			},
			{ wrapper }
		);

		await act(async () => {
			const res = await result.current.mutateAsync({ title: "created" } as any);
			// the hook returns res.data.data according to your implementation
			expect(mockPost).toHaveBeenCalledWith("/admin/products", { title: "created" });
		});
	});

	it("useUpdateProductMutation calls put", async () => {
		mockPut.mockResolvedValue({ data: { data: { _id: "1", title: "updated" } } });

		const { result } = renderHook(
			() => {
				const { useUpdateProductMutation } = useProductAPI();
				return useUpdateProductMutation();
			},
			{ wrapper }
		);

		await act(async () => {
			await result.current.mutateAsync({ id: "1", data: { title: "updated" } } as any);
			expect(mockPut).toHaveBeenCalledWith("/admin/products/1", { title: "updated" });
		});
	});

	it("useDeleteProductMutation calls delete", async () => {
		mockDelete.mockResolvedValue({ data: { success: true } });

		const { result } = renderHook(
			() => {
				const { useDeleteProductMutation } = useProductAPI();
				return useDeleteProductMutation();
			},
			{ wrapper }
		);

		await act(async () => {
			await result.current.mutateAsync({ id: "2", companyRef: "comp1" } as any);
			expect(mockDelete).toHaveBeenCalledWith("/admin/products/2", { data: { companyRef: "comp1" } });
		});
	});
});
