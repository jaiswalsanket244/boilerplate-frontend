import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as productAPIHook from "@/module/product/hooks/useProducts";
import { useProductOperations } from "@/module/product/hooks/useProductList";
import { mockProducts } from "@/module/product/__tests__/mocks/mock-products";

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

const mockMutate = vi.fn().mockResolvedValue(undefined);
const mockRefetch = vi.fn().mockResolvedValue(undefined);

const fakeUseProductAPI = {
	useDeleteProductMutation: () => ({ mutateAsync: mockMutate }),
	useGetAllProductsQuery: () => ({
		data: [{ items: mockProducts }],
		isSuccess: true,
		refetch: mockRefetch,
	}),
};

describe("useProductOperations hook", () => {
	beforeEach(() => {
		vi.spyOn(productAPIHook, "useProductAPI").mockReturnValue(fakeUseProductAPI as any);

		vi.clearAllMocks();
	});

	it("opens and closes dialog and sets selected product", async () => {
		const { result } = renderHook(() => useProductOperations({ companyRef: "comp1", searchValue: "" }), { wrapper });

		// initially no selected product
		expect(result.current.selectedProduct).toBeUndefined();
		expect(result.current.dialogOpen).toBe(false);

		act(() => {
			result.current.handleOpenCreateDialog();
		});

		expect(result.current.dialogOpen).toBe(true);
		expect(result.current.selectedProduct).toBeUndefined();

		act(() => {
			result.current.handleOpenEditDialog(mockProducts[0]!);
		});

		expect(result.current.selectedProduct?._id).toBe("1");

		act(() => {
			result.current.handleCloseDialog(false);
		});

		expect(result.current.dialogOpen).toBe(false);
		expect(result.current.selectedProduct).toBeUndefined();
	});

	it("handleDeleteProduct calls delete mutation and refetches", async () => {
		const qc = createClient();
		const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

		const { result } = renderHook(() => useProductOperations({ companyRef: "comp1", searchValue: "" }), { wrapper });

		await act(async () => {
			await result.current.handleDeleteProduct("1");
		});

		expect(mockMutate).toHaveBeenCalledWith({ id: "1", companyRef: "comp1" });
		expect(mockRefetch).toHaveBeenCalled();
	});
});
