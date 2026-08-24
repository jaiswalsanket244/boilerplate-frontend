import { apiClient } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { IAthenaQueryRequest, IAthenaQueryResponse } from "@/module/audit-logs/types";

export const useAthenaAPI = () => {
	const useRunQueryMutation = () => {
		return useMutation({
			mutationFn: async (data: IAthenaQueryRequest) => {
				const response = await apiClient.post<IAthenaQueryResponse>("/super-admin/audit-logs/athena", data);
				return response.data.data;
			},
		});
	};

	return {
		useRunQueryMutation,
	};
};
