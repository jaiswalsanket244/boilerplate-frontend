import type { FilterState } from "@/types/tabs";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";

import { productListFilterColumns } from "@/module/stripe-payment/utils/constants";

import { getQueryString } from "@/lib/utils/url-query-string";
import { useStripePaymentApi } from "@/module/stripe-payment/hooks/useStripePaymentApi";

const initialFilterState: FilterState = {
	search: "",
	sorting: [],
	filters: [],
	page: 1,
	pageSize: 10,
};

export function useProductList() {
	const { useProductsQuery } = useStripePaymentApi();
	const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);

	const queryKey = useMemo(
		() =>
			getQueryString({
				filters: queryFilters,
				sorting: filterState.sorting,
				searchTerm: filterState.search,
				filterableColumns: productListFilterColumns,
				page: filterState.page,
				pageSize: filterState.pageSize,
			}),
		[filterState, queryFilters]
	);

	const { data, isLoading, refetch } = useProductsQuery(queryKey);
	const { data: products = [], pagination } = data || {};

	// --- State Updaters ---
	const updateFilterState = useCallback(
		(updates: Partial<FilterState>) => setFilterState((prev) => ({ ...prev, ...updates })),
		[]
	);

	const handlePageChange = useCallback(
		(page: number) => {
			updateFilterState({ page });
		},
		[updateFilterState]
	);

	const handlePageSizeChange = useCallback(
		(pageSize: number) => {
			updateFilterState({ pageSize, page: 1 });
		},
		[updateFilterState]
	);

	const handleSortingChange = useCallback(
		(newSorting: SortingState | ((old: SortingState) => SortingState)) => {
			const updated = typeof newSorting === "function" ? newSorting(filterState.sorting) : newSorting;
			updateFilterState({ sorting: updated, page: 1 });
		},
		[filterState.sorting, updateFilterState]
	);

	const handleFilterChange = useCallback(
		(newFilters: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
			const updated = typeof newFilters === "function" ? newFilters(filterState.filters) : newFilters;
			updateFilterState({ filters: updated });
		},
		[filterState.filters, updateFilterState]
	);

	const handleApplyFilters = useCallback(
		(applied: ColumnFiltersState) => {
			setQueryFilters(applied);
			updateFilterState({ filters: applied, page: 1 });
		},
		[updateFilterState]
	);

	const debouncedSearch = useMemo(
		() =>
			debounce((term: string) => {
				updateFilterState({ search: term, page: 1 });
			}, 1000),
		[updateFilterState]
	);

	const handleSearchChange = useCallback((searchTerm: string) => debouncedSearch(searchTerm), [debouncedSearch]);

	return {
		isLoading,
		refetch,
		products,
		pagination,
		filterState,
		updateFilterState,
		handleSortingChange,
		handleFilterChange,
		handleApplyFilters,
		handlePageChange,
		handlePageSizeChange,
		handleSearchChange,
	};
}
