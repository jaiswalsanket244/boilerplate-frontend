import { apiClient } from "@/lib/api";
import type {
	ContactFormData,
	ICreateQueryResponse,
	IGetAllQueriesResponse,
	IUpdateQueryPayload,
	TSendEmailPayload,
} from "@/module/profile/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = "/help";
const API_ADMIN_URL = "/admin/help";

const useUserQueryAPI = () => {
	const queryClient = useQueryClient();

	const useCreateUserQuery = () => {
		return useMutation({
			mutationFn: async (data: ContactFormData) => {
				const response = await apiClient.post<ICreateQueryResponse>(`${API_URL}`, data);
				await queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("user-queries"),
				});
				return response.data.data;
			},
		});
	};

	const useGetAllQueries = (queryString?: string) => {
		const url = queryString ? `${API_URL}?${queryString}` : API_URL;

		return useQuery({
			queryKey: ["user-queries", queryString],
			queryFn: async () => {
				const response = await apiClient.get<IGetAllQueriesResponse>(url);
				return response.data.data?.[0];
			},
			staleTime: 5 * 60 * 1000,
		});
	};

	const useSendEmail = () => {
		return useMutation({
			mutationFn: async (data: { payload: TSendEmailPayload; id: string }) => {
				const response = await apiClient.post<ICreateQueryResponse>(`${API_ADMIN_URL}/email/${data.id}`, data.payload);

				return response.data;
			},
		});
	};

	const useUpdateQuery = () => {
		return useMutation({
			mutationFn: async (payload: IUpdateQueryPayload) => {
				const response = await apiClient.put<ICreateQueryResponse>(`${API_ADMIN_URL}/${payload.id}`, payload.data);

				await queryClient.invalidateQueries({
					predicate: (query) => query.queryKey.includes("user-queries"),
				});
				return response.data.data;
			},
		});
	};

	return { useCreateUserQuery, useGetAllQueries, useSendEmail, useUpdateQuery };
};

export default useUserQueryAPI;
