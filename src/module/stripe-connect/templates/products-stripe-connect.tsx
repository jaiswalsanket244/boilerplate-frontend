"use client";

import FilterControl from "@/components/common/filter/filter-control";
import { Pagination } from "@/components/common/pagination/pagination";
import SearchBox from "@/components/common/search-box/search-box";
import { SortControl } from "@/components/common/sort/sort";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/utils/access-check";
import { getQueryString } from "@/lib/utils/url-query-string";
import CreateProductModal from "@/module/stripe-connect/components/products/create-product-modal";
import ProductsTable from "@/module/stripe-connect/components/products/products-table";
import { useStripeConnectAPI } from "@/module/stripe-connect/hooks/useStripeConnect";
import { productListFilterColumns, productListSortableColumns } from "@/module/stripe-connect/utils/constants";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";
import type { FilterState } from "@/types/tabs";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { PiPlusBold } from "react-icons/pi";

const initialFilterState: FilterState = {
	search: "",
	sorting: [],
	filters: [],
	page: 1,
	pageSize: 10,
};

export default function StripeConnectProductList() {
	const { useGetAllProductsQuery } = useStripeConnectAPI();

	const permissions = useMenuStore().permissions;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
	const [queryFilters, setQueryFilters] = useState<ColumnFiltersState>([]);

	const {
		data: productsData,
		isLoading,
		refetch,
	} = useGetAllProductsQuery(
		getQueryString({
			filters: queryFilters,
			sorting: filterState.sorting,
			searchTerm: filterState.search,
			filterableColumns: productListFilterColumns,
			page: filterState.page,
			pageSize: filterState.pageSize,
		})
	);

	const { data: products = [], pagination } = productsData || {};

	const updateFilterState = useCallback((updates: Partial<FilterState>) => {
		setFilterState((prev) => ({ ...prev, ...updates }));
	}, []);

	const debouncedSearch = useCallback(
		debounce((searchTerm: string) => {
			updateFilterState({ search: searchTerm, page: 1 });
		}, 1000),
		[updateFilterState]
	);

	const handleSearchChange = useCallback(
		(searchTerm: string) => {
			debouncedSearch(searchTerm);
		},
		[debouncedSearch]
	);

	const handleSortingChange = useCallback(
		(newSorting: SortingState | ((old: SortingState) => SortingState)) => {
			const updatedSorting = typeof newSorting === "function" ? newSorting(filterState.sorting) : newSorting;
			updateFilterState({ sorting: updatedSorting, page: 1 });
		},
		[filterState.sorting, updateFilterState]
	);

	const handleFilterChange = useCallback(
		(newFilters: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
			const updatedFilters = typeof newFilters === "function" ? newFilters(filterState.filters) : newFilters;
			updateFilterState({ filters: updatedFilters });
		},
		[filterState.filters, updateFilterState]
	);

	const handleApplyFilters = useCallback(
		(appliedFilters: ColumnFiltersState) => {
			setQueryFilters(appliedFilters);
			updateFilterState({ filters: appliedFilters, page: 1 });
		},
		[updateFilterState]
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

	return (
		<>
			<div className="my-5 flex flex-col gap-4 lg:flex-row">
				<div className="flex flex-1 items-center gap-3">
					<SearchBox variant="outline" onSearchChange={handleSearchChange} placeholder="Search here" />

					<SortControl
						sortableColumns={productListSortableColumns}
						sorting={filterState.sorting}
						onSortChange={handleSortingChange}
					/>

					<FilterControl
						filterableColumns={productListFilterColumns}
						filters={filterState.filters}
						onFilterChange={handleFilterChange}
						className="max-w-sm"
						onApplyFilters={handleApplyFilters}
					/>
				</div>

				{canAccess(permissions, PERMISSIONS.STRIPE_CONNECT_PRODUCTS_MANAGE) && (
					<Button
						type="button"
						className="bg-black text-white dark:bg-gray-100 dark:text-black"
						onClick={() => setIsModalOpen(true)}
					>
						<PiPlusBold className="me-1.5 h-4 w-4" />
						Add Product
					</Button>
				)}
			</div>

			{isLoading ? (
				<div className="flex h-60 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-gray-600" />
				</div>
			) : (
				<div className="space-y-4">
					{products.length > 0 ? (
						<>
							<ProductsTable
								data={products}
								sorting={filterState.sorting}
								setSorting={handleSortingChange}
								filters={filterState.filters}
								setFilters={handleFilterChange}
							/>

							<Pagination
								page={filterState.page}
								pageSize={filterState.pageSize}
								totalPages={pagination?.totalPages || 1}
								totalItems={pagination?.totalCount || 0}
								handlePageChange={handlePageChange}
								handlePageSizeChange={handlePageSizeChange}
							/>
						</>
					) : (
						<div className="flex h-[50vh] flex-1 flex-col items-center justify-center gap-3">
							<Image src="/assets/png/no-products.png" alt="No Data" width={250} height={200} />

							<p className="text-xl font-semibold text-gray-600">No Products to show</p>
						</div>
					)}
				</div>
			)}

			{canAccess(permissions, PERMISSIONS.STRIPE_CONNECT_PRODUCTS_MANAGE) && (
				<CreateProductModal
					open={isModalOpen}
					setOpen={setIsModalOpen}
					onSuccess={() => {
						void refetch();
					}}
				/>
			)}
		</>
	);
}
