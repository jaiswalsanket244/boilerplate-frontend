import type { PaginatedSearchQuery } from "@/types";
import type { ApiResponse } from "@/types/api-response";
import { TIME_FRAMES } from "@/types/filters";
import type { PaginatedResponse } from "@/types/pagination";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { z } from "zod";

// ------------------
// react-query types
// ------------------
export type PostAccountResponseType = {
	success: boolean;
	message: string;
	data: { accountId: string };
	errors: object;
};

export type PostAccountSessionResponseType = {
	success: boolean;
	message: string;
	data: { clientSecret: string };
	errors: object;
};

export type PostAccountSessionType = {
	accountId: string;
};

export type GetAllProductsResponseType = {
	success: boolean;
	message: string;
	data: ProductInfo[];
	errors: object;
};

export type ProductInfo = {
	_id: string;
	title: string;
	price: number;
};

export type PostPaymentIntentResponseType = {
	success: boolean;
	message: string;
	data: {
		clientSecret: string;
		paymentIntentId: string;
	};
	errors: object;
};

export type PostCustomerIdResponseType = {
	success: boolean;
	message: string;
	data: object;
	errors: object;
};

export type GetAllOrdersResponseType = {
	success: boolean;
	message: string;
	data: OrderDetails[];
	errors: object;
};

export interface IUserOrdersResponse extends ApiResponse<PaginatedResponse<OrderDetails>> {}

export type OrderDetails = {
	_id: string;
	productRef: string;
	amountPaid: number;
	orderPlacedAt: Date;
	isRefundEligible: boolean;
	daysSinceOrder: number;
	productName: string;
	refunded: boolean;
};

export type PostRefundResponseType = {
	success: boolean;
	message: string;
	data: object;
	errors: object;
};

export type PostDashboardLinkResponseType = {
	success: boolean;
	message: string;
	data: {
		url: string;
	};
	errors: object;
};

export type PostProductType = {
	title: string;
	price: number;
};

export type UpdateProductType = {
	id: string;
	title: string;
	price: number;
};

export type DeleteProductType = {
	id: string;
	companyRef: string;
};

export type PostProductResponseType = {
	success: boolean;
	message: string;
	data: object;
	errors: object;
};

export type PostEarlyTransferResponseType = {
	success: boolean;
	message: string;
	data: object;
	errors: object;
};

export type GetVendorResponseType = {
	success: boolean;
	message: string;
	data: VendorData | undefined;
	errors: object;
};

export type VendorData = {
	stripeAccountId: string;
	isDetailsSubmitted: boolean;
	isTransfersActive: boolean;
};

export type GetCustomerResponseType = {
	success: boolean;
	message: string;
	data: {
		stripeCustomerId: string;
	};
	errors: object;
};

export type GetAllTransferredTransactionsResponseType = {
	success: boolean;
	message: string;
	data: {
		data: TransferredTransactionType[];
		has_more: boolean;
	};
	errors: object;
};

export type TransferredTransactionType = {
	id: string;
	type: "refund" | "charge" | string;
	net: number; // => (net = amount - fee);
	amount: number;
	fee: number; // stripe fee
	currency: string;
	description: string;
	source: string;
	created: number;
};

export type GetAllTransferredTransactionsType = {
	limit: number;
	startingAfter?: string;
	endingBefore?: string;
	page: number;
};

export type GetAllTransactionsType = {
	page: number;
	pageSize: number;
};

export type GetAllTransactionsResponseType = {
	success: boolean;
	message: string;
	data: [{ items: AllTransactionType[]; total: number; page: number; pageSize: number }];
	errors: object;
};

export type AllTransactionType = {
	_id: string;
	amountPaid: number;
	paymentStatus: string;
	orderPlacedAt: string;
	refunded: boolean;
	transferStatus: string;
	productRef: string;
	stripeCustomerId: string;
};

export interface ITransactionCounts {
	allPayments: number;
	refunded: number;
	pending: number;
	completed: number;
}

export interface ITransactionCountsResponse extends ApiResponse<ITransactionCounts> {}

export interface ITransactionDetailsResponse extends ApiResponse<PaginatedResponse<ITransactionDetails>> {}

export interface ITransactionDetails {
	_id: string;
	buyerName: {
		first?: string;
		last?: string;
	};
	productName: string;
	price: number;
	purchaseDate?: string;
	paymentStatus: STRIPE_CONNECT_PAYMENT_STATUS;
	refunded: boolean;
}

export type GetEarningDetailsResponseType = {
	success: boolean;
	message: string;
	data: EarningDetailsType;
	errors: object;
};

export type EarningDetailsType = {
	totalEarning: number;
	totalPending: number;
	totalTransferred: number;
};

type EarningsData = { month: string; earnings: number }[];

export type GetEarningsResponseType = {
	success: boolean;
	message: string;
	data: EarningsData;
	errors: object;
};

export type PostVendorType = {
	stripeAccountId: string;
};

export type PostVendorResponseType = {
	success: boolean;
	message: string;
	data: object;
	errors: object;
};

export type GetVendorsResponseType = {
	success: boolean;
	message: string;
	data: [{ items: VendorType[]; total: number; page: number; pageSize: number }];
	errors: object;
};

export type VendorType = {
	_id: string;
	stripeAccountId: string;

	userRef: {
		email: string;
	};
};

export type PaginatedVendorSearchQuery = Omit<PaginatedSearchQuery, "companyRef">;

// ----------------
// component types
// ----------------
export type VendorOnboardingType = {
	accountId: string;
};

export type RefundAlertType = {
	order: OrderDetails;
	handleRefund: (id: string) => void;
};

export interface ProductModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess: () => void;
	product?: ProductInfo;
	mode?: "create" | "edit";
}

export type CursorType = {
	startingAfter?: string;
	endingBefore?: string;
};

export type PageChangeType = {
	newPage: number;
	startingAfter?: string;
	endingBefore?: string;
};

export type TransferredTransactionsTableType = {
	isSuccess: boolean;
	transactions: { data: TransferredTransactionType[]; has_more: boolean } | undefined;
	size: "sm" | "md" | "lg";
};

export type TransferredTransactionsTableFooterType = {
	page: number;
	pageSize: number;
	handlePageChange: (params: PageChangeType) => void;
	handlePageSizeChange: (newPageSize: number) => void;
	transactions:
		| {
				data: TransferredTransactionType[];
				has_more: boolean;
		  }
		| undefined;
};

export type AllTransactionsTableType = {
	isSuccess: boolean;
	size: "sm" | "md" | "lg";
	transactions: AllTransactionType[] | undefined;
};

export type AllTransactionsTableFooterType = {
	page: number;
	pageSize: number;
	handlePageChange: (newPage: number) => void;
	handlePageSizeChange: (newPageSize: number) => void;
	transactions: AllTransactionType[] | undefined;
	totalPages: number;
};

export type InfoIconType = {
	label: string;
};

export type EarlyTransferAlertType = {
	vendorData: VendorData;
	handleEarlyTransfer: () => void;
	transferInProgress: boolean;
	earningDetails: EarningDetailsType | undefined;
};

export type ProductsTableDataType = {
	data: ProductInfo[];
	sorting: SortingState;
	filters: ColumnFiltersState;
	setSorting: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
	setFilters: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
};

// export type TRANSACTIONS_TAB_TYPE = "all-payments" | "completed" | "pending" | "cancelled";
export enum TRANSACTION_TAB_KEYS {
	ALL_PAYMENTS = "all-payments",
	COMPLETED = "completed",
	PENDING = "pending",
	CANCELLED = "cancelled",
}

export enum PAYMENT_STATUS {
	PENDING = "pending",
	PAID = "paid",
	REFUNDED = "refunded",
}

export interface Transactions {
	user: {
		name: {
			first: string;
			last: string;
		};
	};
	product: {
		name: string;
	};
	amount: number;
	status: STRIPE_CONNECT_PAYMENT_STATUS;
	createdAt: string;
}

export interface TransactionsTableType {
	data: Transactions[];
	sorting: SortingState;
	setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters: ColumnFiltersState;
	setFilters: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: TRANSACTION_TAB_KEYS;
}

export type PeriodType = "monthly" | "yearly" | "weekly";

export type EarningsChartProps = {
	data: EarningsData;
	period: TIME_FRAMES;
	onPeriodChange: (p: PeriodType) => void;
};

// ------
// enums
// ------
export enum APPEARANCE {
	STRIPE = "stripe",
	FLOATING = "floating",
}

export enum TRANSACTION_TYPE {
	PAYMENT = "payment",
	PAYOUT = "payout",
}

export enum NOT_APPLICABLE {
	N_A = "N/A",
}

export enum REFUND_STATUS {
	YES = "Yes",
	NO = "No",
}

export enum RECOVERY_STATUS {
	RECOVERED = "recovered",
	PARTIALLY_RECOVERED = "partially_recovered",
	NOT_APPLICABLE = "not_applicable",
}

export enum STRIPE_CONNECT_PAYMENT_STATUS {
	PENDING = "pending", // created payment intent but not paid yet
	PAID = "paid", // Payment done successfully
	REFUNDED = "refunded", // paid but refunded/cancelled the order
}

// -------------------
// form related types
// -------------------
export const productFormSchema = z.object({
	title: z.string().min(1, { message: "This field is required" }),
	price: z
		.string()
		.min(1, { message: "This field is required" })
		.refine((value) => !isNaN(parseFloat(value)) && isFinite(Number(value)), {
			message: "Price must be a valid number",
		})
		.transform((value) => parseFloat(value)),
});

export type CreateProductType = z.infer<typeof productFormSchema>;

export enum ORDER_HISTORY_TABS {
	ALL_ORDERS = "all-orders",
	COMPLETED = "completed",
	PENDING = "pending",
	CANCELLED = "cancelled",
}

export interface IOrderHistoryTableProps {
	data: OrderDetails[];
	sorting: SortingState;
	setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters: ColumnFiltersState;
	setFilters: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: ORDER_HISTORY_TABS;
}

export interface IProductListResponse extends ApiResponse<PaginatedResponse<ProductInfo>> {}

export interface IVendor {
	_id: string;
	stripeAccountId: string;

	email: string;
	name: string;
}
export interface IVendorListResponse extends ApiResponse<PaginatedResponse<IVendor>> {}

export interface IVendorsTableProps {
	data: IVendor[];
}
export interface IVendorTierChangeAlertProps {
	vendor: IVendor;
	handleUpdate: () => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}
