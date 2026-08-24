"use client";

import { DataTabs } from "@/components/common/tabs/data-tabs";
import { getQueryString } from "@/lib/utils/url-query-string";
import { ExportButton } from "@/module/stripe-connect/components/vendor-transactions/all-vendor-transactions/export-button";
import TransactionsTable from "@/module/stripe-connect/components/vendor-transactions/all-vendor-transactions/transactions-table";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { TRANSACTION_TAB_KEYS, Transactions } from "@/module/stripe-connect/types";
import {} from "@/module/stripe-connect/types";
import {
	TABS_STATUS,
	vendorTransactionKeys,
	vendorTransactionsFilterColumns,
	vendorTransactionsSortableColumns,
} from "@/module/stripe-connect/utils/constants";
import { FILTER_TYPE } from "@/types/filters";
import type { DataResponse, TabConfig, TableActions } from "@/types/tabs";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useState } from "react";

export default function AllVendorTransactions() {
	const { useTransactionDetailsQuery, useTransactionCountsQuery } = useStripeConnectAPI();

	const [queryParams, setQueryParams] = useState({
		tab: TRANSACTION_TAB_KEYS.ALL_PAYMENTS,
		search: "",
		sorting: [] as SortingState,
		filters: [] as ColumnFiltersState,
		page: 1,
		pageSize: 10,
	});
	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);

	// Fetch data for current tab with current parameters
	const { data: transactionResponse, isLoading: isTransactionsLoading } = useTransactionDetailsQuery(
		getQueryString({
			filters: queryFilters,
			sorting: queryParams.sorting,
			searchTerm: queryParams.search,
			page: queryParams.page,
			pageSize: queryParams.pageSize,
			filterableColumns: [
				...vendorTransactionsFilterColumns,
				{ key: "paymentStatus", type: FILTER_TYPE.RADIO, label: "Status" },
			],
		})
	);

	// Fetch tab counts (you might want to cache this or fetch less frequently)
	const { data: tabCounts } = useTransactionCountsQuery();

	const { data: transactionDetails, pagination } = transactionResponse || {};
	// Transform API response to match DataResponse interface
	const transformedData: DataResponse<Transactions> | null = transactionResponse
		? {
				data: (transactionDetails || []).map(
					(tx): Transactions => ({
						user: {
							name: {
								first: tx.buyerName?.first || "",
								last: tx.buyerName?.last || "",
							},
						},
						product: { name: tx.productName || "" },
						amount: tx.price,
						status: tx.paymentStatus,
						createdAt: tx.purchaseDate || new Date().toISOString(),
					})
				),
				totalCount: pagination?.totalPages || 0,
				currentPage: pagination?.currentPage || 1,
				totalPages: pagination?.totalPages || 1,
			}
		: null;

	// Tab configuration
	const tabs: TabConfig<TRANSACTION_TAB_KEYS>[] = [
		{
			key: TRANSACTION_TAB_KEYS.ALL_PAYMENTS,
			label: "All Payments",
		},
		{
			key: TRANSACTION_TAB_KEYS.COMPLETED,
			label: "Completed",
		},
		{
			key: TRANSACTION_TAB_KEYS.PENDING,
			label: "Pending",
		},
		{
			key: TRANSACTION_TAB_KEYS.CANCELLED,
			label: "Cancelled",
		},
	];

	const tableActions: TableActions = [<ExportButton key={"export"} />];

	const handleTabChange = (
		tab: TRANSACTION_TAB_KEYS,
		params: {
			search: string;
			sorting: SortingState;
			filters: ColumnFiltersState;
			page: number;
			pageSize: number;
		}
	) => {
		const statusFilterIndex = params.filters.findIndex((f) => f.id === vendorTransactionKeys.PAYMENT_STATUS);

		if (statusFilterIndex !== -1 && params.filters[statusFilterIndex]?.value) {
			params.filters[statusFilterIndex].value = TABS_STATUS[tab];
		} else if (tab !== TRANSACTION_TAB_KEYS.ALL_PAYMENTS) {
			params.filters.push({
				id: vendorTransactionKeys.PAYMENT_STATUS,
				value: TABS_STATUS[tab],
			});
		} else if (tab === TRANSACTION_TAB_KEYS.ALL_PAYMENTS) {
			params.filters = params.filters.filter((f) => f.id !== vendorTransactionKeys.PAYMENT_STATUS);
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

	const transformedTabCounts: Record<TRANSACTION_TAB_KEYS, number> = {
		"all-payments": tabCounts?.allPayments || 0,
		completed: tabCounts?.completed || 0,
		pending: tabCounts?.pending || 0,
		cancelled: tabCounts?.refunded || 0,
	};
	const applyFilters = (filters: ColumnFiltersState) => {
		setQueryFilters(filters);
	};

	return (
		<DataTabs
			tabs={tabs}
			defaultTab={TRANSACTION_TAB_KEYS.ALL_PAYMENTS}
			data={transformedData}
			isLoading={isTransactionsLoading}
			onTabChange={handleTabChange}
			searchPlaceholder="Search transactions..."
			sortableColumns={vendorTransactionsSortableColumns}
			filterableColumns={vendorTransactionsFilterColumns}
			actions={tableActions}
			TableComponent={TransactionsTable}
			defaultPageSize={10}
			tabCounts={transformedTabCounts}
			onApplyFilters={applyFilters}
		/>
	);
}
