import { apiClient } from "@/lib/api";
import type {
	GetOneProductResponseType,
	ICreateProductResponse,
	IProductListResponse,
} from "@/module/product/types/index";
import { type ProductFormInput } from "@/module/product/utils/form-utils";
import type { PaginatedSearchQuery } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

const API_USER_URL = "/products";
const API_ADMIN_URL = "/admin/products";

export const useProductAPI = () => {
	const useCreateProductMutation = () =>
		useMutation({
			mutationFn: async (data: ProductFormInput) => {
				const res = await apiClient.post<ICreateProductResponse>(`${API_ADMIN_URL}`, data);
				return res.data.data;
			},
		});

	const useGetAllProductsQuery = (query: PaginatedSearchQuery, onDeleteItem?: (id: string) => void) => {
		return useQuery({
			queryKey: [
				"products",
				query?.searchValue,
				query?.page,
				query?.pageSize,
				query?.sortBy,
				query.companyRef,
				onDeleteItem,
			].filter(Boolean),
			queryFn: async () => {
				const res = await apiClient.get<IProductListResponse>(`${API_USER_URL}`, { params: query });
				return res.data.data;
			},
		});
	};

	const useGetOneProductQuery = (id: string, companyRef: string) => {
		return useQuery({
			queryKey: ["products", id, companyRef],
			queryFn: async () => {
				const res = await apiClient.get<GetOneProductResponseType>(`${API_USER_URL}/${id}`, {
					params: { companyRef },
				});
				return res.data.data;
			},
			enabled: !!id && !!companyRef, // Only execute the query when id and companyRef are available
		});
	};

	const useUpdateProductMutation = () =>
		useMutation({
			mutationFn: async ({ id, data }: { id: string; data: ProductFormInput }) => {
				const res = await apiClient.put(`${API_ADMIN_URL}/${id}`, data);
				return res;
			},
		});

	const useDeleteProductMutation = () =>
		useMutation({
			mutationFn: async ({ id, companyRef }: { id: string; companyRef: string }) => {
				const res = await apiClient.delete(`${API_ADMIN_URL}/${id}`, { data: { companyRef } });
				return res;
			},
		});

	return {
		useCreateProductMutation,
		useGetAllProductsQuery,
		useGetOneProductQuery,
		useUpdateProductMutation,
		useDeleteProductMutation,
	};
};
