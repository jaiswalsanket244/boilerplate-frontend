import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	ICreatePaymentIntentResponse,
	TCreateProductInput,
	ICreateProductResponse,
	IDeleteProductResponse,
	IEarningChartDataResponse,
	TEditProductInput,
	IEditProductResponse,
	IProductsResponse,
	IRefundOrderResponse,
	ISessionStatusResponse,
	ITransactionResponse,
	IUserOrdersCountResponse,
	IUserOrdersResponse,
	ITransactionCountResponse,
	TCreateCouponInput,
	IGetCouponsQueryOptions,
	ICreateCouponResponse,
	IDeleteCouponResponse,
	ICreatePromotionCodeResponse,
	IPromotionCode,
	IGetPromotionCodesQueryOptions,
	IGetPromotionCodesResponse,
	IDeletePromotionCodeResponse,
	ICreatePromotionCodeBody,
	IGetCouponListResponse,
	IGetCouponResponse,
} from "@/module/stripe-payment/types";
import { apiClient } from "@/lib/api";
import type { ApiError } from "@/types/api-response";

const API_USER_URL = "/stripe-payment";
const API_ADMIN_URL = "/admin/stripe-payment";

export const useStripePaymentApi = () => {
	/** Query hooks */

	const useProductsQuery = (queryString?: string) => {
		return useQuery({
			queryKey: ["stripe-payment-products", queryString],
			queryFn: async () => {
				const res = await apiClient.get<IProductsResponse>(`${API_USER_URL}/product?${queryString || ""}`);
				return res.data.data;
			},
		});
	};

	const useSessionStatusQuery = (sessionId: string | null) => {
		return useQuery({
			queryKey: ["stripe-payment-session-status"],
			queryFn: async () => {
				const res = await apiClient.get<ISessionStatusResponse>(
					`${API_USER_URL}/session-status?sessionId=${sessionId as string}`
				);
				return res.data.data;
			},
			enabled: !!sessionId, // only run if sessionId is given
		});
	};

	const useEarningChartDataQuery = (timeFrame: string) => {
		return useQuery({
			queryKey: ["stripe-payment-chart-data", timeFrame],
			queryFn: async () => {
				const res = await apiClient.get<IEarningChartDataResponse>(`${API_ADMIN_URL}/earning-chart?type=${timeFrame}`);
				return res.data.data;
			},
		});
	};

	const useUserOrdersQuery = (queryString?: string) => {
		return useQuery({
			queryKey: ["stripe-payment-user-orders", queryString],
			queryFn: async () => {
				const res = await apiClient.get<IUserOrdersResponse>(`${API_USER_URL}/orders?${queryString || ""}`);
				return res.data.data;
			},
		});
	};
	const useUserOrdersCountQuery = () => {
		return useQuery({
			queryKey: ["stripe-payment-user-orders-count"],
			queryFn: async () => {
				const res = await apiClient.get<IUserOrdersCountResponse>(`${API_USER_URL}/orders/count`);
				return res.data.data;
			},
		});
	};

	const useTransactionsQuery = (queryString?: string) => {
		return useQuery({
			queryKey: ["stripe-payment-transactions", queryString],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionResponse>(`${API_ADMIN_URL}/transactions?${queryString || ""}`);
				return res.data.data;
			},
		});
	};

	const useTransactionCountQuery = () => {
		return useQuery({
			queryKey: ["stripe-payment-transactions-count"],
			queryFn: async () => {
				const res = await apiClient.get<ITransactionCountResponse>(`${API_ADMIN_URL}/transactions/count`);
				return res.data.data;
			},
		});
	};

	const usePromotionCodesQuery = ({
		couponId,
		limit,
		startingAfter,
		endingBefore,
		page,
	}: IGetPromotionCodesQueryOptions) => {
		return useQuery({
			queryKey: ["stripe-payment-promotion-codes", couponId, limit, page],
			queryFn: async () => {
				let url = `${API_ADMIN_URL}/promotion-code/${couponId}?limit=${limit}`;
				if (startingAfter) {
					url += `&starting_after=${startingAfter}`;
				} else if (endingBefore) {
					url += `&ending_before=${endingBefore}`;
				}
				const res = await apiClient.get<IGetPromotionCodesResponse>(url);
				return res.data.data;
			},
			staleTime: 10 * 60 * 1000, // 10 minutes
		});
	};

	const useCouponListQuery = ({ limit, startingAfter, endingBefore, page }: IGetCouponsQueryOptions) => {
		let url = `${API_ADMIN_URL}/coupon?limit=${limit}`;
		if (startingAfter) {
			url += `&starting_after=${startingAfter}`;
		} else if (endingBefore) {
			url += `&ending_before=${endingBefore}`;
		}
		return useQuery({
			queryKey: ["stripe-payment-coupons", limit, page],
			queryFn: async () => {
				const res = await apiClient.get<IGetCouponListResponse>(url);
				return res.data.data;
			},
			staleTime: 10 * 60 * 1000, // 10 minutes
		});
	};

	const useCouponQuery = (couponId: string) => {
		return useQuery({
			queryKey: ["stripe-payment-coupons", couponId],
			queryFn: async () => {
				const res = await apiClient.get<IGetCouponResponse>(`${API_ADMIN_URL}/coupon/${couponId}`);
				return res.data.data;
			},
			staleTime: 10 * 60 * 1000, // 10 minutes
		});
	};

	/** Mutation hooks */

	const useCreateProductMutation = () => {
		return useMutation({
			mutationFn: async (data: TCreateProductInput) => {
				const res = await apiClient.post<ICreateProductResponse>(`${API_ADMIN_URL}/product`, data);
				return res.data.data;
			},
		});
	};

	const useEditProductMutation = () => {
		return useMutation({
			mutationFn: async (data: TEditProductInput) => {
				const res = await apiClient.put<IEditProductResponse>(`${API_ADMIN_URL}/product/${data.id}`, data);
				return res.data.data;
			},
		});
	};

	const useDeleteProductMutation = () => {
		return useMutation({
			mutationFn: async ({ productId }: { productId: string }) => {
				const res = await apiClient.delete<IDeleteProductResponse>(`${API_ADMIN_URL}/product/${productId}`);
				return res.data.data;
			},
		});
	};

	const useCheckoutSessionMutation = () => {
		return useMutation({
			mutationFn: async (productId: string) => {
				const res = await apiClient.post<ICreatePaymentIntentResponse>(`${API_USER_URL}/create-checkout-session`, {
					productId,
				});
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};

	const useRefundMutation = () => {
		return useMutation({
			mutationFn: async (id: string) => {
				const res = await apiClient.post<IRefundOrderResponse>(`${API_USER_URL}/refund/${id}`);
				return res.data.data;
			},
		});
	};

	const exportTransactions = () => {
		return apiClient.get(`${API_ADMIN_URL}/transactions/export`, {
			responseType: "blob",
		});
	};

	const useCreateCouponMutation = () => {
		return useMutation({
			mutationFn: async (coupon: TCreateCouponInput) => {
				const res = await apiClient.post<ICreateCouponResponse>(`${API_ADMIN_URL}/coupon`, coupon);
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};
	const useEditCouponMutation = () => {
		return useMutation({
			mutationFn: async ({ payload, id }: { payload: { name: string }; id: string }) => {
				const res = await apiClient.put<ICreateCouponResponse>(`${API_ADMIN_URL}/coupon/${id}`, payload);
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};

	const useDeleteCouponMutation = () => {
		return useMutation({
			mutationFn: async (id: string) => {
				const res = await apiClient.delete<IDeleteCouponResponse>(`${API_ADMIN_URL}/coupon/${id}`);
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};

	const useCreatePromotionCodeMutation = () => {
		return useMutation({
			mutationFn: async (payload: ICreatePromotionCodeBody) => {
				const res = await apiClient.post<ICreatePromotionCodeResponse>(`${API_ADMIN_URL}/promotion-code`, payload);
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};

	const useUpdatePromotionCodeMutation = () => {
		return useMutation({
			mutationFn: async ({ id, payload }: { id: string; payload: Partial<IPromotionCode> }) => {
				const res = await apiClient.put<IDeletePromotionCodeResponse>(`${API_ADMIN_URL}/promotion-code/${id}`, payload);
				return res.data.data;
			},
			onError: (error: ApiError) => error,
		});
	};

	return {
		useProductsQuery,
		useSessionStatusQuery,
		useEarningChartDataQuery,
		useUserOrdersQuery,
		useUserOrdersCountQuery,
		useTransactionsQuery,
		useTransactionCountQuery,
		useCouponListQuery,
		useCouponQuery,
		usePromotionCodesQuery,

		// mutations
		useCreateProductMutation,
		useEditProductMutation,
		useDeleteProductMutation,
		useCheckoutSessionMutation,
		useRefundMutation,

		useDeleteCouponMutation,
		useCreateCouponMutation,
		useEditCouponMutation,
		useCreatePromotionCodeMutation,
		useUpdatePromotionCodeMutation,

		exportTransactions,
	};
};
