import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { IGetUserResponse } from "@/module/teams/types/index";

export const useAdminUserAPI = () => {
	const useGetOneUserQuery = (userId: string) => {
		return useQuery({
			queryKey: ["user-details", userId],
			queryFn: async () => {
				const response = await apiClient.get<IGetUserResponse>(`/admin/user/${userId}`);
				return response.data;
			},
			enabled: !!userId,
		});
	};
	return { useGetOneUserQuery };
};
