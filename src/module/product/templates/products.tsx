"use client";

import { Pagination } from "@/components/common/pagination/pagination";
import SearchBox from "@/components/common/search-box/search-box";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/utils/access-check";
import { getUserCookies } from "@/lib/utils/cookies";
import ProductDialog from "@/module/product/components/create-edit-product-dialog";
import { ProductsTable } from "@/module/product/components/products-table";
import { useProductOperations, useProductSearch } from "@/module/product/hooks/useProductList";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/types/permission";
import { PiPlusBold } from "react-icons/pi";

export default function Products() {
	const { companyRef } = getUserCookies();

	const permissions = useMenuStore().permissions;
	const isAdmin = canAccess(permissions, PERMISSIONS.PRODUCTS_WRITE);

	const { value, debouncedValue, handleInputChange } = useProductSearch();

	const {
		products,
		pagination,
		setPage,
		isSuccess,
		refetchProducts,
		selectedProduct,
		dialogOpen,
		handleDeleteProduct,
		handleOpenCreateDialog,
		handleOpenEditDialog,
		handleCloseDialog,
	} = useProductOperations({ companyRef, searchValue: debouncedValue });

	return (
		<>
			<div className="items-centre mb-6 flex justify-between">
				<h1 className="text-3xl font-semibold">Products</h1>
				<div className="items-centre mt-4 flex gap-3 @lg:mt-0">
					{isAdmin && (
						<Button className="w-full @lg:w-auto" onClick={handleOpenCreateDialog} data-testid="add-product-button">
							<PiPlusBold className="me-1.5 size-4.25" />
							Add Products
						</Button>
					)}
				</div>
			</div>

			<ProductDialog
				open={dialogOpen}
				onOpenChange={handleCloseDialog}
				product={selectedProduct}
				id={selectedProduct?._id}
				refetchProducts={() => void refetchProducts()}
			/>

			<div className="mb-6 max-w-md">
				<SearchBox
					variant="outline"
					searchTerm={value}
					onSearchChange={handleInputChange}
					placeholder="Search products here"
					data-testid="search-box"
				/>
			</div>

			<ProductsTable
				products={products}
				isSuccess={isSuccess}
				onEdit={handleOpenEditDialog}
				onDelete={handleDeleteProduct}
			/>

			{pagination && (
				<Pagination
					totalItems={pagination.totalCount}
					page={pagination.currentPage}
					pageSize={pagination.pageSize}
					totalPages={pagination.totalPages}
					handlePageChange={setPage}
				/>
			)}
		</>
	);
}
