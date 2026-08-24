import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	PaginatedCompanySearchQuery,
	CompanyResponseType,
	CompanyType,
	GetOneCompanyResponseData,
} from "@/module/company/types";
import { ROLES } from "@/types";

const API_URL = "/super-admin/company";

export const useCompanyAPI = () => {
	const useGetAllCompanyData = (query: PaginatedCompanySearchQuery) => {
		return useQuery({
			queryKey: ["companies", query?.searchValue, query?.page, query?.pageSize],
			queryFn: async () => {
				const res = await apiClient.get<{ data: CompanyResponseType[] }>(`${API_URL}/`, { params: query });

				return res.data.data;
			},
		});
	};

	const useGetOneCompanyData = (id: string | null, userRole: string | undefined) => {
		return useQuery({
			queryKey: ["companies", id],
			queryFn: async () => {
				if (id && userRole === ROLES.SUPER_ADMIN) {
					const res = await apiClient.get<{ data: GetOneCompanyResponseData }>(`${API_URL}/${id}`);
					return res.data.data;
				} else {
					return null;
				}
			},
			enabled: !!id, // Only execute the query when id is available
		});
	};

	const useUpdateCompanyData = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyType> }) => {
			const res = await apiClient.put(`${API_URL}/${id}`, data);
			return res;
		},
	});

	return { useGetAllCompanyData, useUpdateCompanyData, useGetOneCompanyData };
};
