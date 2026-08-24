import { apiClient } from "@/lib/api";
import {
	type ICancelInvitationResponse,
	type IUpdateRoleResponse,
	type IUpdateStatusResponse,
	TEAMS_TAB_TYPES,
	type IApiResponse,
	type IInviteUserResponse,
	type InvitedUsers,
	type InviteUserData,
	type IInviteMultipleUserResponse,
	type InviteUsersData,
	type IUserCountResponse,
	type IUserListResponse,
} from "@/module/teams/types";
import type { ApiError } from "@/types/api-response";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useTeamAPI = () => {
	const useInviteUser = useMutation({
		mutationFn: async (data: InviteUserData) => {
			const response = await apiClient.post<IInviteUserResponse>("/admin/invite-users/", data);
			return response.data;
		},
	});

	const useInviteMultipleUser = useMutation({
		mutationFn: async (data: InviteUsersData) => {
			const response = await apiClient.post<IInviteMultipleUserResponse>("/admin/invite-users/users", data);
			return response.data;
		},
		onError: (err: ApiError) => err,
	});

	const useDeleteUser = useMutation({
		mutationFn: async (body: { userId: string; Status: string; companyRef?: string }) => {
			const response = await apiClient.post<IApiResponse>(`/admin/invite-users/${body.userId}`, {
				Status: body.Status,
				companyRef: body.companyRef,
			});
			return response.data;
		},
	});

	const useResendInvitationMutation = useMutation({
		mutationFn: async (body: { email: string; companyRef?: string }) => {
			const response = await apiClient.post<IApiResponse>(`/admin/invite-users/resend-invite`, {
				email: body?.email,
				companyRef: body?.companyRef,
			});
			return response.data;
		},
	});

	const useCancelInviteMutation = useMutation({
		mutationFn: async (body: { userId: string; companyRef?: string }) => {
			const response = await apiClient.post<ICancelInvitationResponse>(
				`/admin/invite-users/cancel-invite/${body.userId}`
			);
			return response.data;
		},
	});

	const useUpdateStatusMutation = useMutation({
		mutationFn: async (update: { userId: string; status: string; companyRef?: string }) => {
			const response = await apiClient.put<IUpdateStatusResponse>(`/admin/user/status/${update.userId}`, update);
			return response.data;
		},
	});

	const useUpdateRoleMutation = useMutation({
		mutationFn: async (update: { userId: string; role: string; companyId: string }) => {
			const response = await apiClient.put<IUpdateRoleResponse>(`/admin/user/user-role/${update.companyId}`, update);
			return response.data;
		},
	});

	const useGetInvitedUsers = (companyRef: string) => {
		return useQuery<InvitedUsers>({
			queryKey: ["invitedUsers", companyRef],
			queryFn: async () => {
				const response = await apiClient.get<InvitedUsers>(`/admin/invite-users/`, {
					params: { companyRef },
				});
				return response.data;
			},
			enabled: !!companyRef,
		});
	};

	const useGetTeamMembers = (companyRef: string, tab: TEAMS_TAB_TYPES, query?: string) => {
		const queryString = query
			? `?${query}&companyRef=${companyRef}&tab=${tab}`
			: `?companyRef=${companyRef}&tab=${tab}`;

		return useQuery({
			queryKey: ["team-members", companyRef, tab, query],
			queryFn: async () => {
				if (tab === TEAMS_TAB_TYPES.INVITED_USERS) {
					const response = await apiClient.get<IUserListResponse>(`/admin/invite-users/${queryString}`);
					return response.data.data;
				}
				const response = await apiClient.get<IUserListResponse>(`/admin/invite-users/users/${queryString}`);
				return response.data.data;
			},
			enabled: !!companyRef,
		});
	};

	const useUsersCountQuery = (companyRef: string) => {
		return useQuery({
			queryKey: ["users-count", companyRef],
			queryFn: async () => {
				const response = await apiClient.get<IUserCountResponse>(`/admin/invite-users/users-count`, {
					params: { companyRef },
				});
				return response.data.data;
			},
			enabled: !!companyRef,
		});
	};

	return {
		useInviteUser,
		useDeleteUser,
		useResendInvitationMutation,
		useUpdateStatusMutation,
		useUpdateRoleMutation,
		useInviteMultipleUser,
		useCancelInviteMutation,
		useGetInvitedUsers,
		useGetTeamMembers,
		useUsersCountQuery,
	};
};
