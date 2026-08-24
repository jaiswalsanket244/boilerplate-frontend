import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SetupIntentResponseType, GetCardsResponseType } from "@/module/cards/types";

const API_URL = "/admin/cards";

export const useCardsAPI = () => {
	// Fetch all saved cards
	const useGetCardsQuery = () =>
		useQuery({
			queryKey: ["cards"],
			queryFn: async () => {
				const res = await apiClient.get<GetCardsResponseType>(`${API_URL}`);
				return res.data.data;
			},
		});

	// Create SetupIntent → get client_secret
	const usePostCardMutation = () =>
		useMutation({
			mutationFn: async () => {
				const res = await apiClient.post<SetupIntentResponseType>(`${API_URL}/add`);
				return res;
			},
		});

	// Set default card
	const useSetDefaultCardMutation = () =>
		useMutation({
			mutationFn: async (paymentMethodId: string | null) => {
				const res = await apiClient.post(`${API_URL}/default`, { paymentMethodId });
				return res;
			},
		});

	return { usePostCardMutation, useGetCardsQuery, useSetDefaultCardMutation };
};
