"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PiPlusBold } from "react-icons/pi";

import FilterControl from "@/components/common/filter/filter-control";
import { Pagination } from "@/components/common/pagination/pagination";
import SearchBox from "@/components/common/search-box/search-box";
import { SortControl } from "@/components/common/sort/sort";
import { Button } from "@/components/ui/button";

import CreateProductModal from "@/module/stripe-payment/components/products/create-product-modal";
import ProductsTable from "@/module/stripe-payment/components/products/products-table";

import { useProductList } from "@/module/stripe-payment/hooks/useProductList";
import { productListFilterColumns, productListSortableColumns } from "@/module/stripe-payment/utils/constants";
import { useMenuStore } from "@/stores/menu-store";
import { canAccess } from "@/lib/utils/access-check";
import { PERMISSIONS } from "@/types/permission";

export default function StripePaymentProductList() {
	const permissions = useMenuStore().permissions;

	const [isModalOpen, setIsModalOpen] = useState(false);

	const {
		isLoading,
		refetch,
		products,
		pagination,
		filterState,
		handleSortingChange,
		handleFilterChange,
		handleApplyFilters,
		handlePageChange,
		handlePageSizeChange,
		handleSearchChange,
	} = useProductList();

	const showAdminActions = canAccess(permissions, PERMISSIONS.STRIPE_PAYMENT_PRODUCTS_MANAGE);

	return (
		<>
			{/* --- Header Controls --- */}
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
						onApplyFilters={handleApplyFilters}
						className="max-w-sm"
					/>
				</div>

				{showAdminActions && (
					<Button onClick={() => setIsModalOpen(true)}>
						<PiPlusBold className="me-1.5 h-4 w-4" />
						Add Product
					</Button>
				)}
			</div>

			{/* --- Main Content --- */}
			{isLoading ? (
				<div className="flex h-60 items-center justify-center">
					<Loader2 className="text-primary h-8 w-8 animate-spin" />
				</div>
			) : products.length > 0 ? (
				<div className="space-y-4">
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
				</div>
			) : (
				<div className="flex h-[50vh] flex-col items-center justify-center gap-3">
					<Image src="/assets/png/no-products.png" alt="No Data" width={250} height={200} />
					<p className="text-xl font-semibold text-gray-600">No Products to show</p>
				</div>
			)}

			{/* --- Modal --- */}
			{showAdminActions && (
				<CreateProductModal open={isModalOpen} setOpen={setIsModalOpen} onSuccess={() => void refetch()} />
			)}
		</>
	);
}
