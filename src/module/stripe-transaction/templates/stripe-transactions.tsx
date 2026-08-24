"use client";

import { DataTabs } from "@/components/common/tabs/data-tabs";
import { getQueryString } from "@/lib/utils/url-query-string";
import TransactionsTable from "@/module/stripe-transaction/components/transactions-table";
import { useStripeAPI } from "@/module/stripe-transaction/hooks/useStripe";
import {
	STRIPE_TRANSACTION_TAB_KEYS,
	type ITransaction,
	type TStripeTransactionsTab,
} from "@/module/stripe-transaction/types";
import {
	FILTER_KEYS,
	stripeTransactionsFilterColumns,
	stripeTransactionsSortableColumns,
	TABS_TRANSACTION_STATUS,
} from "@/module/stripe-transaction/utils/constants";
import { FILTER_TYPE } from "@/types/filters";
import type { DataResponse, TabConfig, TableActions } from "@/types/tabs";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { ExportButton } from "@/module/stripe-transaction/components/export-button";

const PAGE_SIZE = 10;

export default function StripeTransactions() {
	const { useGetAllTransactionsQuery, useTransactionsCountQuery } = useStripeAPI();
	const [queryParams, setQueryParams] = useState({
		tab: STRIPE_TRANSACTION_TAB_KEYS.ALL_PAYMENTS,
		search: "",
		sorting: [] as SortingState,
		filters: [] as ColumnFiltersState,
		page: 1,
		pageSize: PAGE_SIZE,
	});
	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);

	const { data: transactionResponse, isLoading } = useGetAllTransactionsQuery(
		getQueryString({
			filters: queryFilters,
			sorting: queryParams.sorting,
			searchTerm: queryParams.search,
			page: queryParams.page,
			pageSize: queryParams.pageSize,
			filterableColumns: [
				...stripeTransactionsFilterColumns,
				{ key: FILTER_KEYS.PAYMENT_STATUS, type: FILTER_TYPE.RADIO, label: "Status" },
			],
		})
	);
	const { data: transactionCount } = useTransactionsCountQuery();

	const { data: transactions, pagination } = transactionResponse || {};

	const transformedData: DataResponse<ITransaction> | null = transactionResponse
		? {
				data: transactions || [],
				totalCount: pagination?.totalPages || 0,
				currentPage: pagination?.currentPage || 1,
				totalPages: pagination?.totalPages || 1,
			}
		: null;

	const tabs: TabConfig<STRIPE_TRANSACTION_TAB_KEYS>[] = [
		{
			key: STRIPE_TRANSACTION_TAB_KEYS.ALL_PAYMENTS,
			label: "All Payments",
		},
		{
			key: STRIPE_TRANSACTION_TAB_KEYS.COMPLETED,
			label: "Completed",
		},
		{
			key: STRIPE_TRANSACTION_TAB_KEYS.PENDING,
			label: "Pending",
		},
		{
			key: STRIPE_TRANSACTION_TAB_KEYS.CANCELLED,
			label: "Cancelled",
		},
	];

	const tableActions: TableActions = [<ExportButton key={"export"} />];

	const handleTabChange = (
		tab: STRIPE_TRANSACTION_TAB_KEYS,
		params: {
			search: string;
			sorting: SortingState;
			filters: ColumnFiltersState;
			page: number;
			pageSize: number;
		}
	) => {
		const statusFilterIndex = params.filters.findIndex((f) => f.id === FILTER_KEYS.PAYMENT_STATUS);

		if (statusFilterIndex !== -1 && params.filters[statusFilterIndex]?.value) {
			params.filters[statusFilterIndex].value = TABS_TRANSACTION_STATUS[tab];
		} else if (tab !== STRIPE_TRANSACTION_TAB_KEYS.ALL_PAYMENTS) {
			params.filters.push({
				id: FILTER_KEYS.PAYMENT_STATUS,
				value: TABS_TRANSACTION_STATUS[tab],
			});
		} else if (tab === STRIPE_TRANSACTION_TAB_KEYS.ALL_PAYMENTS) {
			params.filters = params.filters.filter((f) => f.id !== FILTER_KEYS.PAYMENT_STATUS);
		}
		if (tab !== queryParams.tab) {
			setQueryFilters(params.filters);
		}
		setQueryParams({
			tab,
			search: params.search,
			sorting: params.sorting,
			filters: params.filters,
			page: params.page,
			pageSize: params.pageSize,
		});
	};

	const transformedTabCounts: Record<STRIPE_TRANSACTION_TAB_KEYS, number> = {
		"all-payments": transactionCount?.allPayments || 0,
		completed: transactionCount?.completed || 0,
		pending: transactionCount?.pending || 0,
		cancelled: transactionCount?.refunded || 0,
	};

	const applyFilters = (filters: ColumnFiltersState) => {
		setQueryFilters(filters);
	};

	return (
		<DataTabs
			tabs={tabs}
			defaultTab={STRIPE_TRANSACTION_TAB_KEYS.ALL_PAYMENTS}
			data={transformedData}
			isLoading={isLoading}
			onTabChange={handleTabChange}
			searchPlaceholder="Search transactions..."
			sortableColumns={stripeTransactionsSortableColumns}
			filterableColumns={stripeTransactionsFilterColumns}
			actions={tableActions}
			TableComponent={TransactionsTable}
			defaultPageSize={PAGE_SIZE}
			tabCounts={transformedTabCounts}
			onApplyFilters={applyFilters}
		/>
	);
}
