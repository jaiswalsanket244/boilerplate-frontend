"use client";

import React, { useState } from "react";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";
import { DataTabs } from "@/components/common/tabs/data-tabs";
import { type ITransaction, TRANSACTION_TAB_KEYS } from "@/module/stripe-payment/types";
import {
	TRANSACTIONS_TABS_STATUS,
	transactionTabs,
	vendorTransactionKeys,
	vendorTransactionsFilterColumns,
	vendorTransactionsSortableColumns,
} from "@/module/stripe-payment/utils/constants";
import TransactionsTable from "@/module/stripe-payment/components/vendor-transactions/transactions-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { DataResponse, TableActions } from "@/types/tabs";
import { ExportButton } from "@/module/stripe-payment/components/vendor-transactions/export-button";
import { getQueryString } from "@/lib/utils/url-query-string";
import { FILTER_TYPE } from "@/types/filters";

const TransactionsStripePayment = () => {
	const { useTransactionCountQuery, useTransactionsQuery } = useStripePaymentApi();

	const { data: tabCounts } = useTransactionCountQuery();

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
	const { data: transactionResponse, isLoading: isTransactionsLoading } = useTransactionsQuery(
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

	const { data: transactions, pagination } = transactionResponse || {};
	// Transform API response to match DataResponse interface
	const transformedData: DataResponse<ITransaction> | null = transactions
		? {
				data: transactions,
				totalCount: pagination?.totalPages || 0,
				currentPage: pagination?.currentPage || 1,
				totalPages: pagination?.totalPages || 1,
			}
		: null;

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
			params.filters[statusFilterIndex].value = TRANSACTIONS_TABS_STATUS[tab];
		} else if (tab !== TRANSACTION_TAB_KEYS.ALL_PAYMENTS) {
			params.filters.push({
				id: vendorTransactionKeys.PAYMENT_STATUS,
				value: TRANSACTIONS_TABS_STATUS[tab],
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
			tabs={transactionTabs}
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
};

export default TransactionsStripePayment;
