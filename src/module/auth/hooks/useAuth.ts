import { apiClient } from "@/lib/api";
import { getSessionStorage } from "@/lib/utils/session-storage";
import type {
	IAcceptInviteData,
	IEmailFromTokenResponse,
	IForgetPasswordData,
	IForgetPasswordResponse,
	IInitiateMfaSetupResponse,
	ILoginResponse,
	ILogoutResponse,
	IMfaResetIdentityVerifyResponse,
	IRegisterResponse,
	IRequestMagicLinkResponse,
	IRequestOtpParams,
	IRequestOtpResponse,
	IResendOtpResponse,
	IResetPasswordData,
	IResetPasswordResponse,
	ISendEmailOtpData,
	ISocialSignupResponse,
	IUserLoginData,
	IUserRegisterData,
	IVerifyMfaRecoveryCodeResponse,
	IVerifyMfaResponse,
	IVerifyMfaSetupResponse,
	IVerifyOtpParams,
	IVerifyOtpResponse,
	TMfaResetIdentityMethod,
} from "@/module/auth/types";

import { useMenuStore } from "@/stores/menu-store";
import { SESSION_STORAGE_KEYS } from "@/types";
import type { ApiError } from "@/types/api-response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import OneSignal from "react-onesignal";

const API_AUTH_URL = "/auth";

export const useAuthAPI = () => {
	const queryClient = useQueryClient();

	const useLoginMutation = () => {
		return useMutation({
			mutationFn: async (userData: IUserLoginData) => {
				const response = await apiClient.post<ILoginResponse>(`${API_AUTH_URL}/login`, userData);
				return response.data.data;
			},
			onSuccess: async (data: ILoginResponse["data"]) => {
				useMenuStore.getState().setMenuForUser(data.user);

				try {
					await OneSignal.login(data.user._id);
				} catch (error) {
					console.error("Error logging in:", error);
				}
			},
		});
	};

	const useRegisterMutation = () =>
		useMutation({
			mutationFn: async (userData: IUserRegisterData) => {
				const response = await apiClient.post<IRegisterResponse>(`${API_AUTH_URL}/register`, userData);
				return response.data.data;
			},
			onSuccess: (data: IRegisterResponse["data"]) => {
				useMenuStore.getState().setMenuForUser(data.user);
			},
			onError: (error: ApiError) => error,
		});

	const useSocialRegisterMutation = () => {
		return useMutation({
			mutationFn: async ({ code, provider, inviteToken }: { code: string; provider: string; inviteToken?: string }) => {
				const response = await apiClient.post<ISocialSignupResponse>(`${API_AUTH_URL}/social-signup`, {
					code,
					oauthProvider: provider,
					inviteToken,
				});
				return response.data.data;
			},
			onSuccess: (data: ISocialSignupResponse["data"]) => {
				if (data?.user) useMenuStore.getState().setMenuForUser(data.user);
			},
		});
	};

	const useLogoutMutation = useMutation({
		mutationFn: async () => {
			const response = await apiClient.post<ILogoutResponse>(`${API_AUTH_URL}/logout`);
			return response.data.data;
		},
		onSuccess: async () => {
			useMenuStore.getState().resetMenu();
			queryClient.clear();

			try {
				await OneSignal.logout();
			} catch (error) {
				console.error("Error logging out:", error);
			}
		},
	});

	const useForgetPasswordMutation = useMutation({
		mutationFn: async (userData: IForgetPasswordData) => {
			const response = await apiClient.post<IForgetPasswordResponse>(`${API_AUTH_URL}/reset-password`, userData);
			return response.data;
		},
	});

	const useUpdatePasswordMutation = useMutation({
		mutationFn: async ({ userData, token }: { userData: IResetPasswordData; token: string }) => {
			const response = await apiClient.post<IResetPasswordResponse>(`${API_AUTH_URL}/update-password`, {
				...userData,
				token,
			});
			return response.data;
		},
	});

	const useGetEmailsFromTokenMutation = () =>
		useMutation({
			mutationFn: async (data: IAcceptInviteData) => {
				const response = await apiClient.post<IEmailFromTokenResponse>(
					`${API_AUTH_URL}/invite/${data.inviteToken}`,
					data
				);
				return response.data;
			},
		});

	const useRequestMagicLinkMutation = useMutation({
		mutationFn: async (userData: ISendEmailOtpData) => {
			const response = await apiClient.post<IRequestMagicLinkResponse>(`${API_AUTH_URL}/magic-link/request`, userData);
			return response.data;
		},
	});

	const useVerifyMagicLinkMutation = useMutation({
		mutationFn: async (token: string) => {
			const response = await apiClient.post<ILoginResponse>(`${API_AUTH_URL}/magic-link/verify?token=${token}`);
			return response.data.data;
		},

		onSuccess: (data: ILoginResponse["data"]) => {
			useMenuStore.getState().setMenuForUser(data.user, false);
		},
	});

	const useRequestOtpMutation = () => {
		return useMutation({
			mutationFn: async (userData: IRequestOtpParams) => {
				const response = await apiClient.post<IRequestOtpResponse>(`${API_AUTH_URL}/request-otp`, userData);
				return response.data;
			},
		});
	};

	const useVerifyOtpMutation = () => {
		return useMutation({
			mutationFn: async (userData: IVerifyOtpParams) => {
				const response = await apiClient.post<IVerifyOtpResponse>(`${API_AUTH_URL}/verify-otp`, userData);
				return response.data.data;
			},
			onSuccess(data: IVerifyOtpResponse["data"]) {
				if (data.user) useMenuStore.getState().setMenuForUser(data.user);
			},
		});
	};

	const useResendOtpMutation = () => {
		return useMutation({
			mutationFn: async (userData: IRequestOtpParams) => {
				const response = await apiClient.post<IResendOtpResponse>(`${API_AUTH_URL}/resend-otp`, userData);
				return response.data;
			},
		});
	};

	const useMfaSetupQuery = () => {
		return useQuery({
			queryKey: ["mfa-setup-data"],
			queryFn: async () => {
				const response = await apiClient.post<IInitiateMfaSetupResponse>(`${API_AUTH_URL}/mfa/setup/initiate`);
				return response.data.data;
			},
			staleTime: Number.POSITIVE_INFINITY,
		});
	};

	const useVerifyMfaSetupMutation = () => {
		return useMutation({
			mutationFn: async (data: { code: string }) => {
				const response = await apiClient.post<IVerifyMfaSetupResponse>("/auth/mfa/setup/verify", data);

				return response.data.data;
			},
		});
	};

	const useMfaVerifyMutation = () => {
		return useMutation({
			mutationFn: async (data: { code: string }) => {
				const response = await apiClient.post<IVerifyMfaResponse>("/auth/mfa/verify", data);
				return response.data.data;
			},
		});
	};

	const useMfaRecoveryVerifyMutation = () => {
		return useMutation({
			mutationFn: async (data: { recoveryCode: string }) => {
				const response = await apiClient.post<IVerifyMfaRecoveryCodeResponse>("/auth/mfa/recovery", data);
				return response.data.data;
			},
		});
	};

	const useMfaRecoveryCodesQuery = () => {
		return useQuery<string[]>({
			queryKey: ["mfa-recovery-codes"],
			staleTime: 5 * 60 * 1000, // 5 minutes
			queryFn: async () => {
				return getSessionStorage<string[]>(SESSION_STORAGE_KEYS.RECOVERY_CODES) ?? [];
			},
		});
	};

	const useInitiateMfaResetEmailOtpMutation = () => {
		return useMutation({
			mutationFn: async () => {
				const response = await apiClient.post<IRequestOtpResponse>("/auth/mfa/reset/email/otp");
				return response.data.data;
			},
		});
	};

	const useVerifyMfaResetIdentityMutation = () => {
		return useMutation({
			mutationFn: async (data: { method: TMfaResetIdentityMethod; code: string }) => {
				const response = await apiClient.post<IMfaResetIdentityVerifyResponse>("/auth/mfa/reset/identity/verify", data);
				return response.data.data;
			},
		});
	};

	const useUpdateRecoveryReconfigureSessionMutation = () => {
		return useMutation({
			mutationFn: async () => {
				const response = await apiClient.post<void>("/auth/mfa/recovery/reset");
				return response.data;
			},
		});
	};

	const useSkipMfaSetupMutation = () => {
		return useMutation({
			mutationFn: async () => {
				const response = await apiClient.post<IVerifyMfaResponse>("/auth/mfa/setup/skip");
				return response.data.data;
			},
		});
	};

	const useDisableMfaMutation = () => {
		return useMutation({
			mutationFn: async () => {
				const response = await apiClient.put("/auth/mfa/disable");
				return response.data.data;
			},
		});
	};

	return {
		useLoginMutation,
		useRegisterMutation,
		useLogoutMutation,
		useForgetPasswordMutation,
		useUpdatePasswordMutation,
		useSocialRegisterMutation,
		useGetEmailsFromTokenMutation,

		useRequestMagicLinkMutation,
		useVerifyMagicLinkMutation,
		useRequestOtpMutation,
		useVerifyOtpMutation,
		useResendOtpMutation,

		useSkipMfaSetupMutation,
		useMfaSetupQuery,
		useVerifyMfaSetupMutation,
		useMfaVerifyMutation,
		useMfaRecoveryVerifyMutation,
		useMfaRecoveryCodesQuery,
		useInitiateMfaResetEmailOtpMutation,
		useVerifyMfaResetIdentityMutation,
		useUpdateRecoveryReconfigureSessionMutation,
		useDisableMfaMutation,
	};
};
