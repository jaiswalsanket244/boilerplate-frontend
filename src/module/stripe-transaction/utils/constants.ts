import { FILTER_TYPE, type SortableColumn, type FilterColumn } from "@/types/filters";
import { PAYMENT_STATUS, type TStripeTransactionsTab } from "@/module/stripe-transaction/types";

export const stripeTransactionsFilterColumns: FilterColumn[] = [
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
	{
		key: "transferStatus",
		label: "Transfer Status",
		type: FILTER_TYPE.RADIO,
		options: [
			{ label: "Pending", value: "pending" },
			{ label: "Succeeded", value: "succeeded" },
			{ label: "Failed", value: "failed" },
		],
	},
];

export const stripeTransactionsSortableColumns: SortableColumn[] = [
	{
		key: "createdAt",
		label: "Date",
		ascLabel: "Oldest to Newest",
		descLabel: "Newest to Oldest",
	},
	{
		key: "amount",
		label: "Amount",
		ascLabel: "Low to High",
		descLabel: "High to Low",
	},
];

export const FILTER_KEYS = {
	DATE: "orderPlacedAt",
	AMOUNT_PAID: "amountPaid",
	TRANSFER_STATUS: "transferStatus",
	PAYMENT_STATUS: "paymentStatus",
	CREATED_AT: "createdAt",
};

export const TABS_TRANSACTION_STATUS: Record<TStripeTransactionsTab, string> = {
	"all-payments": "all",
	completed: PAYMENT_STATUS.PAID,
	pending: PAYMENT_STATUS.PENDING,
	cancelled: PAYMENT_STATUS.REFUNDED,
};
