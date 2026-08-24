import { apiClient } from "@/lib/api";
import { getUserCookies } from "@/lib/utils/cookies";
import type { CompanyType } from "@/module/company/types";
import type {
	ChangePasswordApiResponseType,
	ChangePasswordByIdApiResponseType,
	ChangePasswordByIdType,
	ChangePasswordDataType,
	GetSignedUrlResponseType,
	GetSignedUrlType,
	IGetNotificationsResponse,
	IGetPreferencesResponse,
	IGetUserResponse,
	IMarkAsReadResponse,
	INotificationChannels,
	IUnreadNotificationCountResponse,
	IUpdateCompanyResponse,
	NOTIFICATION_TYPES,
	UpdateApiResponseType,
	UpdatedProfileDataType,
	UpdateProfileByIdApiResponseType,
	UpdateProfileByIdType,
} from "@/module/profile/types";
import { ROLES, type IUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const shouldUseImpersonatedMenu = (user: IUser) => {
	if (user.roles !== ROLES.SUPER_ADMIN || typeof window === "undefined") return false;

	const { isAdminPath, userType } = getUserCookies();

	return isAdminPath && userType === "super-admin";
};

export const useProfileAPI = () => {
	const useChangePassword = useMutation({
		mutationFn: async (data: ChangePasswordDataType) => {
			const response = await apiClient.post<ChangePasswordApiResponseType>("/user/change-password", data);
			return response.data;
		},
	});

	const useGetUserData = () => {
		const userQuery = useQuery({
			queryKey: ["userData"],
			queryFn: async () => {
				const response = await apiClient.get<IGetUserResponse>(`/user/me`);
				return response.data.data;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 30 * 60 * 1000, // 30 minutes
			refetchOnWindowFocus: false,
		});

		return userQuery;
	};

	const useNotifications = (userId: string) => {
		return useQuery({
			queryKey: ["notifications", userId],
			queryFn: async () => {
				const response = await apiClient.get<IGetNotificationsResponse>(`/notification/${userId}`);
				return response.data.data;
			},
			enabled: !!userId,
			refetchOnWindowFocus: false,
		});
	};

	const useUpdateProfile = useMutation({
		mutationFn: async (update: UpdatedProfileDataType) => {
			const response = await apiClient.put<UpdateApiResponseType>("/user/profile", update);
			return response.data;
		},
	});

	const useUpdateProfileById = useMutation({
		mutationFn: async (args: UpdateProfileByIdType) => {
			const { id, update, companyRef } = args;
			const response = await apiClient.put<UpdateProfileByIdApiResponseType>(`/super-admin/user/user-profile/${id}`, {
				update,
				companyRef,
			});
			return response;
		},
	});

	const useChangePasswordById = useMutation({
		mutationFn: async (args: ChangePasswordByIdType) => {
			const { id, data } = args;
			const response = await apiClient.post<ChangePasswordByIdApiResponseType>(
				`/super-admin/user/change-password/${id}`,
				data
			);
			return response;
		},
	});

	const useGetSignedUrl = useMutation({
		mutationFn: async (data: GetSignedUrlType) => {
			const response = await apiClient.post<GetSignedUrlResponseType>("/aws/presigned-url", data);
			return response.data;
		},
	});

	const useUpdateCompany = useMutation({
		mutationFn: async (data: { id: string; data: Partial<CompanyType> }) => {
			const response = await apiClient.put<IUpdateCompanyResponse>(`/admin/company/${data.id}`, data.data);
			return response.data.data;
		},
	});

	const useUnreadNotificationCount = () => {
		return useQuery({
			queryKey: ["notifications", "unread-count"],
			queryFn: async () => {
				const response = await apiClient.get<IUnreadNotificationCountResponse>(`/notification/unread-count`);
				return response.data.data;
			},
			staleTime: 30 * 1000, // 30 seconds
		});
	};
	const useMarkAllAsRead = () => {
		return useMutation({
			mutationFn: async () => {
				const response = await apiClient.post<IGetNotificationsResponse>(`/notification/mark-all-as-read`);
				return response.data.data;
			},
		});
	};

	const useMarkAsRead = () => {
		return useMutation({
			mutationFn: async (id: string) => {
				const response = await apiClient.post<IMarkAsReadResponse>(`/notification/mark-as-read/${id}`);
				return response.data.data;
			},
		});
	};

	const useUpdateNotificationPreferences = () => {
		return useMutation({
			mutationFn: async (data: { type: NOTIFICATION_TYPES; channels: Partial<INotificationChannels> }) => {
				const response = await apiClient.put<IGetPreferencesResponse>("/notification/preferences", data);
				return response.data;
			},
		});
	};
	const useGetNotificationPreferences = () => {
		return useQuery({
			queryKey: ["notification-preferences"],
			queryFn: async () => {
				const response = await apiClient.get<IGetPreferencesResponse>("/notification/preferences");
				return response.data.data;
			},
		});
	};

	const useForcePasswordChangeForCompany = () =>
		useMutation({
			mutationFn: async (companyId: string) => {
				const response = await apiClient.put(`/admin/user/force-password-change/company/${companyId}`);
				return response.data;
			},
		});

	const useForcePasswordChangeForUser = () =>
		useMutation({
			mutationFn: async (userId: string) => {
				const response = await apiClient.put(`/admin/user/force-password-change/${userId}`);
				return response.data;
			},
		});

	return {
		useChangePassword,
		useGetUserData,
		useNotifications,
		useUpdateProfile,
		useUpdateProfileById,
		useChangePasswordById,
		useGetSignedUrl,
		useUpdateCompany,
		useUnreadNotificationCount,
		useMarkAllAsRead,
		useMarkAsRead,
		useUpdateNotificationPreferences,
		useGetNotificationPreferences,
		useForcePasswordChangeForCompany,
		useForcePasswordChangeForUser,
	};
};
