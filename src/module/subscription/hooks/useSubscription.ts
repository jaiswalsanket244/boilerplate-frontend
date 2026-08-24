import { apiClient } from "@/lib/api";
import { getUserCookies } from "@/lib/utils/cookies";
import type {
	PlanDetailsType,
	SubscribeApiResponse,
	SubscriptionPlanType,
	SubscriptionType,
} from "@/module/subscription/types/index";
import { useMutation, useQuery } from "@tanstack/react-query";

const SUBSCRIPTION_API_URL = "/admin/subscription";

export const useSubscriptionAPI = () => {
	const useGetSubscriptions = (userId: string) => {
		return useQuery<SubscriptionType>({
			queryKey: ["subscription", userId],
			queryFn: async () => {
				const { companyRef } = getUserCookies();
				const response = await apiClient.get<{ data: SubscriptionType }>(`${SUBSCRIPTION_API_URL}/`, {
					params: { companyRef },
				});
				return response.data.data;
			},
			enabled: !!userId, // only fetch when userId is truthy
			refetchOnWindowFocus: false,
		});
	};

	const useCancelSubscription = useMutation({
		mutationFn: async (subId: string) => {
			const response = await apiClient.put<SubscribeApiResponse>(`${SUBSCRIPTION_API_URL}/cancel`, {
				subId,
			});
			return response.data;
		},
	});

	const useNewSubscription = useMutation({
		mutationFn: async (priceId: string) => {
			const response = await apiClient.post<SubscribeApiResponse>(`${SUBSCRIPTION_API_URL}/`, {
				priceId,
			});
			return response.data;
		},
	});

	const useUpdateSubscription = useMutation({
		mutationFn: async (payload: PlanDetailsType) => {
			const response = await apiClient.post<SubscribeApiResponse>(`${SUBSCRIPTION_API_URL}/plans`, payload);
			return response.data;
		},
	});

	const useGetSubscriptionPlans = (userId: string) => {
		return useQuery<SubscriptionPlanType[]>({
			queryKey: ["subscriptionPlans", userId],
			queryFn: async () => {
				const response = await apiClient.get<{ data: SubscriptionPlanType[] }>(`${SUBSCRIPTION_API_URL}/plans`);
				return response.data.data;
			},
			enabled: !!userId, // only fetch when userId is truthy
			refetchOnWindowFocus: false,
		});
	};

	return {
		useCancelSubscription,
		useGetSubscriptions,
		useNewSubscription,
		useGetSubscriptionPlans,
		useUpdateSubscription,
	};
};
