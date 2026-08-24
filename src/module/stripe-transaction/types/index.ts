import type { ApiResponse } from "@/types/api-response";
import type { PaginatedResponse } from "@/types/pagination";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface ITransaction {
	_id: string;
	paymentStatus: PAYMENT_STATUS;
	refunded: boolean;
	transferStatus: TRANSFER_STATUS;
	createdAt: string;
	purchaseDate: string | undefined;
	vendor: {
		email: string;
		name: string;
	};
	user: {
		email: string;
		name: string;
	};
	product: {
		name: string;
		vendorId: string;
		price: number;
	};
	amount: number;
}

export type TTransactionsResponse = ApiResponse<PaginatedResponse<ITransaction>>;

export interface ITransactionCounts {
	allPayments: number;
	refunded: number;
	pending: number;
	completed: number;
}

export interface ITransactionCountsResponse extends ApiResponse<ITransactionCounts> {}

export type GetAllTransactionsType = {
	limit: number;
	startingAfter?: string;
	endingBefore?: string;
	page: number;
};

export type PageChangeType = {
	newPage: number;
	startingAfter?: string;
	endingBefore?: string;
};

// component types
export type TransactionsTableFooterType = {
	page: number;
	pageSize: number;
	handlePageChange: (newPage: number) => void;
	handlePageSizeChange: (newPageSize: number) => void;
	totalPages: number;
};

export type TStripeTransactionsTab = "all-payments" | "completed" | "pending" | "cancelled";

export enum STRIPE_TRANSACTION_TAB_KEYS {
	ALL_PAYMENTS = "all-payments",
	COMPLETED = "completed",
	PENDING = "pending",
	CANCELLED = "cancelled",
}

interface StatusConfig {
	label: string;
	color: "green" | "yellow" | "red" | "gray";
}

export interface StatusBadgeProps {
	status: string;
	config: Record<string, StatusConfig>;
}

export interface IStripeTransactionsTableProps {
	data: ITransaction[];
	sorting: SortingState;
	setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	filters: ColumnFiltersState;
	setFilters: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
	activeTab: STRIPE_TRANSACTION_TAB_KEYS;
}

export type CursorType = {
	startingAfter?: string;
	endingBefore?: string;
};

export enum TRANSACTION_TYPE {
	TRANSFER = "transfer",
	REFUND = "refund",
}

export enum PAYMENT_STATUS {
	PENDING = "pending",
	PAID = "paid",
	REFUNDED = "refunded",
}

export enum TRANSFER_STATUS {
	PENDING = "pending",
	SUCCEEDED = "succeeded",
	FAILED = "failed",
}
