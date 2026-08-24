import { apiClient } from "@/lib/api";
import type { ITransactionCountsResponse, TTransactionsResponse } from "@/module/stripe-transaction/types";
import { useQuery } from "@tanstack/react-query";

const API_SUPER_ADMIN_URL = "/super-admin/stripe";

export const useStripeAPI = () => {
	const useGetAllTransactionsQuery = (query?: string) => {
		const queryString = query ? `?${query}` : "";
		return useQuery({
			queryKey: ["stripe-transactions", query],
			queryFn: async () => {
				const res = await apiClient.get<TTransactionsResponse>(
					`${API_SUPER_ADMIN_URL}/stripe-transactions${queryString}`
				);
				return res.data.data;
			},
		});
	};
	const useTransactionsCountQuery = () => {
		return useQuery({
			queryKey: ["stripe-transactions-count"],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionCountsResponse>(`${API_SUPER_ADMIN_URL}/stripe-transactions/count`);
				return res.data.data;
			},
		});
	};

	const exportTransactions = () => {
		return apiClient.get(`${API_SUPER_ADMIN_URL}/stripe-transactions/export`, {
			responseType: "blob",
		});
	};

	return {
		useGetAllTransactionsQuery,
		useTransactionsCountQuery,
		exportTransactions,
	};
};
