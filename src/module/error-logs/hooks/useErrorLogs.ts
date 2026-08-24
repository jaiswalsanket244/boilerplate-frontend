import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	ErrorLogSearchQuery,
	GetAllErrorLogsResponseType,
	LoginResponseType,
	UpdateErrorLogType,
	UserLoginDataType,
} from "@/module/error-logs/types";

const API_SYSTEM_URL = "/system/error-logs";

export const useErrorLogsAPI = () => {
	const usePostLoginMutation = useMutation({
		mutationFn: async (userData: UserLoginDataType) => {
			const response = await apiClient.post<LoginResponseType>(`${API_SYSTEM_URL}/login`, userData);
			return response.data.data;
		},
	});

	const useUpdateErrorLogMutation = useMutation({
		mutationFn: async ({ id, isImportantFlag }: UpdateErrorLogType) => {
			const res = await apiClient.put(`${API_SYSTEM_URL}/${id}`, { isImportantFlag });
			return res;
		},
	});

	const useGetAllErrorLogsQuery = (query: ErrorLogSearchQuery) => {
		return useQuery({
			queryKey: ["error-logs", query?.errorType, query?.page, query?.pageSize, query?.sortBy],
			queryFn: async () => {
				const res = await apiClient.get<GetAllErrorLogsResponseType>(`${API_SYSTEM_URL}`, { params: query });
				return res.data.data;
			},
		});
	};

	return {
		usePostLoginMutation,
		useUpdateErrorLogMutation,
		useGetAllErrorLogsQuery,
	};
};
