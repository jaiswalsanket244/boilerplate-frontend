"use client";
import { useState } from "react";

import { getQueryString } from "@/lib/utils/url-query-string";
import OrderHistoryTable from "@/module/stripe-payment/components/orders/order-history-table";
import type { DataResponse, TabConfig } from "@/types/tabs";
import { DataTabs } from "@/components/common/tabs/data-tabs";
import { ORDER_HISTORY_TABS, type IOrderDetails } from "@/module/stripe-payment/types";
import {
	ORDER_HISTORY_TABS_STATUS,
	userOrderHistoryFilterColumns,
	userOrderHistorySortableColumns,
	vendorTransactionsFilterColumns,
} from "@/module/stripe-payment/utils/constants";
import { FILTER_TYPE } from "@/types/filters";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";

export default function UserOrderHistory() {
	const { useUserOrdersQuery, useUserOrdersCountQuery } = useStripePaymentApi();

	const [queryParams, setQueryParams] = useState({
		tab: ORDER_HISTORY_TABS.ALL_ORDERS,
		search: "",
		sorting: [] as SortingState,
		filters: [] as ColumnFiltersState,
		page: 1,
		pageSize: 10,
	});
	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);

	const { data: ordersData, isLoading } = useUserOrdersQuery(
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

	const { data: tabCounts } = useUserOrdersCountQuery();

	const { data: orders, pagination } = ordersData || {};

	const transformedData: DataResponse<IOrderDetails> | null = ordersData
		? {
				data: orders || [],
				totalCount: pagination?.totalPages || 0,
				currentPage: pagination?.currentPage || 1,
				totalPages: pagination?.totalPages || 1,
			}
		: null;

	const tabs: TabConfig<ORDER_HISTORY_TABS>[] = [
		{
			key: ORDER_HISTORY_TABS.ALL_ORDERS,
			label: "All Payments",
		},
		{
			key: ORDER_HISTORY_TABS.COMPLETED,
			label: "Completed",
		},
		{
			key: ORDER_HISTORY_TABS.CANCELLED,
			label: "Cancelled",
		},
	];

	const handleTabChange = (
		tab: ORDER_HISTORY_TABS,
		params: {
			search: string;
			sorting: SortingState;
			filters: ColumnFiltersState;
			page: number;
			pageSize: number;
		}
	) => {
		const statusFilterIndex = params.filters.findIndex((f) => f.id === "paymentStatus");

		if (statusFilterIndex !== -1 && params.filters[statusFilterIndex]?.value) {
			params.filters[statusFilterIndex].value = ORDER_HISTORY_TABS_STATUS[tab];
		} else if (tab !== ORDER_HISTORY_TABS.ALL_ORDERS) {
			params.filters.push({
				id: "paymentStatus",
				value: ORDER_HISTORY_TABS_STATUS[tab],
			});
		} else if (tab === ORDER_HISTORY_TABS.ALL_ORDERS) {
			params.filters = params.filters.filter((f) => f.id !== "paymentStatus");
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

	const transformedTabCounts: Record<ORDER_HISTORY_TABS, number> = {
		"all-orders": tabCounts?.allPayments || 0,
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
			defaultTab={ORDER_HISTORY_TABS.ALL_ORDERS}
			data={transformedData}
			isLoading={isLoading}
			onTabChange={handleTabChange}
			searchPlaceholder="Search products..."
			sortableColumns={userOrderHistorySortableColumns}
			filterableColumns={userOrderHistoryFilterColumns}
			TableComponent={OrderHistoryTable}
			defaultPageSize={10}
			tabCounts={transformedTabCounts}
			onApplyFilters={applyFilters}
		/>
	);
}
