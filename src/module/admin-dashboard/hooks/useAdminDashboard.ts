import { apiClient } from "@/lib/api";
import type { GetDashboardMetricsType, IUserAnalyticsResponse } from "@/module/admin-dashboard/types/index";
import { useQuery } from "@tanstack/react-query";

const API_ADMIN_URL = "/admin/user";

export const useAdminDashboardAPI = () => {
	const useGetDashboardMetricsQuery = () => {
		return useQuery({
			queryKey: ["dashboard-metrics"],
			queryFn: async () => {
				const response = await apiClient.get<GetDashboardMetricsType>(`${API_ADMIN_URL}/dashboard-metrics`);
				return response.data.data;
			},
		});
	};

	const useGetUserAnalyticsQuery = (type: string, duration: string) => {
		return useQuery({
			queryKey: ["user-analytics", type, duration],
			queryFn: async () => {
				const response = await apiClient.get<IUserAnalyticsResponse>(
					`${API_ADMIN_URL}/user-analytics?type=${type}&duration=${duration}`
				);

				return response.data.data;
			},
		});
	};
	return {
		useGetDashboardMetricsQuery,
		useGetUserAnalyticsQuery,
	};
};
