import type { PaginatedResponse } from "@/types/pagination";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type z from "zod";
import type { couponSchema, productFormSchema, promotionCodeSchema } from "@/module/stripe-payment/utils/form-schema";
import type { ApiResponse } from "@/types/api-response";
import type { LineChartDataPoint } from "@/components/common/charts/line-chart-card";

/** ------------------------- Enums ------------------------- */

export enum ORDER_HISTORY_TABS {
	ALL_ORDERS = "all-orders",
	COMPLETED = "completed",
	PENDING = "pending",
	CANCELLED = "cancelled",
}

export enum APPEARANCE {
	STRIPE = "stripe",
	FLOATING = "floating",
}

export enum COUPON_VALIDITY {
	YES = "Yes",
	NO = "No",
}

export enum NOT_APPLICABLE {
	N_A = "N/A",
}

export enum DURATION {
	FOREVER = "forever",
	ONCE = "once",
	REPEATING = "repeating",
}

export enum CURRENCY {
	USD = "usd",
}

export enum DISCOUNT_TYPE {
	AMOUNT = "amount",
	PERCENT = "percent",
}

export enum SESSION_STATUS {
	COMPLETE = "complete",
}

export enum PAYMENT_STATUS {
	PENDING = "pending",
	PAID = "paid",
	REFUNDED = "refunded",
}

export enum TRANSACTION_TAB_KEYS {
	ALL_PAYMENTS = "all-payments",
	COMPLETED = "completed",
	PENDING = "pending",
	CANCELLED = "cancelled",
}

/** ------------------------- Types ------------------------- */ export interface IProduct {
	_id: string;
	title: string;
	price: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface IOrderDetails {
	_id: string;
	productRef: string;
	amountPaid: number;
	orderPlacedAt: Date;
	isRefundEligible: boolean;
	daysSinceOrder: number;
	productName: string;
	refunded: boolean;
}

export interface ITransaction {
	_id: string;
	userName: string;
	productName: string;
	amount: number;
	orderPlacedAt: Date;
	paymentStatus: PAYMENT_STATUS;
	refunded: boolean;
	createdAt: string;
}

export type TCreateProductInput = z.infer<typeof productFormSchema>;
export type TPromotionCodeInput = z.infer<typeof promotionCodeSchema>;

export type TEditProductInput = TCreateProductInput & {
	id: string;
};

export type TCreateCouponInput = z.infer<typeof couponSchema>;

export interface IGetCouponsQueryOptions {
	limit: number;
	startingAfter?: string;
	endingBefore?: string;
	page?: number;
}

export interface IPromotionCode {
	id: string;
	code: string;
	expires_at: number;
	max_redemptions?: number;
	times_redeemed: number;
	coupon: ICoupon;
	active: boolean;
}

export interface ICreatePromotionCodeBody {
	coupon: string;
	max_redemptions?: number;
	expires_at?: number;
	code: string;
}

export interface ICoupon {
	id: string;
	name: string;
	amount_off: number | null;
	currency: string | null;
	duration: DURATION;
	duration_in_months: number | null;
	max_redemptions: number | null;
	percent_off: number | null;
	redeem_by: number | null;
	times_redeemed: number;
	valid: boolean;
}

export interface IOrdersCount {
	allPayments: number;
	refunded: number;
	pending: number;
	completed: number;
}

export interface IGetPromotionCodesQueryOptions {
	couponId: string;
	limit: number;
	startingAfter?: string;
	endingBefore?: string;
	page: number;
}

/** ------------------------- Props ------------------------- */

export interface IProductsTableProps {
	data: IProduct[];
	sorting: SortingState;
	filters: ColumnFiltersState;
	setSorting?: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
	setFilters?: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
}

export interface IOrderHistoryTableProps {
	data: IOrderDetails[];
	sorting: SortingState;
	setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters: ColumnFiltersState;
	setFilters: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: ORDER_HISTORY_TABS;
}
export interface IPromotionCodeTableProps {
	data: IPromotionCode[];
	sorting?: SortingState;
	setSorting?: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters?: ColumnFiltersState;
	setFilters?: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
}

export interface ICouponsTableProps {
	data: ICoupon[];
	sorting?: SortingState;
	setSorting?: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters?: ColumnFiltersState;
	setFilters?: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
}

export interface ITransactionsTableProps {
	data: ITransaction[];
	sorting: SortingState;
	setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters: ColumnFiltersState;
	setFilters: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: TRANSACTION_TAB_KEYS;
}

export interface ProductModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess: () => void;
	product?: IProduct;
	mode?: "create" | "edit";
}

export interface IDeleteProductConfirmationProps {
	product: IProduct;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export interface ICheckoutFormProps {
	productId: string;
}

/** ------------------------- API Response Type ------------------------- */

export interface IProductsResponse extends ApiResponse<PaginatedResponse<IProduct>> {}
export interface IUserOrdersResponse extends ApiResponse<PaginatedResponse<IOrderDetails>> {}
export interface IUserOrdersCountResponse extends ApiResponse<IOrdersCount> {}
export interface ICreateProductResponse extends ApiResponse<IProduct> {}
export interface IEditProductResponse extends ApiResponse<IProduct> {}
export interface IDeleteProductResponse extends ApiResponse<boolean> {}
export interface ICreatePaymentIntentResponse extends ApiResponse<{ clientSecret: string; sessionId: string }> {}
export interface ISessionStatusResponse extends ApiResponse<{ status: string; customer_email: string }> {}
export interface IEarningChartDataResponse extends ApiResponse<LineChartDataPoint[]> {}
export interface IRefundOrderResponse extends ApiResponse<boolean> {}
export interface ITransactionResponse extends ApiResponse<PaginatedResponse<ITransaction>> {}
export interface ITransactionCountResponse extends ApiResponse<IOrdersCount> {}
export interface ICreateCouponResponse extends ApiResponse<ICoupon> {}
export interface IGetCouponListResponse extends ApiResponse<{ data: ICoupon[]; has_more: boolean }> {}
export interface IGetCouponResponse extends ApiResponse<ICoupon> {}
export interface IDeleteCouponResponse extends ApiResponse<boolean> {}
export interface ICreatePromotionCodeResponse extends ApiResponse<IPromotionCode> {}
export interface IDeletePromotionCodeResponse extends ApiResponse<IPromotionCode> {}
export interface IGetPromotionCodesResponse extends ApiResponse<{ data: IPromotionCode[]; has_more: boolean }> {}
