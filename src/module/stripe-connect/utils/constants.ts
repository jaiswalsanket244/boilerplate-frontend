import { type ORDER_HISTORY_TABS, PAYMENT_STATUS, type TRANSACTION_TAB_KEYS } from "@/module/stripe-connect/types";
import { FILTER_TYPE, type FilterColumn, type SortableColumn } from "@/types/filters";

export const productListSortableColumns: SortableColumn[] = [
	{ key: "price", label: "Price", ascLabel: "Low to High", descLabel: "High to Low" },
	{ key: "createdAt", label: "Date", ascLabel: "Oldest First", descLabel: "Newest First" },
];

export const productListFilterColumns: FilterColumn[] = [
	{
		key: "price",
		label: "Price",
		type: FILTER_TYPE.RANGE,
		min: 0,
		max: 1000,
		step: 10,
	},
];

export const orderListFilterColumns: FilterColumn[] = [
	{
		key: "amount",
		label: "Amount",
		type: FILTER_TYPE.RANGE,
		min: 0,
		max: 10000,
		step: 10,
	},
];

export const orderListSortableColumns: SortableColumn[] = [
	{ key: "amount", label: "Amount", ascLabel: "Low to High", descLabel: "High to Low" },
	{ key: "createdAt", label: "Date", ascLabel: "Oldest First", descLabel: "Newest First" },
];

export const vendorTransactionsFilterColumns: FilterColumn[] = [
	{
		key: "orderPlacedAt",
		label: "Order Placed At",
		type: FILTER_TYPE.DATERANGE,
	},
	{
		key: "amountPaid",
		label: "Amount Paid",
		type: FILTER_TYPE.RANGE,
		min: 1,
		max: 10000,
	},
];

export const vendorTransactionsSortableColumns: SortableColumn[] = [
	{
		key: "createdAt",
		label: "Date",
		ascLabel: "Oldest to Newest",
		descLabel: "Newest to Oldest",
	},
	{
		key: "price",
		label: "Amount",
		ascLabel: "Low to High",
		descLabel: "High to Low",
	},
];
export const vendorTransactionKeys = {
	PAYMENT_STATUS: "paymentStatus",
	AMOUNT_PAID: "amountPaid",
	ORDER_PLACED_AT: "orderPlacedAt",
	AMOUNT: "price",
	CREATED_AT: "createdAt",
};

export const userOrderHistoryFilterColumns: FilterColumn[] = [
	{
		key: "orderPlacedAt",
		label: "Order Placed At",
		type: FILTER_TYPE.DATERANGE,
	},
];

export const userOrderHistorySortableColumns: SortableColumn[] = [
	{
		key: "createdAt",
		label: "Date",
		ascLabel: "Oldest to Newest",
		descLabel: "Newest to Oldest",
	},
	{
		key: "amountPaid",
		label: "Amount",
		ascLabel: "Low to High",
		descLabel: "High to Low",
	},
];

export const TABS_STATUS: Record<TRANSACTION_TAB_KEYS, string> = {
	"all-payments": "all",
	completed: PAYMENT_STATUS.PAID,
	pending: PAYMENT_STATUS.PENDING,
	cancelled: PAYMENT_STATUS.REFUNDED,
};

export const ORDER_HISTORY_TABS_STATUS: Record<ORDER_HISTORY_TABS, string> = {
	"all-orders": "all",
	completed: PAYMENT_STATUS.PAID,
	pending: PAYMENT_STATUS.PENDING,
	cancelled: PAYMENT_STATUS.REFUNDED,
};
