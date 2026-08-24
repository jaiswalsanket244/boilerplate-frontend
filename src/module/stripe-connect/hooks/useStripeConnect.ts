import { apiClient } from "@/lib/api";
import type {
	GetAllTransactionsResponseType,
	GetAllTransactionsType,
	GetAllTransferredTransactionsResponseType,
	GetAllTransferredTransactionsType,
	GetCustomerResponseType,
	GetEarningDetailsResponseType,
	GetEarningsResponseType,
	GetVendorResponseType,
	IProductListResponse,
	ITransactionCountsResponse,
	ITransactionDetailsResponse,
	IUserOrdersResponse,
	IVendorListResponse,
	PaginatedVendorSearchQuery,
	PostAccountResponseType,
	PostAccountSessionResponseType,
	PostAccountSessionType,
	PostCustomerIdResponseType,
	PostDashboardLinkResponseType,
	PostEarlyTransferResponseType,
	PostPaymentIntentResponseType,
	PostProductResponseType,
	PostProductType,
	PostRefundResponseType,
	PostVendorResponseType,
	PostVendorType,
	UpdateProductType,
} from "@/module/stripe-connect/types";
import { TIME_FRAMES } from "@/types/filters";
import { useMutation, useQuery } from "@tanstack/react-query";

const API_SUPER_ADMIN_URL = "/super-admin/stripe";
const API_ADMIN_URL = "/admin/stripe-connect";
const API_USER_URL = "/stripe-connect";

export const useStripeConnectAPI = () => {
	// ---------------------------
	// Part of `Super Admin` flow
	// ---------------------------
	const useUpdateVendorMutation = () =>
		useMutation({
			mutationFn: async ({ stripeAccountId }: PostVendorType) => {
				const res = await apiClient.put<PostVendorResponseType>(`${API_SUPER_ADMIN_URL}/vendor/${stripeAccountId}`);
				return res.data;
			},
		});

	const useGetAllVendorsQuery = (query: PaginatedVendorSearchQuery) => {
		return useQuery({
			queryKey: ["vendors", "super-admin-vendors", query?.searchValue, query?.page, query?.pageSize],
			queryFn: async () => {
				const res = await apiClient.get<IVendorListResponse>(`${API_SUPER_ADMIN_URL}/vendors`, { params: query });
				return res.data.data;
			},
		});
	};

	// ---------------------
	// Part of `Admin` flow
	// ---------------------
	const usePostAccountMutation = useMutation({
		mutationFn: async () => {
			const res = await apiClient.post<PostAccountResponseType>(`${API_ADMIN_URL}/account`);
			return res.data;
		},
	});

	const usePostAccountSessionMutation = useMutation({
		mutationFn: async ({ accountId }: PostAccountSessionType) => {
			const res = await apiClient.post<PostAccountSessionResponseType>(`${API_ADMIN_URL}/account-session`, {
				accountId,
			});
			return res.data;
		},
	});

	const useExpressDashboardLinkMutation = () =>
		useMutation({
			mutationFn: async () => {
				const res = await apiClient.post<PostDashboardLinkResponseType>(`${API_ADMIN_URL}/express-dashboard`);
				return res.data.data;
			},
		});

	const usePostProductMutation = () => {
		return useMutation({
			mutationFn: async ({ title, price }: PostProductType) => {
				const res = await apiClient.post<PostProductResponseType>(`${API_ADMIN_URL}/product`, {
					title,
					price,
				});
				return res.data.data;
			},
		});
	};

	const useEditProductMutation = () => {
		return useMutation({
			mutationFn: async ({ id, title, price }: UpdateProductType) => {
				const res = await apiClient.put<PostProductResponseType>(`${API_ADMIN_URL}/product/${id}`, { title, price });
				return res.data.data;
			},
		});
	};

	const useDeleteProductMutation = () => {
		return useMutation({
			mutationFn: async ({ productId }: { productId: string }) => {
				const res = await apiClient.delete<PostProductResponseType>(`${API_ADMIN_URL}/product/${productId}`);
				return res.data.data;
			},
		});
	};

	const usePostEarlyTransferMutation = () =>
		useMutation({
			mutationFn: async () => {
				const res = await apiClient.post<PostEarlyTransferResponseType>(`${API_ADMIN_URL}/early-transfer`);
				return res.data.data;
			},
		});

	const useGetAllTransactionsQuery = ({ page, pageSize }: GetAllTransactionsType) => {
		return useQuery({
			queryKey: ["all-transactions", page, pageSize],
			queryFn: async () => {
				const res = await apiClient.get<GetAllTransactionsResponseType>(`${API_ADMIN_URL}/all-transactions`, {
					params: { page, pageSize },
				});
				return res.data.data;
			},
		});
	};

	const useTransactionDetailsQuery = (query?: string) => {
		const queryString = query ? `?${query}` : "";
		return useQuery({
			queryKey: ["all-transaction-details", query],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionDetailsResponse>(`${API_ADMIN_URL}/transactions${queryString}`);
				return res.data.data;
			},
			staleTime: 10 * 1000,
		});
	};

	const useGetAllTransferredTransactionsQuery = ({
		limit,
		startingAfter,
		endingBefore,
		page,
	}: GetAllTransferredTransactionsType) => {
		return useQuery({
			queryKey: ["transferred-transactions", limit, page],
			queryFn: async () => {
				let url = `${API_ADMIN_URL}/transferred-transactions?limit=${limit}`;
				if (startingAfter) {
					url += `&starting_after=${startingAfter}`;
				} else if (endingBefore) {
					url += `&ending_before=${endingBefore}`;
				}
				const res = await apiClient.get<GetAllTransferredTransactionsResponseType>(url);
				return res.data.data;
			},
		});
	};

	const useGetEarningDetailsQuery = () => {
		return useQuery({
			queryKey: ["earning-details"],
			queryFn: async () => {
				const res = await apiClient.get<GetEarningDetailsResponseType>(`${API_ADMIN_URL}/earning-details`);
				return res.data.data;
			},
		});
	};

	const useGetVendorQuery = () => {
		return useQuery({
			queryKey: ["vendor"],
			queryFn: async () => {
				const res = await apiClient.get<GetVendorResponseType>(`${API_ADMIN_URL}/vendor-details`);
				return res.data.data;
			},
		});
	};

	const useGetEarningsQuery = (type: TIME_FRAMES) => {
		return useQuery({
			queryKey: ["earnings", type],
			queryFn: async () => {
				const res = await apiClient.get<GetEarningsResponseType>(`${API_ADMIN_URL}/earnings?type=${type}`);
				return res.data.data;
			},
			enabled: !!type,
		});
	};

	// --------------------
	// Part of `User` flow
	// --------------------
	const usePostPaymentIntentMutation = useMutation({
		mutationFn: async (productId: string) => {
			const res = await apiClient.post<PostPaymentIntentResponseType>(`${API_USER_URL}/create-payment-intent`, {
				productId,
			});
			return res.data.data;
		},
	});

	const usePostCustomerIdMutation = useMutation({
		mutationFn: async () => {
			const res = await apiClient.post<PostCustomerIdResponseType>(`${API_USER_URL}/customer`);
			return res.data.data;
		},
	});

	const usePostRefundMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await apiClient.post<PostRefundResponseType>(`${API_USER_URL}/refund/${id}`);
			return res.data;
		},
	});

	const useGetAllProductsQuery = (query?: string) => {
		const queryString = query ? `?${query}` : "";

		return useQuery({
			queryKey: ["stripe-connect-products", query],
			queryFn: async () => {
				const res = await apiClient.get<IProductListResponse>(`${API_USER_URL}/product${queryString}`);
				return res.data.data;
			},
		});
	};

	const useGetAllOrdersQuery = (query?: string) => {
		const queryString = query ? `?${query}` : "";

		return useQuery({
			queryKey: ["stripe-connect-orders", query],
			queryFn: async () => {
				const res = await apiClient.get<IUserOrdersResponse>(`${API_USER_URL}/past-orders${queryString}`);
				return res.data.data;
			},
		});
	};

	const useGetCustomerQuery = () => {
		return useQuery({
			queryKey: ["stripe-connect-customer"],
			queryFn: async () => {
				const res = await apiClient.get<GetCustomerResponseType>(`${API_USER_URL}/customer`);
				return res.data.data;
			},
		});
	};

	const useTransactionCountsQuery = () => {
		return useQuery({
			queryKey: ["transaction-counts"],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionCountsResponse>(`${API_ADMIN_URL}/transactions/count`);
				return res.data.data;
			},
		});
	};
	const useOrderHistoryCountQuery = () => {
		return useQuery({
			queryKey: ["past-order-counts"],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionCountsResponse>(`${API_USER_URL}/past-orders/count`);
				return res.data.data;
			},
		});
	};

	const exportTransactions = () => {
		return apiClient.get(`${API_ADMIN_URL}/transactions/export`, {
			responseType: "blob",
		});
	};

	return {
		useUpdateVendorMutation,
		usePostAccountMutation,
		usePostAccountSessionMutation,
		useExpressDashboardLinkMutation,
		usePostPaymentIntentMutation,
		usePostCustomerIdMutation,
		usePostRefundMutation,
		usePostProductMutation,
		useEditProductMutation,
		useDeleteProductMutation,
		usePostEarlyTransferMutation,
		useGetAllProductsQuery,
		useGetAllOrdersQuery,
		useGetAllTransactionsQuery,
		useGetAllTransferredTransactionsQuery,
		useGetEarningDetailsQuery,
		useGetVendorQuery,
		useGetCustomerQuery,
		useGetEarningsQuery,
		useGetAllVendorsQuery,
		useTransactionDetailsQuery,
		useTransactionCountsQuery,
		useOrderHistoryCountQuery,
		exportTransactions,
	};
};
